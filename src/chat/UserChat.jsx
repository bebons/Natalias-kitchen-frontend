import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";
import defaultAvatar from "../assets/avatar.png"; // Default avatar
import { FaComments, FaPaperclip, FaPaperPlane } from "react-icons/fa"; // Import chat icon
import { FaBars, FaTimes } from "react-icons/fa"; // Icons for toggle button
import { useLocation, useNavigate } from "react-router-dom";
import MessagesDisplay from "./MessagesDisplay";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Swal from "sweetalert2";
const MessageInput = ({ onSendMessage, editedMessage }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now()); // Unique key to reset the file input
  useEffect(() => {
    if (editedMessage) {
      console.log(editedMessage.text);
      setMessage(editedMessage.text || "");
      setFile(editedMessage.file || null);
    }
  }, [editedMessage]);

  const handleSend = () => {
    if (message.trim() || file) {
      const isEditing = editedMessage && editedMessage._id; // Check if it's an edited message
      if (isEditing) {
        // If editing, you may want to include the _id to update the message
        onSendMessage({ text: message, file, id: editedMessage._id });
      } else {
        // If it's a new message, send it without the _id
        onSendMessage({ text: message, file });
      }

      setMessage(""); // Clear input after sending
      setFile(null); // Clear selected file
      setFileKey(Date.now()); // Reset file input
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Set the selected file
  };
  const handleRemoveFile = () => {
    setFile(null); // Reset the file state
    setFileKey(Date.now()); // Reset file input to ensure the file picker updates
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
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <strong>Selected file:</strong> {file.name || "unknown"}
          <button
            onClick={handleRemoveFile}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
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

const UserChat = () => {
  const { socket } = useSocket();
  const { currentUser } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [messages, setMessages] = useState([]);
  // const [selectedUser, setSelectedUser] = useState(null);
  const [newMessagesCount, setNewMessagesCount] = useState({});
  const [friends, setFriends] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online users
  const [editedMessage, setEditedMessage] = useState(null); // Ovo je već postavljeno

  const containerRef = useScrollToBottom(messages);
  const [selectedUser, setSelectedUser] = useState(
    location.state?.selectedUser || null
  );
  if (socket && !socket.connected) {
    socket.connect(); // Ponovno povezivanje
  }
  useEffect(() => {
    if (!socket || !currentUser) return;
    console.log(socket);
    socket.emit("onlineUsers");
  }, [socket, currentUser]);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchMessagesForSelectedUser = async () => {
      if (selectedUser && socket && currentUser) {
        try {
          const response = await axios.get(
            `https://natalias-kitchen-backend.vercel.app/api/messages/get/${selectedUser._id}`,
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
      }
    };
    fetchMessagesForSelectedUser();
  }, [selectedUser, socket, currentUser]);

  useEffect(() => {
    if (!socket) return;
    console.log("Socket connected:", socket.id); // This will log the socket ID once the socket is connected.
  }, [socket]);

  useEffect(() => {
    if (socket && selectedUser) {
      const handleBeforeUnload = () => {
        socket.emit("userLeftChat", {
          chatUserId: selectedUser._id,
          currentUserId: senderId,
        });
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    return () => {
      if (selectedUser && socket) {
        // Emitovanje događaja za napuštanje chata
        socket.emit("userLeftChat", {
          chatUserId: selectedUser._id,
          currentUserId: senderId, // Trenutni korisnik
        });
      }
    };
  }, [selectedUser, socket]);
  const handleProfileClick = async (friend) => {
    setSelectedUser(friend);
    if (!socket) return;
    console.log(111);
    socket.emit("userInChat", friend._id);
  };
  const goToUserProfile = (email) => {
    navigate("/searched-user", { state: { query: email } });
  };
  const handleSendMessage = async (message) => {
    if (message.status === "read") {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "You cannot edit a message that has already been read.",
      });
      return; // Exit early if the message is already read
    }
    if (socket && (message.text.trim() || message.file)) {
      socket.emit("checkIfOnline", senderId, (isOnline) => {
        if (isOnline) {
          try {
            // Emitovanje poruke putem WebSocket-a za real-time komunikaciju

            if (message.id) {
              // If editing, include message ID and other info
              socket.emit("editMessage", {
                id: message.id, // Pass the message ID to identify the message being edited
                text: message.text,
                file: message.file,
                receiverId: selectedUser._id,
                senderId,
              });
            } else {
              socket.emit("newMessage", {
                text: message.text,
                file: message.file,
                receiverId: selectedUser._id,
                senderId,
              });
              setMessages([
                ...messages,
                {
                  text: message.text,
                  file: message.file,
                  senderId: senderId,
                  createdAt: new Date(),
                  status: "sent",
                },
              ]);
            }
            let time;
            if (message.file) {
              time = 5000;
            } else time = 1000;
            setTimeout(async () => {
              try {
                const response = await axios.get(
                  `https://natalias-kitchen-backend.vercel.app/api/messages/get/${selectedUser._id}`,
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
            socket.emit(
              "checkIfUserInChat",
              {
                chatUserId: selectedUser._id,
                currentUserId: senderId,
              },
              (isInChat) => {
                if (isInChat) {
                  socket.emit("userInChat", selectedUser._id);
                }
              }
            );
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
    const fetchFriends = async () => {
      setLoading(true);
      setError(null);
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
    if (!socket) return;
    const fetchUnreadMessagesCount = async () => {
      try {
        const response = await axios.get(
          `https://natalias-kitchen-backend.vercel.app/api/messages/unread`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        const formattedCounts =
          response.data.separateUnreadMessagesCount.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {});
        setNewMessagesCount(formattedCounts);
      } catch (error) {
        console.error("Error fetching unread messages count:", error);
      }
    };
    fetchUnreadMessagesCount();
  }, [socket]);

  useEffect(() => {
    if (socket && currentUser) {
      const handleMessage = (message) => {
        if (selectedUser?._id === message.senderId) {
          setMessages((prevMessages) => [...prevMessages, message]);
          console.log(newMessagesCount);
          socket.emit("userInChat", selectedUser._id);
        } else {
          const senderId = message.senderId;
          setNewMessagesCount((prevState) => ({
            ...prevState,
            [senderId]: (prevState[senderId] || 0) + 1,
          }));
        }
      };
      const handleStatusUpdate = (data) => {
        if (selectedUser?._id === data.receiverId) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.senderId === data.senderId && msg.status !== "read"
                ? { ...msg, status: "read" }
                : msg
            )
          );
        }
      };
      const handleMessageNumberUpdate = (data) => {
        if (selectedUser._id === data.senderId) {
          setNewMessagesCount((prevState) => {
            const newState = { ...prevState };
            delete newState[data.senderId]; // Uklonite nepročitane poruke za tog korisnika
            return newState;
          });
        }
      };
      const handleError = (data) => {
        Swal.fire({
          icon: "error",
          title: "Message Failed",
          text: data.error || "An unknown error occurred. Please try again.",
          confirmButtonText: "OK",
        });
      };
      const handleMessagesReceived = (updatedMessageIds) => {
        // Ažuriranje statusa poruka u lokalnom stanju
        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            if (updatedMessageIds.includes(message._id)) {
              return { ...message, status: "delivered" };
            }
            return message;
          });
        });
      };
      const handleUsersOnline = (users) => {
        setOnlineUsers(new Set(users)); // Ažuriramo online korisnike
      };
      socket.on("getOnlineUsers", handleUsersOnline);
      socket.on("messageSent", handleMessage);
      socket.on("messageStatusUpdated", handleStatusUpdate);
      socket.on("messageError", handleError);
      socket.on("messageNumberUpdated", handleMessageNumberUpdate);
      socket.on("messagesMarkedAsReceived", handleMessagesReceived);
      // Cleanup funkcija za uklanjanje starog listener-a
      return () => {
        socket.off("messageSent", handleMessage);
        socket.off("messageStatusUpdated", handleStatusUpdate);
        socket.off("messageError", handleError);
        socket.off("messageNumberUpdated", handleMessageNumberUpdate);
        socket.off("messagesMarkedAsReceived", handleMessagesReceived);
        socket.off("getOnlineUsers", handleUsersOnline);
      };
    }
  }, [socket, currentUser, selectedUser, newMessagesCount]);

  useEffect(() => {
    let i = 0;
  }, [messages]); //nebitan useffect

  ///////////////////////emitovanje poruka
  /////////////////////////////////

  ////////////////////////////
  const handleOnEditMessage = (message) => {
    console.log(message);
    setEditedMessage(message);
  };

  const handleOnDeleteMessage = async (message) => {
    try {
      // Confirm the user wants to delete the message
      const confirmation = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this message? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!confirmation.isConfirmed) return;

      // Send a DELETE request to the server
      const response = await axios.delete(
        `https://natalias-kitchen-backend.vercel.app/api/messages/delete-message/${message._id}`, // Assuming the message object has an _id property
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`, // Include token if required
          },
        }
      );

      if (response.status === 200) {
        // Optionally, update the UI after deletion
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== message._id)
        );
      } else {
        alert("Failed to delete the message. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("An error occurred while deleting the message. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
          <h2 className="text-xl font-semibold mb-4">Friends</h2>
          <ul>
            {friends.map((friend) => (
              <li
                key={friend._id}
                className={`flex items-center mb-4 cursor-pointer p-2 rounded-lg ${
                  selectedUser?._id === friend._id ? "bg-gray-200" : ""
                } hover:bg-gray-100 relative`} // Added relative positioning to allow absolute positioning inside
                onClick={() => handleProfileClick(friend)}
              >
                <img
                  src={`${getBaseUrl()}${
                    friend.profilePicture || defaultAvatar
                  }`}
                  alt="Friend Avatar"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex items-center space-x-2">
                  <span>{friend.name}</span>
                  {newMessagesCount[friend._id] && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">
                      {newMessagesCount[friend._id]}
                    </span>
                  )}
                </div>

                {/* Green circle for online status */}
                {onlineUsers.has(friend._id) && (
                  <span className="w-3 h-3 bg-green-500 rounded-full absolute top-1/2 right-0 transform -translate-y-1/2"></span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col bg-slate-100 h-2/3 ${
          isSidebarOpen ? "ml-0 md:ml-1/4" : ""
        }`}
      >
        {selectedUser ? (
          <>
            {/* Header with selected user */}
            <div className="flex items-center bg-white p-4 border-b border-gray-300">
              <button
                onClick={() => goToUserProfile(selectedUser.email)}
                className="flex items-center"
              >
                <div className="relative">
                  <img
                    src={`${getBaseUrl()}${
                      selectedUser.profilePicture || defaultAvatar
                    }`}
                    alt="Selected User Avatar"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  {/* Green circle for online status */}
                  {onlineUsers.has(selectedUser._id) && (
                    <span className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2"></span>
                  )}
                </div>
              </button>
              <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
            </div>

            {/* Messages display */}
            <div
              className="flex-1 p-6 overflow-y-auto space-y-4"
              ref={containerRef}
            >
              <MessagesDisplay
                messages={messages}
                currentUserId={senderId}
                onEditMessage={handleOnEditMessage}
                onDeleteMessage={handleOnDeleteMessage}
              />
            </div>

            {/* Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              editedMessage={editedMessage}
            />
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center text-gray-600">
              <FaComments className="text-6xl mb-4 text-gray-400" />
              <p className="text-xl">Select a friend to start chatting!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserChat;
