import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext"; // Uvozimo AuthContext da bismo imali pristup currentUser
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";

// Creating the context for Socket
const SocketContext = createContext();

// Custom hook to access socket context
export const useSocket = () => {
  return useContext(SocketContext);
};

// Socket provider component
export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const socketRef = useRef(null); // Use useRef to keep socket instance between renders
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false); // New state to track socket connection

  // Fetch the user's ID once the user is logged in
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/auth/get-user-data`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setUserId(response.data._id); // Store the user ID
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]); // Runs when currentUser changes

  // Establish socket connection once the user ID is fetched
  useEffect(() => {
    if (!userId || !currentUser) return;

    const token = localStorage.getItem("userToken");
    socketRef.current = io("https://natalias-kitchen-backend.vercel.app", {
      query: { userId }, // Send userId to the server
      auth: { token },
    });

    // Set socketConnected to true once socket is successfully connected
    socketRef.current.on("connect", () => {
      // console.log("Socket connected:", socketRef.current.id);
      setSocketConnected(true);
    });

    // Cleanup socket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, currentUser]); // Runs when userId or currentUser changes

  return (
    <SocketContext.Provider
      value={{
        socket: socketConnected ? socketRef.current : null, // Only provide socket if connected
        loading,
        error,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
