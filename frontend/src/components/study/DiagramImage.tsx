import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Diagram } from '@/types';

interface DiagramImageProps {
  diagram: Diagram | null;
}

export default function DiagramImage({ diagram }: DiagramImageProps) {
  if (!diagram) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground text-center">
            Click "Create Diagram" to generate a visual diagram from your content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{diagram.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg overflow-hidden border bg-white">
          <img
            src={diagram.image_url}
            alt={diagram.title}
            className="w-full h-auto"
          />
        </div>
        {diagram.explanation && (
          <p className="text-sm text-muted-foreground">{diagram.explanation}</p>
        )}
      </CardContent>
    </Card>
  );
}
