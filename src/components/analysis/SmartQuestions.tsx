import { MessageCircleQuestion } from "lucide-react";

interface SmartQuestionsProps {
  questions: string[];
}

const SmartQuestions = ({ questions }: SmartQuestionsProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <MessageCircleQuestion className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          Spørsmål du bør stille selger
        </h2>
      </div>
      <ol className="space-y-2.5">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
              {i + 1}
            </span>
            <span className="text-foreground/80 leading-relaxed">{q}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default SmartQuestions;
