import { Car } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Car className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
            BilSjekk<span className="text-primary">.ai</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 BilSjekk.ai — Et støtteverktøy for bilkjøp.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
