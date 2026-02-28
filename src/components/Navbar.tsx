import { Car, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const { user, setShowAuthModal } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            BruktbilSjekk
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Plus className="w-4 h-4" />
              Ny analyse
            </Button>
          </Link>
          <Link to="/om-oss">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Om oss
            </Button>
          </Link>
          {user ? (
            <ProfileDropdown />
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowAuthModal(true)}>
              <User className="w-4 h-4" />
              Logg inn
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
