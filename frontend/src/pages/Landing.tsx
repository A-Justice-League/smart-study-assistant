import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Brain, ImageIcon } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Smart Summaries',
    description: 'Transform lengthy notes into concise, easy-to-understand summaries.',
  },
  {
    icon: Brain,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with AI-generated quizzes tailored to your material.',
  },
  {
    icon: ImageIcon,
    title: 'Visual Diagrams',
    description: 'Create concept maps and flowcharts to visualize relationships.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-[72rem] text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Study Smarter with{' '}
            <span className="text-primary">AI-Powered</span> Assistance
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your notes, PDFs, or paste text and let AI transform them into summaries,
            quizzes, and visual diagrams to accelerate your learning.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => navigate('/study')}
          >
            Start Studying
          </Button>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-[72rem] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-none shadow-lg">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
