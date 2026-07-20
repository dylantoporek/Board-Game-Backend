import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function AuthScreen() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ username: "", password: "", password_confirmation: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login({ username: form.username, password: form.password });
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen auth">
      <div className="auth__hero">
        <div className="logo">
          <span className="logo__star">★</span>
          <h1 className="logo__title">Nintendo Land</h1>
          <p className="logo__tag">Race to the castle!</p>
        </div>
      </div>

      <form className="card auth__card" onSubmit={submit}>
        <div className="tabs">
          <button
            type="button"
            className={"tab" + (!isSignup ? " is-active" : "")}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={"tab" + (isSignup ? " is-active" : "")}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <label className="field">
          <span>Username</span>
          <input value={form.username} onChange={set("username")} autoComplete="username" required />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
          />
        </label>

        {isSignup && (
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={set("password_confirmation")}
              autoComplete="new-password"
              required
            />
          </label>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "…" : isSignup ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  );
}
