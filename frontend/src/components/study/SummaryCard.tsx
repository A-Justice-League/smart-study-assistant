import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, FileText } from 'lucide-react';
import type { Summary } from '@/types';

interface SummaryCardProps {
  summary: Summary | null;
  isLoading?: boolean;
}

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

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function SummaryCard({ summary, isLoading = false }: SummaryCardProps) {
  if (isLoading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Generating Summary</span>
              </div>
              <Skeleton className="h-6 w-16" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/6" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!summary) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="min-h-[300px] flex items-center justify-center border-dashed">
          <CardContent className="text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-muted">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium">
                  Ready to generate a summary
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Summarize" to transform your content
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Summary</span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Badge variant="secondary">{summary.word_count} words</Badge>
            </motion.div>
          </CardTitle>
        </CardHeader>
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <CardContent className="space-y-6">
            <motion.div variants={itemVariants}>
              <p className="whitespace-pre-wrap leading-relaxed">{summary.summary}</p>
            </motion.div>

            {summary.key_points.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Key Points
                </h4>
                <ul className="space-y-2">
                  {summary.key_points.map((point, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {summary.topics.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Topics
                </h4>
                <motion.div 
                  className="flex flex-wrap gap-2"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {summary.topics.map((topic, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                        {topic}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}
