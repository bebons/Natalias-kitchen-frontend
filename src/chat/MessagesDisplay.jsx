import React, { useState } from "react";
import { format, isSameDay } from "date-fns";
import styles from "./MessageDisplay.module.css"; // Import CSS module
import axios from "axios";

const MessagesDisplay = ({
  messages,
  currentUserId,
  onEditMessage,
  onDeleteMessage,
}) => {
  const [selectedMessageId, setSelectedMessageId] = useState(null); // Drži ID poruke na koju je kliknuto

  const handleClick = async (id) => {
    try {
      const response = await axios.get(
        `https://natalias-kitchen-backend.vercel.app/api/messages/get-single-message/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`, // Zamenite yourToken vašim stvarnim tokenom
          },
        }
      );
      if (response.data) return;
      setSelectedMessageId(id); // Postavlja trenutno selektovani ID
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (msg) => {
    onEditMessage(msg);
    setSelectedMessageId(null);
  };

  const handleDelete = (msg) => {
    onDeleteMessage(msg);
    setSelectedMessageId(null);
  };

  const renderMessagesWithDate = () => {
    let lastDate = null; // Track the last displayed date

    return messages.map((msg, index) => {
      const messageDate = new Date(msg.createdAt || Date.now());
      const showDate = !lastDate || !isSameDay(messageDate, lastDate);
      lastDate = messageDate;

      const isCurrentUser = msg.senderId === currentUserId;

      // Determine the message status and icon
      let statusIcon;
      let statusClass = "";

      switch (msg.status) {
        case "pending":
          statusIcon = "⌛"; // Sat for pending
          statusClass = styles.statusPending;
          break;
        case "sent":
          statusIcon = "✓"; // One tick for sent
          statusClass = styles.statusSent;
          break;
        case "delivered":
          statusIcon = "✓✓"; // Two ticks for delivered
          statusClass = styles.statusDelivered;
          break;
        case "read":
          statusIcon = "✓✓"; // Two bold ticks for read
          statusClass = styles.statusRead;
          break;
        default:
          statusIcon = "";
          statusClass = "";
      }

      return (
        <React.Fragment key={index}>
          {/* Display date header */}
          {showDate && (
            <div className="text-center my-4">
              <span className="bg-gray-300 text-gray-800 px-4 py-1 rounded-full text-sm">
                {format(messageDate, "MMMM d, yyyy")}
              </span>
            </div>
          )}

          {/* Display message */}
          <div
            className={`max-w-[60%] p-3 rounded-lg shadow-md ${
              isCurrentUser
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-gray-800"
            }`}
            style={{
              alignSelf: isCurrentUser ? "flex-end" : "flex-start",
            }}
            onClick={() => handleClick(msg._id)}
          >
            {/* File Attachment */}
            {msg.file && (
              <>
                {typeof msg.file === "string" &&
                  (msg.file.match(
                    /\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg|ico)$/i
                  ) ? (
                    <img
                      src={msg.file}
                      alt="Message attachment"
                      className="max-w-full h-auto mt-2 rounded-md"
                    />
                  ) : (
                    <a
                      href={msg.file}
                      download={msg.file?.name || "file"}
                      className="text-blue-300 underline text-xs block mt-1"
                    >
                      {msg.file?.name || "Download Attachment"}
                    </a>
                  ))}
              </>
            )}

            {/* Message Text */}
            <p className="text-sm mt-2">{msg.text}</p>

            {/* Timestamp and Sender */}
            <p className="text-xs mt-2 flex items-center justify-between">
              {isCurrentUser && (
                <span className={`message-status ${statusClass} text-xs`}>
                  {statusIcon}
                  {msg.isEdited && (
                    <span className="ml-1 text-yellow-400" title="Edited">
                      ✏️
                    </span>
                  )}
                </span>
              )}
              <span>{format(new Date(msg.createdAt), "HH:mm")}</span>
            </p>
          </div>

          {/* Prikaz ikona samo za selektovanu poruku */}
          {selectedMessageId === msg._id && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                justifyContent: "flex-end", // Poravnanje na desno
              }}
            >
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(msg);
                }}
              >
                ✏️
              </span>
              <span
                style={{ cursor: "pointer", color: "red" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(msg);
                }}
              >
                🗑️
              </span>
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-4">
      {renderMessagesWithDate()}
    </div>
  );
};

export default MessagesDisplay;
