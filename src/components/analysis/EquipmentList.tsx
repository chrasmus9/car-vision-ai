import { Check } from "lucide-react";

interface EquipmentListProps {
  equipment: string[];
}

const EquipmentList = ({ equipment }: EquipmentListProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
        Utstyr ({equipment.length})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {equipment.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentList;
