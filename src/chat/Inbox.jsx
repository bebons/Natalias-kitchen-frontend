import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";
import { useEffect, useState } from "react";

const Inbox = () => {
  const [hasRefreshed, setHasRefreshed] = useState(false);
  useEffect(() => {
    // Proverite da li je stranica već osvežena koristeći localStorage
    const refreshed = localStorage.getItem("hasRefreshed");

    if (!refreshed) {
      // Ako nije, osvežite stranicu
      window.location.reload();
      localStorage.setItem("hasRefreshed", "true"); // Postavite da je stranica osvežena
    } else {
      setHasRefreshed(true); // Ako je već osvežena, samo setujte stanje
    }
  }, []);
  const { currentUser } = useAuth();
  const { register, handleSubmit, watch, reset } = useForm();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0); // Dodato stanje za nove poruke
  const [unreadGroupMessages, setUnreadGroupMessages] = useState(0); // Dodato stanje za nove poruke

  // Fetch broj nepročitanih notifikacija
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/notifications/unread-notifications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setUnreadNotifications(response.data?.hasUnread || false);
      } catch (error) {
        console.error("Error checking friend requests:", error);
      }
    };

    fetchUnreadNotifications();

    const interval = setInterval(fetchUnreadNotifications, 30000); // Provera svakih 30 sekundi
    return () => clearInterval(interval); // Očistite interval na unmount
  }, []);

  // Fetch broj novih poruka
  useEffect(() => {
    const fetchNewMessages = async () => {
      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/messages/unread`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setTotalUnreadMessages(response.data.totalUnreadMessages || 0);
      } catch (error) {
        console.error("Error fetching new messages count:", error);
      }
    };

    fetchNewMessages();

    const interval = setInterval(fetchNewMessages, 30000); // Provera svakih 30 sekundi
    return () => clearInterval(interval); // Očistite interval na unmount
  }, []);

  useEffect(() => {
    const fetchNewGroupMessages = async () => {
      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/messages/unread-group-messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setUnreadGroupMessages(response.data.unreadMessageCount || 0);
      } catch (error) {
        console.error("Error fetching new messages count:", error);
      }
    };

    fetchNewGroupMessages();

    const interval = setInterval(fetchNewGroupMessages, 30000); // Provera svakih 30 sekundi
    return () => clearInterval(interval); // Očistite interval na unmount
  }, []);

  const handleSearchSubmit = async (data) => {
    try {
      const response = await axios.post(`${getBaseUrl()}/api/auth/check-user`, {
        email: data.email,
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User found!",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/searched-user", { state: { query: data.email } });
      } else {
        Swal.fire("Error", "User not found!", "error");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "An error occurred while searching for the user.",
        "error"
      );
      console.error("Search Error:", error);
    } finally {
      reset();
    }
  };

  return (
    <div className="h-full flex flex-col items-center p-6">
      <h2 className="text-2xl font-semibold mb-6">My Inbox</h2>

      {/* User Search */}
      <div className="w-full max-w-lg mb-6 p-6 bg-white shadow-md rounded">
        <h3 className="text-xl font-medium mb-4">Search Users</h3>
        <form
          onSubmit={handleSubmit(handleSearchSubmit)}
          className="flex space-x-2"
        >
          <input
            type="email"
            placeholder="Enter user's email"
            {...register("email", { required: true })}
            className="flex-grow border rounded p-2"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 text-white"
          >
            Search
          </button>
        </form>
      </div>

      {/* Navigation Links */}
      <div className="w-full max-w-lg p-6 bg-white shadow-md rounded">
        <div className="space-y-4">
          <div className="relative">
            <Link
              to="/friend-requests"
              className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
            >
              Friend Requests
              {unreadNotifications && (
                <span className="absolute w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </Link>
          </div>
          <div className="relative">
            <Link
              to="/direct-messages"
              className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
            >
              DM
              {totalUnreadMessages > 0 && (
                <span className="absolute w-3 h-3 bg-red-500 rounded-full top-2 right-2"></span>
              )}
            </Link>
          </div>
          <div className="relative">
            <Link
              to="/group-chat"
              className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
            >
              {console.log(unreadGroupMessages)}
              Group Chat
              {unreadGroupMessages > 0 && (
                <span className="absolute w-3 h-3 bg-red-500 rounded-full top-2 right-2"></span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
