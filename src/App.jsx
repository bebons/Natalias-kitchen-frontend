import { Outlet } from "react-router-dom";
import "./App.css";
import { Navbar } from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvide } from "./context/AuthContext";
import { useEffect, useState } from "react";
import Loading from "./components/Loading";
import ScrollToTop from "./components/ScrollToTop";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // Ovaj state treba da sadrži token nakon što bude dostupan.

  useEffect(() => {
    const REFRESH_COUNT_KEY = "refreshCount";
    const LAST_RESET_KEY = "lastResetTime";

    // Uzmi trenutni broj osvežavanja i vreme poslednjeg reseta iz localStorage
    let refreshCount = parseInt(localStorage.getItem(REFRESH_COUNT_KEY)) || 0;
    const lastResetTime = parseInt(localStorage.getItem(LAST_RESET_KEY)) || 0;

    // Trenutno vreme
    const currentTime = Date.now();

    // Ako je prošlo više od 60 minuta od poslednjeg reseta, resetuj refreshCount
    if (currentTime - lastResetTime > 3600000) {
      refreshCount = 0; // Resetuj broj osvežavanja
      localStorage.setItem(LAST_RESET_KEY, currentTime.toString()); // Ažuriraj vreme poslednjeg reseta
    }

    // Ako je broj osvežavanja manji od 2, omogućiti osvežavanje
    const handleGlobalError = (message, source, lineno, colno, error) => {
      console.error("Greška detektovana:", message);
      if (refreshCount < 2) {
        localStorage.setItem(REFRESH_COUNT_KEY, refreshCount + 1); // Povećaj broj osvežavanja
        setTimeout(() => window.location.reload(), 1000); // Osveži stranicu
      }
    };

    const handlePromiseRejection = (event) => {
      console.error("Neobradjeni Promise rejection:", event.reason);
      if (refreshCount < 2) {
        localStorage.setItem(REFRESH_COUNT_KEY, refreshCount + 1); // Povećaj broj osvežavanja
        setTimeout(() => window.location.reload(), 1000); // Osveži stranicu
      }
    };

    window.onerror = handleGlobalError;
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    // Cleanup listeners na unmount
    return () => {
      window.onerror = null;
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup timer
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const REFRESH_COUNT_KEY = "refreshCount";
    const TOKEN_KEY = "userToken"; // Token koji koristiš u aplikaciji
    const MAX_RETRIES = 3; // Maksimalan broj pokušaja osvežavanja

    // Uzmi broj pokušaja osvežavanja iz localStorage
    let refreshCount = parseInt(localStorage.getItem(REFRESH_COUNT_KEY)) || 0;

    // Proveri ako je token već dostupan
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken); // Ako token postoji, postavi ga u state
    }

    // Ako token nije dostupan i broj pokušaja je manji od 3, osveži stranicu
    if (!storedToken && refreshCount < MAX_RETRIES) {
      // Povećaj broj pokušaja osvežavanja
      localStorage.setItem(REFRESH_COUNT_KEY, refreshCount + 1);
      setTimeout(() => window.location.reload(), 1000); // Osveži stranicu
    }

    // Ako je token dostupan ili broj pokušaja dostigne maksimalni broj, prestani sa osvežavanjem
    if (storedToken || refreshCount >= MAX_RETRIES) {
      localStorage.setItem(REFRESH_COUNT_KEY, 0); // Resetuj broj pokušaja
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <AuthProvide>
        <SocketProvider>
          <ScrollToTop />
          <Navbar />
          <main className="min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-primary">
            <Outlet />
          </main>
          <Footer />
        </SocketProvider>
      </AuthProvide>
    </>
  );
}

export default App;
