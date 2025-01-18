import React, { useState } from "react";
import { format, isSameDay } from "date-fns";
import defaultAvatar from "../assets/avatar.png"; // Default user avatar
import getBaseUrl from "../utils/baseUrl";

// Komponenta za uvećanje slike
const ImageModal = ({ imageSrc, onClose }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    onClick={onClose}
  >
    <div className="relative bg-white p-4 rounded">
      <button
        className="absolute top-0 right-0 p-2 text-white bg-red-500 rounded-full"
        onClick={onClose}
      >
        X
      </button>
      <img
        src={imageSrc}
        alt="Enlarged"
        className="max-w-full max-h-screen object-contain"
      />
    </div>
  </div>
);

const GroupMessagesDisplay = ({ messages, currentUserId, groupUsers }) => {
  const [modalImage, setModalImage] = useState(null); // Stanje za modalnu sliku

  const renderMessagesWithDate = () => {
    let lastDate = null; // Track the last displayed date

    return messages.map((msg, index) => {
      const messageDate = new Date(msg.createdAt || Date.now());
      const showDate = !lastDate || !isSameDay(messageDate, lastDate);
      lastDate = messageDate;

      const isCurrentUser = msg.senderId === currentUserId;

      // Get the sender's avatar and name
      const sender = groupUsers.find((user) => user._id === msg.senderId) || {};
      const senderAvatar = sender.profilePicture
        ? `${getBaseUrl()}${sender.profilePicture}`
        : defaultAvatar;
      const senderName = sender.name || "Unknown";

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
            className={`flex items-start space-x-4 ${
              isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            {/* User avatar */}
            <img
              src={senderAvatar}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />

            <div
              className={`max-w-[60%] p-3 rounded-lg shadow-md break-words ${
                isCurrentUser
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {/* Sender Name */}
              {!isCurrentUser && (
                <p className="text-sm font-semibold mb-1 text-gray-600">
                  {senderName}
                </p>
              )}

              {/* File Attachment */}
              {msg.file && (
                <>
                  {/* If the file is an image, render an <img> tag above the text */}
                  {typeof msg.file === "string" &&
                    (msg.file.match(
                      /\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg|ico)$/i
                    ) ? (
                      <img
                        src={msg.file}
                        alt="Message attachment"
                        className="max-w-full h-auto mt-2 rounded-md cursor-pointer"
                        onClick={() => setModalImage(msg.file)} // Otvori modal sa uvećanom slikom
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

              {/* Timestamp and Read Status */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-right">
                  {format(new Date(msg.createdAt), "HH:mm")}
                </p>
                {msg.isRead && (
                  <span className="text-purple-800 font-bold ml-2">✔</span>
                )}
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-4">
      {renderMessagesWithDate()}

      {/* Modal for Image */}
      {modalImage && (
        <ImageModal imageSrc={modalImage} onClose={() => setModalImage(null)} />
      )}
    </div>
  );
};

export default GroupMessagesDisplay;
