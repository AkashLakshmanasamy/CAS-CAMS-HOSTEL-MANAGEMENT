import { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { role } = useAuth();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  // Let AuthContext + routing handle redirect
  navigate("/");
  setLoading(false);
};


  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2>Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6"
  },
  card: {
    background: "#ffffff",
    padding: "2rem",
    borderRadius: "8px",
    width: "320px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  error: {
    color: "red",
    marginBottom: "1rem"
  }
};
