import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type {
  StudyState,
  SummaryStyle,
  QuizDifficulty,
  DiagramType,
} from "@/types";
import { summarize, generateQuiz, generateDiagram, uploadPDF } from "@/lib/api";
import TextInput from "@/components/study/TextInput";
import PDFUploader from "@/components/study/PDFUploader";
import SummaryCard from "@/components/study/SummaryCard";
import QuizCard from "@/components/study/QuizCard";
import DiagramImage from "@/components/study/DiagramImage";

export default function Study() {
  const [state, setState] = useState<StudyState>({
    inputType: "text",
    content: "",
    file: null,
    summary: null,
    quiz: null,
    diagram: null,
    activeOutputTab: "summary",
    isLoading: false,
    error: null,
  });

  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>("brief");
  const [quizDifficulty, setQuizDifficulty] =
    useState<QuizDifficulty>("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [diagramType, setDiagramType] = useState<DiagramType>("mindmap");

  const handleContentChange = useCallback((content: string) => {
    setState((prev) => ({ ...prev, content }));
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, file, isLoading: true, error: null }));

    try {
      const response = await uploadPDF(file);
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          content: response.data!.text,
          isLoading: false,
        }));
        toast.success(
          `Extracted ${response.data.word_count} words from ${response.data.page_count} pages`,
        );
      } else {
        throw new Error(response.error?.message || "Failed to extract text");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      toast.error(message);
    }
  }, []);

  const handleSummarize = useCallback(async () => {
    if (!state.content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await summarize(state.content, summaryStyle);
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          summary: response.data!,
          activeOutputTab: "summary",
          isLoading: false,
        }));
        toast.success("Summary generated!");
      } else {
        throw new Error(response.error?.message || "Summarization failed");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Summarization failed";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      toast.error(message);
    }
  }, [state.content, summaryStyle]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!state.content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await generateQuiz(
        state.content,
        questionCount,
        quizDifficulty,
      );
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          quiz: response.data!,
          activeOutputTab: "quiz",
          isLoading: false,
        }));
        toast.success("Quiz generated!");
      } else {
        throw new Error(response.error?.message || "Quiz generation failed");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Quiz generation failed";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      toast.error(message);
    }
  }, [state.content, questionCount, quizDifficulty]);

  const handleGenerateDiagram = useCallback(async () => {
    if (!state.content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await generateDiagram(state.content, diagramType);
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          diagram: response.data!,
          activeOutputTab: "diagram",
          isLoading: false,
        }));
        toast.success("Diagram generated!");
      } else {
        throw new Error(response.error?.message || "Diagram generation failed");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Diagram generation failed";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      toast.error(message);
    }
  }, [state.content, diagramType]);

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground py-8 px-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Study Workspace</h1>
          <p className="text-muted-foreground mt-2">
            Enter your study material and let AI help you learn
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-5 md:p-6">
            <div>
              <h2 className="text-base font-semibold">Your study material</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Paste text or upload a PDF to get started.
              </p>
            </div>

            <Tabs
              value={state.inputType}
              onValueChange={(v) =>
                setState((prev) => ({
                  ...prev,
                  inputType: v as "text" | "pdf",
                }))
              }
            >
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted p-1">
                <TabsTrigger
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  value="text"
                >
                  Text
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  value="pdf"
                >
                  PDF
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <TextInput
                  value={state.content}
                  onChange={handleContentChange}
                  disabled={state.isLoading}
                />
              </TabsContent>
              <TabsContent value="pdf" className="mt-4">
                <PDFUploader
                  onUpload={handleFileUpload}
                  disabled={state.isLoading}
                  file={state.file}
                />
                {state.content && state.inputType === "pdf" && (
                  <div className="mt-4 rounded-lg border bg-muted p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Extracted text preview:
                    </p>
                    <p className="text-sm line-clamp-4">{state.content}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-md"
                onClick={handleSummarize}
                disabled={state.isLoading || !state.content.trim()}
              >
                {state.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Summarize
              </Button>
              <Button
                className="rounded-md"
                onClick={handleGenerateQuiz}
                disabled={state.isLoading || !state.content.trim()}
                variant="secondary"
              >
                {state.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Generate Quiz
              </Button>
              <Button
                className="rounded-md"
                onClick={handleGenerateDiagram}
                disabled={state.isLoading || !state.content.trim()}
                variant="outline"
              >
                {state.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Create Diagram
              </Button>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">Summary style:</label>
                <select
                  value={summaryStyle}
                  onChange={(e) =>
                    setSummaryStyle(e.target.value as SummaryStyle)
                  }
                  className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-foreground"
                >
                  <option value="brief">Brief</option>
                  <option value="detailed">Detailed</option>
                  <option value="bullet-points">Bullet Points</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground">
                  Quiz difficulty:
                </label>
                <select
                  value={quizDifficulty}
                  onChange={(e) =>
                    setQuizDifficulty(e.target.value as QuizDifficulty)
                  }
                  className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-foreground"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground">Questions:</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-foreground"
                >
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground">Diagram type:</label>
                <select
                  value={diagramType}
                  onChange={(e) =>
                    setDiagramType(e.target.value as DiagramType)
                  }
                  className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-foreground"
                >
                  <option value="mindmap">Mind Map</option>
                  <option value="flowchart">Flowchart</option>
                  <option value="concept-map">Concept Map</option>
                </select>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-5 md:p-6">
            <div>
              <h2 className="text-base font-semibold">AI results</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Switch tabs to view the summary, quiz, or diagram.
              </p>
            </div>

            <Tabs
              value={state.activeOutputTab}
              onValueChange={(v) =>
                setState((prev) => ({
                  ...prev,
                  activeOutputTab: v as "summary" | "quiz" | "diagram",
                }))
              }
            >
              <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted p-1">
                <TabsTrigger
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  value="summary"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  value="quiz"
                >
                  Quiz
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  value="diagram"
                >
                  Diagram
                </TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="mt-4">
                <SummaryCard summary={state.summary} />
              </TabsContent>
              <TabsContent value="quiz" className="mt-4">
                <QuizCard quiz={state.quiz} />
              </TabsContent>
              <TabsContent value="diagram" className="mt-4">
                <DiagramImage diagram={state.diagram} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
