import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHouse, FaUserNinja } from "react-icons/fa6";
import { FaBasketShopping } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import avatarImg from "../assets/avatar.png"; // Podrazumevana slika
import { useSelector } from "react-redux";
import { selectCartTotalItems } from "../redux/features/cart/cartSlice";
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";
import { useSocket } from "../context/SocketContext";

const navigation = [
  {
    name: "Cart Page",
    href: "/cart",
  },
  {
    name: "Checkout",
    href: "/checkout",
  },
  {
    name: "My Account",
    href: "/my-account",
  },
  {
    name: "Inbox",
    href: "/user-chat",
  },
];
export const Navbar = () => {
  const totalItems = useSelector(selectCartTotalItems);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const [imageIcon, setImageIcon] = useState(avatarImg); // Držimo privremenu sliku za prikaz
  const token = localStorage.getItem("userToken"); // Token iz localStorage
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { socket, setSocket } = useSocket();
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!token) return; // Ako nema tokena, nemoj pokušavati da učitaš sliku
      try {
        const response = await axios.get(
          "https://natalias-kitchen-backend.vercel.app/api/auth/get-profile-image", // URL za učitavanje slike
          {
            headers: {
              Authorization: `Bearer ${token}`, // Dodaj token u zaglavlje
            },
          }
        );

        if (response.data && response.data.profilePicture) {
          setImageIcon(
            `https://natalias-kitchen-backend.vercel.app${response.data.profilePicture}` // Formiranje URL-a za sliku
          );
        } else {
          setImageIcon(avatarImg); // Ako nema slike, koristi podrazumevanu sliku
        }
      } catch (err) {
        console.error("Failed to fetch profile image", err);
        setImageIcon(avatarImg); // U slučaju greške postavite podrazumevanu sliku
      }
    };

    fetchProfileImage();
  }, [token]); // Pretraga slike se ponovo pokreće ako se token menja

  const handleLogOut = () => {
    localStorage.removeItem("hasRefreshed");
    logout();
  };

  useEffect(() => {
    if (!token) return;
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

    const interval = setInterval(fetchUnreadNotifications, 20000); // Provera svakih 30 sekundi
    return () => clearInterval(interval); // Očistite interval na unmount
  }, [token]);

  // Fetch broj novih poruka
  useEffect(() => {
    const fetchNewMessages = async () => {
      if (!token) return;
      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/messages/unread`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setUnreadMessages(response.data.totalUnreadMessages || 0);
      } catch (error) {
        console.error("Error fetching new messages count:", error);
      }
    };

    fetchNewMessages();

    const interval = setInterval(fetchNewMessages, 10000); // Provera svakih 10 sekundi
    return () => clearInterval(interval); // Očistite interval na unmount
  }, [token]);

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        <div className="flex items-center md:gap-16 gap-4">
          <Link to="/">
            <FaHouse className="size-10" />
          </Link>
        </div>
        {/* desna strana */}
        <div className="relative flex items-center md:space-x-3 space-x-2">
          <div>
            {currentUser ? (
              <>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={imageIcon} // Koristi imageIcon za prikaz slike
                    alt="User Avatar"
                    className={`size-12 rounded-full ${
                      imageIcon ? "ring-2 ring-blue-300" : ""
                    }`}
                  />
                </button>
                {/* Prikazivanje dropdown menija */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40">
                    <ul className="py-2">
                      {navigation.map((item) => (
                        <li
                          key={item.name}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Link
                            to={item.href}
                            className="block px-4 py-2 text-sm hover:bg-gray-50 relative"
                          >
                            {item.name}
                            {item.name === "Inbox" &&
                              (unreadNotifications || unreadMessages > 0) && (
                                <span className="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full"></span>
                              )}
                          </Link>
                        </li>
                      ))}
                      <li key={123}>
                        <button
                          onClick={handleLogOut}
                          className="block px-4 py-2 text-sm text-red-700 font-bold"
                        >
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login">
                <FaUserNinja className="size-7" />
              </Link>
            )}
          </div>
          <Link
            to="/cart"
            className="bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm"
          >
            <FaBasketShopping className="text-2xl" />
            {totalItems > 0 ? (
              <span className="text-lg font-semibold sm:ml-2">
                {" "}
                {/* Povećana veličina i veća margina */}
                {totalItems}
              </span>
            ) : (
              <span className="text-sm font-semibold sm:ml-1">0</span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
};
