import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineBars3CenterLeft } from "react-icons/hi2";
import { FaUserNinja } from "react-icons/fa6";
import { FaBasketShopping } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import avatarImg from "../assets/avatar.png";
import { useSelector } from "react-redux";
import { selectCartTotalItems } from "../redux/features/cart/cartSlice";

const navigation = [
  {
    name: "Orders",
    href: "/orders",
  },
  {
    name: "Cart Page",
    href: "/cart",
  },
  {
    name: "Checkout",
    href: "/checkout",
  },
];

export const Navbar = () => {
  const totalItems = useSelector(selectCartTotalItems);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleLogOut = () => {
    logout();
  };

  const handleDeleteUser = async () => {
    if (currentUser) {
      try {
        const response = await fetch(
          `http://localhost:3000/delete-user/${currentUser.uid}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          alert("Korisnik je uspešno obrisan.");
          logout(); // Log out the user after successful deletion
        } else {
          alert("Greška pri brisanju korisnika.");
        }
      } catch (error) {
        console.error(
          "Greška pri slanju zahteva za brisanje korisnika:",
          error
        );
        alert("Došlo je do greške. Pokušaj ponovo.");
      }
    }
  };

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        <div className="flex items-center md:gap-16 gap-4">
          <Link to="/">
            <HiOutlineBars3CenterLeft className="size-10" />
          </Link>
        </div>
        {/* desna strana */}
        <div className="relative flex items-center md:space-x-3 space-x-2">
          <div>
            {currentUser ? (
              <>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={avatarImg}
                    alt="slika avatara"
                    className={`size-7 rounded-full ${
                      currentUser ? "ring-2 ring-blue-300" : ""
                    }`}
                  />
                </button>
                {/* Show dropdowns */}
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
                            className="block px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={handleLogOut}
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Log Out
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={handleDeleteUser}
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Delete Account
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
            <FaBasketShopping />
            {totalItems > 0 ? (
              <span className="text-sm font-semibold sm:ml-1">
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
