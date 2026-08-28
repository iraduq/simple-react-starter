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
import RoomDetail from "./pages/RoomDetail";
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
import Availability from "./pages/Availability";
import MyBookings from "./pages/MyBookings";
import PlaceDetail from "./pages/PlaceDetail";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Gdpr from "./pages/Gdpr";
import Footer from "./components/Footer";
import BookingSuccess from "./pages/BookingSuccess";
import Housekeeping from "./pages/Housekeeping";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
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
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/camere" element={<Rooms />} />
        <Route path="/camere/:roomId" element={<RoomDetail />} />
        <Route path="/disponibilitate" element={<Availability />} />
        <Route path="/places" element={<Places />} />
        <Route path="/places/:placeId" element={<PlaceDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/termeni-si-conditii" element={<Terms />} />
        <Route path="/confidentialitate" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/gdpr" element={<Gdpr />} />
        <Route
          path="/rezervarile-mele"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

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
        <Route
          path="/housekeeping"
          element={
            <ProtectedRoute>
              <Housekeeping />
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
