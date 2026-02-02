import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import "../../styles/Auth.css";

export default function Login() {
  const { setUser, setRole, loading, setLoading } = useAuth();
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
        setUser(result.user);
        setRole(result.user.role || "student");
        setLoading(false);
        setLocalLoading(false);

        // Redirect based on role
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
      console.error(err);
      setError("Network error. Please try again.");
      setLoading(false);
      setLocalLoading(false);
    }
  };

  if (loading || localLoading) {
    return (
      <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner">Logging in...</div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to access your dashboard</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              className="auth-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={localLoading} className="auth-btn btn-primary">
            {localLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
