import React, { useEffect, useState } from "react";
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";
import defaultAvatar from "../assets/avatar.png";
import { useAuth } from "../context/AuthContext"; // Import the context

const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/auth/get-user-data`, // Fetch logged-in user data
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data); // Set the user data
      } catch (error) {
        setError("Error fetching user data");
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>Error loading user data.</div>;
  }

  return (
    <div className="h-full flex flex-col items-center p-6">
      <h2 className="text-2xl font-semibold mb-6">{userData.name}</h2>
      <div className="w-full max-w-lg p-6 shadow-md rounded flex flex-col items-center">
        <img
          src={`${getBaseUrl()}${userData.profilePicture}` || defaultAvatar}
          alt="Profile"
          className="w-50 h-50 mb-4"
        />
        <p className="text-gray-600">{userData.email}</p>
        <p className="text-gray-600">
          Member since: {new Date(userData.joinedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default MyProfile;
