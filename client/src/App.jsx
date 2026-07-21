import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import AuthScreen from "./screens/AuthScreen";
import LobbyScreen from "./screens/LobbyScreen";
import SetupScreen from "./screens/SetupScreen";
import GameScreen from "./screens/GameScreen";

// Only loading a *saved* game requires an account; everything else — playing
// included — is open to guests.
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen center muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Routing() {
  return (
    <Routes>
      <Route path="/login" element={<AuthScreen />} />
      <Route path="/" element={<LobbyScreen />} />
      <Route path="/setup" element={<SetupScreen />} />
      <Route path="/play" element={<GameScreen />} />
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
