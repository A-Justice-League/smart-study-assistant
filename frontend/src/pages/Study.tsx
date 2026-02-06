import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Brain, BarChart3, Sparkles } from "lucide-react";
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-[72rem] mx-auto space-y-8">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Study Workspace
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your study materials with AI-powered summaries, quizzes, and visual diagrams
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Your Study Material</h2>
                  <p className="text-sm text-muted-foreground">
                    Paste text or upload a PDF to get started
                  </p>
                </div>
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
                <TabsList className="grid w-full grid-cols-2 h-11 bg-muted p-1">
                  <TabsTrigger 
                    value="text" 
                    className="data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pdf" 
                    className="data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    PDF Upload
                  </TabsTrigger>
                </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={state.inputType}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
                  className="mt-4"
                >
                  {state.inputType === "text" ? (
                    <TextInput
                      value={state.content}
                      onChange={handleContentChange}
                      disabled={state.isLoading}
                    />
                  ) : (
                    <PDFUploader
                      onUpload={handleFileUpload}
                      disabled={state.isLoading}
                      file={state.file}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </Tabs>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full h-11 gap-2 transition-all duration-200 hover:shadow-lg"
                      onClick={handleSummarize}
                      disabled={state.isLoading || !state.content.trim()}
                    >
                      <AnimatePresence initial={false} mode="wait">
                        {state.isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="icon"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      Summarize
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full h-11 gap-2 transition-all duration-200 hover:shadow-lg"
                      onClick={handleGenerateQuiz}
                      disabled={state.isLoading || !state.content.trim()}
                      variant="secondary"
                    >
                      <AnimatePresence initial={false} mode="wait">
                        {state.isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="icon"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Brain className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      Generate Quiz
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full h-11 gap-2 transition-all duration-200 hover:shadow-lg"
                      onClick={handleGenerateDiagram}
                      disabled={state.isLoading || !state.content.trim()}
                      variant="outline"
                    >
                      <AnimatePresence initial={false} mode="wait">
                        {state.isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="icon"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      Create Diagram
                    </Button>
                  </motion.div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Summary Style</label>
                    <select
                      value={summaryStyle}
                      onChange={(e) =>
                        setSummaryStyle(e.target.value as SummaryStyle)
                      }
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="brief">Brief</option>
                      <option value="detailed">Detailed</option>
                      <option value="bullet-points">Bullet Points</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Quiz Difficulty</label>
                    <select
                      value={quizDifficulty}
                      onChange={(e) =>
                        setQuizDifficulty(e.target.value as QuizDifficulty)
                      }
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Questions</label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="3">3</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Diagram Type</label>
                    <select
                      value={diagramType}
                      onChange={(e) =>
                        setDiagramType(e.target.value as DiagramType)
                      }
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="mindmap">Mind Map</option>
                      <option value="flowchart">Flowchart</option>
                      <option value="concept-map">Concept Map</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Output Section */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-linear-to-r from-primary/10 to-accent/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">AI Results</h2>
                  <p className="text-sm text-muted-foreground">
                    View your generated content below
                  </p>
                </div>
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
                <TabsList className="grid w-full grid-cols-3 h-11 bg-muted p-1">
                  <TabsTrigger 
                    value="summary" 
                    className="data-[state=active]:shadow-sm transition-all duration-200 gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger 
                    value="quiz" 
                    className="data-[state=active]:shadow-sm transition-all duration-200 gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Quiz
                  </TabsTrigger>
                  <TabsTrigger 
                    value="diagram" 
                    className="data-[state=active]:shadow-sm transition-all duration-200 gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Diagram
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={state.activeOutputTab}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
                    className="mt-6"
                  >
                    {state.activeOutputTab === "summary" && (
                      <SummaryCard summary={state.summary} isLoading={state.isLoading && state.activeOutputTab === "summary"} />
                    )}

                    {state.activeOutputTab === "quiz" && (
                      <QuizCard quiz={state.quiz} isLoading={state.isLoading && state.activeOutputTab === "quiz"} />
                    )}

                    {state.activeOutputTab === "diagram" && (
                      <DiagramImage diagram={state.diagram} isLoading={state.isLoading && state.activeOutputTab === "diagram"} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
