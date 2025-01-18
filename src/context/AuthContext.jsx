import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updatePassword, // Dodano updatePassword
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  setPersistence,
  browserLocalPersistence, // Dodano deleteUser
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";

const AuthContext = createContext();
export const useAuth = () => {
  return useContext(AuthContext);
};

const googleProvider = new GoogleAuthProvider();

export const AuthProvide = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const registerUser = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const loginUser = async (email, password) => {
    await setPersistence(auth, browserLocalPersistence); // Postavlja dugotrajnu sesiju
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Dobij Firebase ID token
    const idToken = await user.getIdToken();

    // Čuvaj dodatni JWT u localStorage
    localStorage.setItem("userToken", idToken);
    localStorage.setItem("userTokenTime", new Date().getTime().toString());
  };

  const signInWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    // Proverite tip korisnika (možete koristiti razne metode, npr. postavljanje role u localStorage)
    const userToken = localStorage.getItem("userToken");
    const adminToken = localStorage.getItem("token");

    // Ako je korisnik ulogovan kao 'user', uklonite njegov token
    if (userToken) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userTokenTime");
    }

    // Ako je korisnik ulogovan kao 'admin', uklonite njegov token
    if (adminToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenTime");
    }

    // Odjava sa Firebase autentifikacije
    return signOut(auth);
  };

  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
  };

  // Nova funkcija za brisanje naloga
  const deleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await deleteUser(user);
        return "Account successfully deleted!";
      } catch (error) {
        console.error("Error deleting account:", error);
        throw new Error("Failed to delete account. Please try again.");
      }
    } else {
      throw new Error("No user is currently logged in.");
    }
  };

  const reauthenticateUser = async (email, password) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
        return "Reauthenticated successfully!";
      } catch (error) {
        console.error("Error reauthenticating user:", error);
        throw new Error(
          "Failed to reauthenticate. Please check your credentials."
        );
      }
    } else {
      throw new Error("No user is currently logged in.");
    }
  };

  // Nova funkcija za ažuriranje lozinke
  const updateUserPassword = async (newPassword) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updatePassword(user, newPassword);
        return "Password updated successfully!";
      } catch (error) {
        console.error("Error updating password:", error);
        throw new Error("Failed to update password. Please try again.");
      }
    } else {
      throw new Error("No user is currently logged in.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
      if (user) {
        setCurrentUser(user); // Ažurirajte trenutno stanje korisnika
        const idToken = await user.getIdToken(true); // Osvežavanje tokena
        localStorage.setItem("userToken", idToken); // Čuvajte token u localStorage
      } else {
        setCurrentUser(null);
        localStorage.removeItem("userToken"); // Uklonite token ako korisnik nije prijavljen
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    registerUser,
    loginUser,
    signInWithGoogle,
    logout,
    resetPassword,
    deleteAccount, // Dodato deleteAccount
    updateUserPassword, // Dodato updateUserPassword
    reauthenticateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
