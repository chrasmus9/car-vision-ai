import { Sparkles } from "lucide-react";

interface AISummaryProps {
  summary: string;
}

const AISummary = ({ summary }: AISummaryProps) => {
  return (
    <div className="bg-secondary/50 border border-primary/20 rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          AI-oppsummering
        </h2>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
    </div>
  );
};

export default AISummary;
