import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

interface FavoriteItem {
  finn_code: string;
  finn_url: string | null;
  car_data: any;
  created_at: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (finnCode: string) => boolean;
  toggleFavorite: (finnCode: string, finnUrl?: string, carData?: any) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: async () => {},
  loading: false,
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, setShowAuthModal } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("finn_code, finn_url, car_data, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setFavorites(data);
    };
    fetch();
  }, [user]);

  const isFavorite = useCallback(
    (finnCode: string) => favorites.some((f) => f.finn_code === finnCode),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (finnCode: string, finnUrl?: string, carData?: any) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      if (!finnCode || loading) return;

      const wasFav = isFavorite(finnCode);
      const prevFavorites = [...favorites];

      // Optimistic update
      if (wasFav) {
        setFavorites((prev) => prev.filter((f) => f.finn_code !== finnCode));
      } else {
        const newItem: FavoriteItem = {
          finn_code: finnCode,
          finn_url: finnUrl || null,
          car_data: carData || {},
          created_at: new Date().toISOString(),
        };
        setFavorites((prev) => [newItem, ...prev]);
      }

      setLoading(true);
      try {
        if (wasFav) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("finn_code", finnCode);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("favorites").insert({
            user_id: user.id,
            finn_code: finnCode,
            finn_url: finnUrl || null,
            car_data: carData || {},
          });
          if (error) throw error;
        }
      } catch {
        setFavorites(prevFavorites);
        toast.error("Kunne ikke oppdatere favoritt. Prøv igjen.");
      } finally {
        setLoading(false);
      }
    },
    [user, favorites, isFavorite, loading, setShowAuthModal]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};
