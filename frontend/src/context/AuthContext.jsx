import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use a ref to track if we are already mounting to prevent double-firing
  const isMounted = useRef(false);

  // 🔹 Helper: Fetch Role
  const fetchRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        // If no profile exists yet, default to student but don't crash
        console.warn("Profile fetch warning:", error.message);
        setRole("student");
      } else {
        setRole(data?.role || "student");
      }
    } catch (err) {
      console.error("Error fetching role:", err);
      setRole("student");
    }
  };

  useEffect(() => {
    isMounted.current = true;

    const initAuth = async () => {
      // 1. Initial Session Check
      const { data } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        setUser(data.session.user);
        await fetchRole(data.session.user.id);
      }
      
      if (isMounted.current) setLoading(false);
    };

    initAuth();

    // 2. Event Listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 🛑 FIX: Ignore token refreshes to prevent "glittering" or "loading" loops
        if (event === "TOKEN_REFRESHED") return;

        if (session?.user) {
          // Only re-fetch if the user ID actually changed (e.g., different account)
          // We use a functional update check or simple comparison
          setUser((currentUser) => {
             if (currentUser?.id !== session.user.id) {
                // New user detected: Trigger loading and fetch role
                setLoading(true);
                fetchRole(session.user.id).then(() => {
                    if (isMounted.current) setLoading(false);
                });
                return session.user;
             }
             return currentUser; // Same user, do nothing
          });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}