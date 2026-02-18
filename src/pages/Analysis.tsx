import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarOverview from "@/components/analysis/CarOverview";
import RiskAssessment from "@/components/analysis/RiskAssessment";
import SmartQuestions from "@/components/analysis/SmartQuestions";
import PriceAnalysis from "@/components/analysis/PriceAnalysis";
import SpecsGrid from "@/components/analysis/SpecsGrid";
import EquipmentList from "@/components/analysis/EquipmentList";
import AISummary from "@/components/analysis/AISummary";

const carData = {
  title: "BMW 3-serie",
  subtitle: "318D - AUTOMAT - P.Sensor - Delskinn - Alcantara",
  price: "79 000 kr",
  year: 2009,
  mileage: "217 000 km",
  fuel: "Diesel",
  gearbox: "Automat",
  power: "136 hk",
  drivetrain: "Bakhjulsdrift",
  body: "Sedan",
  color: "Svart",
  weight: "1 520 kg",
  co2: "148 g/km",
  seats: 5,
  doors: 5,
  regNr: "BR85899",
  vin: "WBAPN11080A681939",
  firstReg: "07.10.2009",
  seller: "ATM AUTO AS",
  location: "Stoa 42, 3970 Langesund",
  finnCode: "451380644",
  imageUrl: "https://images.finncdn.no/dynamic/1280w/2026/2/vertical-2/18/7/451/380/644_1199538048.jpg",
  euExpiry: "10/2027",
  equipment: [
    "ABS-bremser", "Airbag foran", "Airbag bak side", "Airbag foran side",
    "Airbag gardiner", "Alarm", "Antiskrens", "Antispinn", "AUX tilkobling",
    "Bluetooth", "Cruisekontroll", "Delskinn", "Diesel-partikkelfilter",
    "El.vinduer", "Elektriske speil", "Isofix", "Kjørecomputer",
    "Klimaanlegg 2-soner", "Metallic lakk", "Multifunksjonsratt",
    "Oppvarmede seter foran", "Parkeringsensor bak", "Regnsensor",
    "Sentrallås", "Servostyring", "Skinnratt", "Xenonlys",
    "Vinterdekk på aluminiumsfelg", "Sommerdekk på aluminiumsfelg"
  ],
};

const Analysis = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <CarOverview car={carData} />
        <AISummary />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskAssessment />
          <PriceAnalysis price={79000} />
        </div>
        <SmartQuestions />
        <SpecsGrid car={carData} />
        <EquipmentList equipment={carData.equipment} />
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
