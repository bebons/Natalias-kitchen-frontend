import React, { useEffect, useState } from "react";
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";
import defaultAvatar from "../assets/avatar.png";
import adminAvatar from "../assets/admin.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

const MyFriends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { socket } = useSocket();
  const { currentUser } = useAuth();
  // Navigate to user profile
  const handleProfileClick = (email) => {
    navigate("/searched-user", { state: { query: email } });
  };

  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.emit("onlineUsers");
  }, [socket, currentUser]);
  useEffect(() => {
    if (!socket || !currentUser) return;
    const handleUsersOnline = (users) => {
      setOnlineUsers(new Set(users)); // Ažuriramo online korisnike
      console.log(onlineUsers);
    };
    socket.on("getOnlineUsers", handleUsersOnline);
    return () => {
      socket.off("getOnlineUsers", handleUsersOnline);
    };
  }, [socket, currentUser]);
  // Fetch friends on component mount
  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      setError(null); // Reset error
      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/friends/get-friends`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setFriends(response.data.friends || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setError("Failed to load friends. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // Handle messaging a friend
  const handleMessage = async (friend) => {
    try {
      console.log(friend);
      console.log(`Start messaging with friend ID: ${friend.name}`);
      navigate("/direct-messages", { state: { selectedUser: friend } });
    } catch (error) {
      console.error("Error starting message:", error);
      alert("Failed to start messaging. Please try again.");
    }
  };

  // Handle unfriending a user
  const handleUnfriend = async (friendId) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to unfriend this user?"
      );
      if (!confirmed) return;

      await axios.post(
        `${getBaseUrl()}/api/friends/unfriend`,
        { friendId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend._id !== friendId)
      );
      alert("You have unfriended the user.");
    } catch (error) {
      console.error("Error unfriending user:", error);
      alert("Failed to unfriend the user. Please try again.");
    }
  };

  if (loading) return <div>Loading friends...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">My Friends</h2>
      {friends.length === 0 ? (
        <p>No friends found. Admin is always here for you!</p>
      ) : (
        <div className="space-y-4">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center justify-between p-4 bg-white shadow rounded"
            >
              <div className="flex items-center space-x-4">
                <button onClick={() => handleProfileClick(friend.email)}>
                  <div className="relative">
                    <img
                      src={
                        friend.profilePicture
                          ? `${getBaseUrl()}${friend.profilePicture}`
                          : defaultAvatar
                      }
                      alt={friend.name}
                      className="w-16 h-16 rounded-full"
                    />
                    {/* Zeleni kružić ako je korisnik online */}
                    {onlineUsers.has(friend._id) && (
                      <span
                        className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                        title="Online"
                      ></span>
                    )}
                  </div>
                </button>
                <div>
                  <h3 className="font-medium text-lg">{friend.name}</h3>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleMessage(friend)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Message
                </button>
                <button
                  onClick={() => handleUnfriend(friend._id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Unfriend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Admin Section */}
      <div className="flex items-center justify-between p-4 bg-white shadow rounded">
        <div className="flex items-center space-x-4">
          <img
            src={adminAvatar}
            alt="Admin"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="font-medium text-lg">Admin</h3>
            <p className="text-sm text-gray-500">Always here for you</p>
          </div>
        </div>
        <div className="space-x-2">
          <Link
            to="/chat-with-admin"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
          >
            Message
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyFriends;
