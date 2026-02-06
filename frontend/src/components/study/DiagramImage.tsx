import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Image as ImageIcon } from 'lucide-react';
import type { Diagram } from '@/types';

interface DiagramImageProps {
  diagram: Diagram | null;
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

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function DiagramImage({ diagram, isLoading = false }: DiagramImageProps) {
  if (isLoading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="min-h-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Creating Diagram</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!diagram) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="min-h-96 flex items-center justify-center border-dashed">
          <CardContent className="text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-muted">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium">
                  Ready to visualize your content
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Create Diagram" to generate a visual representation
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
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>{diagram.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl overflow-hidden border bg-white shadow-sm"
          >
            <img
              src={diagram.image_url}
              alt={diagram.title}
              className="w-full h-auto"
              loading="lazy"
            />
          </motion.div>
          {diagram.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">{diagram.explanation}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
