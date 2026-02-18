interface SpecsGridProps {
  car: {
    year: number;
    mileage: string;
    fuel: string;
    gearbox: string;
    power: string;
    drivetrain: string;
    body: string;
    color: string;
    weight: string;
    co2: string;
    seats: number;
    doors: number;
    regNr: string;
    vin: string;
    firstReg: string;
    euExpiry: string;
  };
}

const SpecsGrid = ({ car }: SpecsGridProps) => {
  const specs = [
    { label: "Modellår", value: String(car.year) },
    { label: "Kilometerstand", value: car.mileage },
    { label: "Drivstoff", value: car.fuel },
    { label: "Girkasse", value: car.gearbox },
    { label: "Effekt", value: car.power },
    { label: "Hjuldrift", value: car.drivetrain },
    { label: "Karosseri", value: car.body },
    { label: "Farge", value: car.color },
    { label: "Vekt", value: car.weight },
    { label: "CO₂-utslipp", value: car.co2 },
    { label: "Seter", value: String(car.seats) },
    { label: "Dører", value: String(car.doors) },
    { label: "Reg.nr", value: car.regNr },
    { label: "VIN", value: car.vin },
    { label: "1. gang reg.", value: car.firstReg },
    { label: "EU-kontroll", value: `Gyldig til ${car.euExpiry}` },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
        Spesifikasjoner
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {specs.map((s, i) => (
          <div key={i}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-sm font-medium text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecsGrid;
