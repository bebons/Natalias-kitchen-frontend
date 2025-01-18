import React, { useEffect, useState } from "react";
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";
import { useLocation, useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/avatar.png";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext"; // Import the context
import { useSocket } from "../context/SocketContext";

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.query;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendship, setFriendship] = useState(false);
  const [viceVersaRequest, setViceVersaRequest] = useState(false);
  const [viceVersaRequestId, setViceVersaRequestId] = useState("");
  const [friendRequestSent, setFriendRequestSent] = useState(false); // New state to track if friend request is sent
  const token = localStorage.getItem("userToken");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { currentUser } = useAuth(); // Access currentUser from context
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.emit("onlineUsers");
  }, [socket, currentUser]);

  useEffect(() => {
    if (!socket || !currentUser) return;
    const handleUsersOnline = (users) => {
      setOnlineUsers(new Set(users)); // Update online users
    };
    socket.on("getOnlineUsers", handleUsersOnline);
    return () => {
      socket.off("getOnlineUsers", handleUsersOnline);
    };
  }, [socket, currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/auth/get-user-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              email, // Send email as query string
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        setError("Error fetching user data");
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    const checkFriendship = async () => {
      try {
        const response = await axios.post(
          `${getBaseUrl()}/api/friends/check-friendship`,
          { receiverEmail: email },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.message === "Friendship") {
          setFriendship(true);
        }
      } catch (error) {
        console.error("Error checking friendship request:", error);
      }
    };

    const checkFriendRequestStatus = async () => {
      if (!friendship) {
        try {
          const response = await axios.post(
            `${getBaseUrl()}/api/friends/check-friend-request`,
            { receiverEmail: email },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.message === "Vice versa request") {
            setViceVersaRequest(true); // Set state if friend request exists
            setViceVersaRequestId(response.data.requestId);
          }
          if (response.data.message === "Friend request exists") {
            setFriendRequestSent(true); // Set state if friend request exists
          }
        } catch (error) {
          console.error("Error checking friend request:", error);
        }
      }
    };

    if (token) {
      fetchUserData();
      checkFriendship(); // Check the friend request status on load
      checkFriendRequestStatus();
    }
  }, [token, email]);

  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        `${getBaseUrl()}/api/friends/accept-friend-request`,
        { requestId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      Swal.fire("Success", "Friend request accepted!", "success");
      window.location.reload();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Swal.fire("Error", "Failed to accept friend request.", "error");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(
        `${getBaseUrl()}/api/friends/reject-friend-request`,
        { requestId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      Swal.fire("Success", "Friend request declined!", "success");
      window.location.reload();
    } catch (error) {
      console.error("Error declining friend request:", error);
      Swal.fire("Error", "Failed to decline friend request.", "error");
    }
  };

  const sendFriendRequest = async () => {
    try {
      await axios.post(
        `${getBaseUrl()}/api/friends/friend-request`,
        { email: userData.email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFriendRequestSent(true);
      Swal.fire({
        icon: "success",
        title: "Friend request sent",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      Swal.fire({
        icon: "error",
        title: "Couldn't send friend request",
      });
    }
  };

  const handleMessage = async (friendId) => {
    try {
      console.log(`Start messaging with friend ID: ${friendId}`);
      navigate("/direct-messages", { state: { selectedUser: userData } });
    } catch (error) {
      console.error("Error starting message:", error);
      alert("Failed to start messaging. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>Error loading user data.</div>;
  }

  const isOwnProfile = currentUser?.email === userData.email;
  const isUserOnline = onlineUsers.has(userData._id); // Check if the user is online

  return (
    <div className="h-full flex flex-col items-center p-6">
      {isUserOnline && (
        <span className="ml-2 w-4 h-4 rounded-full bg-green-500"></span>
      )}
      <h2 className="text-2xl font-semibold mb-6">{userData.name} </h2>

      {/* Display green circle if the user is online */}
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

        {viceVersaRequest ? (
          <div className="space-x-2">
            <button
              onClick={() => handleAccept(viceVersaRequestId)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(viceVersaRequestId)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Reject
            </button>
          </div>
        ) : null}

        {friendship && (
          <div className="space-x-2">
            <button
              onClick={() => handleMessage(userData._id)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
            >
              Message
            </button>
          </div>
        )}

        {!isOwnProfile &&
          !friendRequestSent &&
          !viceVersaRequest &&
          !friendship && (
            <button
              onClick={sendFriendRequest}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Send Friend Request
            </button>
          )}

        {!isOwnProfile && friendRequestSent && (
          <button
            disabled
            className="mt-4 bg-gray-500 text-white py-2 px-4 rounded cursor-not-allowed"
          >
            Friend Request Sent
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
