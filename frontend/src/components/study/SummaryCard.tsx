import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Summary } from '@/types';

interface SummaryCardProps {
  summary: Summary | null;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground text-center">
            Click "Summarize" to generate a summary of your content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Summary
          <Badge variant="secondary">{summary.word_count} words</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="whitespace-pre-wrap">{summary.summary}</p>
        </div>

        {summary.key_points.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Key Points</h4>
            <ul className="list-disc list-inside space-y-1">
              {summary.key_points.map((point, index) => (
                <li key={index} className="text-muted-foreground">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.topics.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Topics</h4>
            <div className="flex flex-wrap gap-2">
              {summary.topics.map((topic, index) => (
                <Badge key={index} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
