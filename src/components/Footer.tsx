import { Car } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Car className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
            BruktbilSjekk
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 bruktbilsjekk.no</p>
          <Link to="/om-oss" className="hover:text-foreground transition-colors">Om oss</Link>
          <Link to="/personvern" className="hover:text-foreground transition-colors">Personvern</Link>
          <Link to="/vilkar" className="hover:text-foreground transition-colors">Vilkår</Link>
        </div>
        <ThemeToggle />
      </div>
    </footer>
  );
};

export default Footer;
