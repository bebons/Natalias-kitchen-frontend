import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import getBaseUrl from "../utils/baseUrl";
import defaultAvatar from "../assets/avatar.png";
const FriendRequests = () => {
  const [requests, setRequests] = useState([]); // Držimo listu zahteva
  const [loading, setLoading] = useState(false);

  // Fetch zahteva
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${getBaseUrl()}/api/friends/get-friend-requests`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setRequests(response.data.requests || []); // Pretpostavljamo da API vraća "requests"
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        Swal.fire("Error", "Failed to fetch friend requests.", "error");
      } finally {
        setLoading(false);
      }
    };

    const markNotificationsAsRead = async () => {
      try {
        await axios.post(
          `${getBaseUrl()}/api/notifications/mark-notifications-as-read`, // Endpoint za označavanje notifikacija
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

    markNotificationsAsRead();
    fetchFriendRequests();
  }, []);

  // Prihvatanje zahteva
  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        `${getBaseUrl()}/api/friends/accept-friend-request`,
        { requestId }, // ID zahteva
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      Swal.fire("Success", "Friend request accepted!", "success");
      setRequests((prev) => prev.filter((req) => req._id !== requestId)); // Uklanja prihvaćeni zahtev
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Swal.fire("Error", "Failed to accept friend request.", "error");
    }
  };

  // Odbijanje zahteva
  const handleDecline = async (requestId) => {
    try {
      await axios.post(
        `${getBaseUrl()}/api/friends/reject-friend-request`,
        { requestId }, // ID zahteva
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      Swal.fire("Success", "Friend request declined!", "success");
      setRequests((prev) => prev.filter((req) => req._id !== requestId)); // Uklanja odbijeni zahtev
    } catch (error) {
      console.error("Error declining friend request:", error);
      Swal.fire("Error", "Failed to decline friend request.", "error");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Friend Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No friend requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="flex items-center justify-between p-4 bg-white shadow rounded"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={
                    `${getBaseUrl()}${request.sender.profilePicture}` ||
                    defaultAvatar
                  } // Pretpostavljamo da API vraća "profilePicture"
                  alt={request.sender.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-lg">{request.sender.name}</h3>
                  <p className="text-sm text-gray-500">
                    {request.sender.email}
                  </p>
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleAccept(request._id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(request._id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;
