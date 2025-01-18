import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";
import defaultAvatar from "../assets/avatar.png"; // Default avatar
import { FaPaperclip, FaPaperPlane } from "react-icons/fa"; // Import chat icon
import { FaBars, FaTimes } from "react-icons/fa"; // Icons for toggle button
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Swal from "sweetalert2";
import GroupMessagesDisplay from "./GroupMessagesDisplay";
const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now()); // Unique key to reset the file input

  const handleSend = () => {
    if (message.trim() || file) {
      onSendMessage({ text: message, file });
      setMessage(""); // Clear input after sending
      setFile(null); // Clear selected file
      setFileKey(Date.now()); // Reset file input
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Set the selected file
  };

  return (
    <div className="flex items-center bg-white p-4 border-t border-gray-300 space-x-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 border border-gray-300 rounded-lg"
      />
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
      >
        <FaPaperclip />
      </label>
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        <FaPaperPlane />
      </button>

      {/* Display selected file name */}
      {file && (
        <div className="mt-2 text-sm text-gray-500">
          <strong>Selected file:</strong> {file.name}
        </div>
      )}
    </div>
  );
};
const useScrollToBottom = (messages) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return containerRef;
};
const GroupChat = () => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now()); // Unique key to reset the file input

  const { socket } = useSocket();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]); // Group users
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online users
  const [senderId, setSenderId] = useState(null);
  const [newMessagesCount, setNewMessagesCount] = useState(null);
  const containerRef = useScrollToBottom(messages);
  // Toggling sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.emit("onlineUsers");
  }, [socket, currentUser]);
  useEffect(() => {
    if (socket) {
      const handleBeforeUnload = () => {
        socket.emit("userLeftGroupChat"); // Emit the event when the user leaves the chat
      };

      // Listen for when the component is unmounted (using cleanup function)
      return () => {
        socket.emit("userLeftGroupChat"); // Emit the event when the component unmounts
        socket.removeListener("userLeftGroupChat", handleBeforeUnload); // Cleanup event listeners
      };
    }
  }, [socket]); // Only run on socket update

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/auth/get-all-users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        setGroupUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setError("Failed to load friends. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    const fetchSenderId = async () => {
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
        setSenderId(response.data._id);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setError("Failed to load friends. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSenderId();
    fetchFriends();
  }, []);
  useEffect(() => {
    const fetchGroupMessages = async () => {
      if (socket && currentUser) {
        try {
          const response = await axios.get(
            `https://natalias-kitchen-backend.vercel.app/api/messages/get-group-messages`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
              },
            }
          );
          setMessages(response.data); // Postavljanje poruka za odabranog korisnika
          socket.emit("userInGroupChat"); // Emitovanje da je korisnik u čatu
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
    fetchGroupMessages();
  }, [socket, currentUser]);
  useEffect(() => {
    if (socket) {
      console.log("Socket connected:", socket.id); // This will log the socket ID once the socket is connected.
    }
  }, [socket]);
  const goToUserProfile = (email) => {
    navigate("/searched-user", { state: { query: email } });
  };
  const handleSendMessage = async (message) => {
    if (socket && (message.text.trim() || message.file)) {
      socket.emit("checkIfOnline", senderId, (isOnline) => {
        if (isOnline) {
          try {
            // Emitovanje poruke putem WebSocket-a za real-time komunikaciju
            socket.emit("newGroupMessage", {
              text: message.text,
              file: message.file,
              senderId,
            });
            let time;
            if (message.file) {
              time = 5000;
            } else time = 1000;
            setTimeout(async () => {
              try {
                const response = await axios.get(
                  `https://natalias-kitchen-backend.vercel.app/api/messages/get-group-messages`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "userToken"
                      )}`,
                    },
                  }
                );
                setMessages(response.data);
              } catch (error) {
                console.error("Error fetching messages:", error);
              }
            }, time);
          } catch (error) {
            console.error("Error sending message:", error);
            console.log(error);
            // Možeš dodati Swal ili neki drugi način obaveštavanja korisnika o grešci
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to send message.",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "You are offline",
            text: "You cannot send a message while you are offline.",
          });
        }
      });
    }
  };
  useEffect(() => {
    console.log("Updated online users:", onlineUsers);
  }, [onlineUsers]);
  useEffect(() => {
    if (socket && currentUser) {
      const handleMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };
      const handleError = (data) => {
        Swal.fire({
          icon: "error",
          title: "Message Failed",
          text: data.error || "An unknown error occurred. Please try again.",
          confirmButtonText: "OK",
        });
      };
      const handleUsersOnline = (users) => {
        setOnlineUsers(new Set(users)); // Ažuriramo online korisnike
      };
      const handleGroupMessagesUpdate = async () => {
        try {
          console.log(111);
          const response = await axios.get(
            `https://natalias-kitchen-backend.vercel.app/api/messages/get-group-messages`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
              },
            }
          );
          setMessages(response.data); // Postavljanje poruka za odabranog korisnika
          console.log(response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      socket.on("groupMessagesUpdated", handleGroupMessagesUpdate);
      socket.on("getOnlineUsers", handleUsersOnline);
      socket.on("groupMessageSent", handleMessage);
      socket.on("messageError", handleError);
      // Cleanup funkcija za uklanjanje starog listener-a
      return () => {
        socket.off("groupMessageSent", handleMessage);
        socket.off("messageError", handleError);
        socket.off("getOnlineUsers", handleUsersOnline);
        socket.off("groupMessagesUpdated", handleGroupMessagesUpdate);
      };
    }
  }, [socket, currentUser, newMessagesCount]);
  return (
    <div className="flex h-screen">
      {/* Sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute my-20 top-4 left-4 z-10 bg-blue-500 text-white p-2 rounded-full"
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-1/4 bg-white border-r border-gray-300 p-4">
          <h2 className="text-xl font-semibold mb-4">Group Users</h2>
          <ul>
            {groupUsers.map((user) => (
              <li
                key={user._id}
                className="flex items-center mb-4 cursor-pointer p-2 rounded-lg hover:bg-gray-100 relative"
              >
                <button onClick={() => goToUserProfile(user.email)}>
                  <img
                    src={`${getBaseUrl()}${
                      user.profilePicture || defaultAvatar
                    }`}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                </button>
                <div className="flex items-center space-x-2">
                  <span>{user.name}</span>
                  {/* Green circle for online status */}
                  {onlineUsers.has(user._id) && (
                    <span className="w-3 h-3 bg-green-500 rounded-full absolute top-1/2 right-0 transform -translate-y-1/2"></span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chat area */}
      <div
        className={`max-w-[70%] flex-1 flex flex-col bg-slate-100 h-2/3 ${
          isSidebarOpen ? "ml-0 md:ml-1/4" : ""
        }`}
      >
        <div className="flex items-center bg-white p-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold">Group Chat</h2>
        </div>

        {/* Messages display */}
        <div
          className="flex-1 p-6 overflow-y-auto space-y-4"
          ref={containerRef}
        >
          <GroupMessagesDisplay
            messages={messages}
            currentUserId={senderId}
            groupUsers={groupUsers}
          />
        </div>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default GroupChat;
