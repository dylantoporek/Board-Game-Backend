import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import AuthScreen from "./screens/AuthScreen";
import LobbyScreen from "./screens/LobbyScreen";
import SetupScreen from "./screens/SetupScreen";
import GameScreen from "./screens/GameScreen";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen center muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Routing() {
  const { user, loading } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={loading ? null : user ? <Navigate to="/" replace /> : <AuthScreen />}
      />
      <Route
        path="/"
        element={
          <Protected>
            <LobbyScreen />
          </Protected>
        }
      />
      <Route
        path="/setup"
        element={
          <Protected>
            <SetupScreen />
          </Protected>
        }
      />
      <Route
        path="/play/:id"
        element={
          <Protected>
            <GameScreen />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </AuthProvider>
  );
}
