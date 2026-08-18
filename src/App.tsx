import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import Places from "./pages/Places";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider, useToast } from "./components/Toast";
import { setSessionExpiredHandler } from "./lib/api";
import { clearSession } from "./lib/auth";
import Contact from "./pages/Contact";
import AdminDashboard from "./components/admin/AdminDashboard";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

function AppInner() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearSession();
      toast(
        "Sesiunea a expirat. Te rugăm să te autentifici din nou.",
        "warning",
      );
      navigate("/login", { replace: true });
    });
  }, [navigate, toast]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/camere" element={<Rooms />} />
        <Route path="/places" element={<Places />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppInner />
      </Router>
    </ToastProvider>
  );
}

export default App;
