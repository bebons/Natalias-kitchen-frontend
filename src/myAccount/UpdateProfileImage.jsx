import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./UpdateProfileImage.css";
import defaultAvatar from "../assets/avatar.png";

const UpdateProfileImage = () => {
  const [image, setImage] = useState(null); // Držimo izabranu sliku
  const [loading, setLoading] = useState(false); // Držimo status učitavanja
  const [error, setError] = useState(null); // Držimo greške
  const [imagePreview, setImagePreview] = useState(null); // Držimo privremenu sliku za prikaz
  const [fileName, setFileName] = useState(""); // Držimo naziv fajla

  const token = localStorage.getItem("userToken"); // Token iz localStorage

  // Učitavanje trenutne slike korisnika
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/get-profile-image", // URL za učitavanje slike
          {
            headers: {
              Authorization: `Bearer ${token}`, // Dodaj token u zaglavlje
            },
          }
        );

        if (response.data && response.data.profilePicture) {
          console.log(response.data.profilePicture);
          setImagePreview(
            `http://localhost:5000${response.data.profilePicture}` // Formiranje kompletnog URL-a
          );
        } else {
          setImagePreview(defaultAvatar); // Ako nema slike, koristi podrazumevanu
        }
      } catch (err) {
        console.error("Failed to fetch profile image", err);
        setImagePreview(defaultAvatar); // U slučaju greške postavite podrazumevanu sliku
      }
    };

    fetchProfileImage();
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, and GIF images are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // Maksimalna veličina 5 MB
        setError("File size exceeds 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generišite URL za prikaz
      setFileName(file.name); // Postavite naziv fajla
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", image); // Dodaj sliku

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/update-image", // URL za ažuriranje slike
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Dodaj token u zaglavlje
          },
        }
      );

      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Image Updated",
          text: "Your profile image has been updated successfully.",
        });
        window.location.reload(); // This will reload the page

        // Ažurirajte prikaz sa novom slikom
      }
    } catch (error) {
      setError("Failed to upload image");
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error uploading the image. Please try again.",
      });
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  return (
    <div className="update-profile-image">
      <h2>Update Profile Image</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="image-upload">Choose Image</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {imagePreview && (
          <div className="image-preview">
            <img
              src={imagePreview}
              alt="Image Preview"
              className="current-image"
            />
          </div>
        )}
        {error && <p>{error}</p>}
        <br />
        <div>
          <button type="submit" disabled={loading || !image}>
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfileImage;
