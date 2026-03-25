import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  
  // 1. MUST: Initial loading-ai TRUE-nu vaikkanum
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole(parsed.role);
      } catch (error) {
        console.error("Auth recovery error:", error);
        localStorage.removeItem("user");
      }
    }
    // 2. Data recover panni mudithu user state set aanapiragu loading-ai false seiyavum
    setLoading(false); 
  }, []);

  const login = (userData) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        role, 
        login, 
        logout, 
        loading, 
        setLoading, 
        isAuthenticated: !!user 
      }}
    >
      {/* 3. Loading-aga irukkumbothu context-ai render seiya koodathu */}
      {!loading ? children : (
        <div className="loading-screen" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
           <h2>Loading System...</h2>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}