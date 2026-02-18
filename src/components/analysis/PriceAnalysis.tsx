interface PriceAnalysisProps {
  price: number;
  assessment?: string;
}

const PriceAnalysis = ({ price, assessment }: PriceAnalysisProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
        Prisanalyse
      </h2>

      <div>
        <p className="text-2xl font-bold text-foreground">{price.toLocaleString("nb-NO")} kr</p>
        <p className="text-xs text-muted-foreground">Annonsepris</p>
      </div>

      {assessment && (
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-foreground/80 leading-relaxed">{assessment}</p>
        </div>
      )}
    </div>
  );
};

export default PriceAnalysis;
