import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout";
import ProtectedRoute from "./utils/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TradeList from "./pages/TradeList";
import AddTrade from "./pages/AddTrade";
import TradeDetail from "./pages/TradeDetail";
import EditTrade from "./pages/EditTrade";

export default function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Landing />} />

      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/app" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/app" replace /> : <Register />
        }
      />

      {/* Protected routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="trades" element={<TradeList />} />
        <Route path="trades/new" element={<AddTrade />} />
        <Route path="trades/:id" element={<TradeDetail />} />
        <Route path="trades/:id/edit" element={<EditTrade />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
