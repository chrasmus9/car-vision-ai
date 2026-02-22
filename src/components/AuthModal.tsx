import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "./AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setMode("login");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setShowAuthModal(false);
      resetForm();
    }
  };

  const handleEmailLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) {
      toast({ title: "Innlogging feilet", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logget inn!" });
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setIsLoading(false);
    if (error) {
      toast({ title: "Registrering feilet", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sjekk e-posten din", description: "Vi har sendt en bekreftelseslenke." });
    }
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    if (error) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sjekk e-posten din", description: "Vi har sendt en lenke for å tilbakestille passordet." });
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Google-innlogging feilet", description: String(error), variant: "destructive" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") handleEmailLogin();
    else if (mode === "signup") handleSignup();
    else handleForgotPassword();
  };

  return (
    <Dialog open={showAuthModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === "login" && "Logg inn"}
            {mode === "signup" && "Opprett konto"}
            {mode === "forgot" && "Glemt passord"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" && "Logg inn for å lagre analyser og favoritter."}
            {mode === "signup" && "Opprett en konto for å komme i gang."}
            {mode === "forgot" && "Skriv inn e-posten din, så sender vi en tilbakestillingslenke."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Fullt navn</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Ola Nordmann"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="din@epost.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passord</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-primary hover:underline"
                  >
                    Glemt passord?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {mode === "login" && "Logg inn"}
            {mode === "signup" && "Opprett konto"}
            {mode === "forgot" && "Send tilbakestillingslenke"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">eller</span>
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2" onClick={handleGoogleLogin}>
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Fortsett med Google
        </Button>

        <div className="text-center text-sm text-muted-foreground pt-2">
          {mode === "login" ? (
            <>
              Har du ikke konto?{" "}
              <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                Opprett konto
              </button>
            </>
          ) : mode === "signup" ? (
            <>
              Har du allerede konto?{" "}
              <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                Logg inn
              </button>
            </>
          ) : (
            <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
              Tilbake til innlogging
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
