import { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Insert role into profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        role
      });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    alert("Signup successful! Please login.");
    navigate("/login");
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSignup} style={styles.card}>
        <h2>Create Account</h2>

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

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Already have an account? <a href="/login">Login</a>
        </p>
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
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    width: "340px",
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
    background: "#16a34a",
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
