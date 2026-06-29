import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

// Importă componenta nouă (asigură-te că pui calea corectă către folderul tău)
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

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

function App() {
  return (
    <>
      {/* Ecranul de încărcare stă la cel mai înalt nivel. 
         <LoadingScreen />
      */}

      <Router>
        <Routes>
          {/* ==========================================
              RUTE FĂRĂ NAVBAR (Paginile de Autentificare)
              ========================================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ==========================================
              RUTE CU NAVBAR (Grupate sub MainLayout)
              ========================================== */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
