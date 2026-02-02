import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import "../../styles/Auth.css";

export default function Login() {
  // IMPORTANT: Use 'login' helper. Do NOT try to destructure setUser.
  const { login, setLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // This updates your global state and localStorage
        login(result.user);

        setLoading(false);
        setLocalLoading(false);

        // Role-based redirection
        if (result.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/student", { replace: true });
        }
      } else {
        setError(result.error || "Login failed");
        setLoading(false);
        setLocalLoading(false);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Network error. Is your backend server running?");
      setLoading(false);
      setLocalLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to access your dashboard</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input type="email" className="auth-input" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="password" className="auth-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={localLoading} className="auth-btn btn-primary">
            {localLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}