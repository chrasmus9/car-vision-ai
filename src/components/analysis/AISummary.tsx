import { Sparkles } from "lucide-react";

const AISummary = () => {
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
      <p className="text-sm text-foreground/80 leading-relaxed">
        Denne BMW 318D fra 2009 selges til <strong>79 000 kr</strong> med{" "}
        <strong>217 000 km</strong> på telleren. Bilen er EU-godkjent frem til oktober 2027, 
        noe som er positivt. Diesel med bakhjulsdrift og automat er en vanlig konfigurasjon. 
        Kilometerstand er relativt høy for årsmodellen, men prisen reflekterer dette. 
        Selger er en forhandler (ATM AUTO AS), noe som gir 5 års reklamasjonsrett. 
        Vær oppmerksom på at bilen er <strong>16 år gammel</strong> og kan ha økt vedlikeholdsbehov.
        Sjekk service-historikk nøye og vurder en uavhengig tilstandsrapport.
      </p>
    </div>
  );
};

export default AISummary;
