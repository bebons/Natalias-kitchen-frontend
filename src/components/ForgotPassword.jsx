import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import axios from "axios";
import { useForm } from "react-hook-form";
const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      const email = data.email;
      const url = "http://localhost:5000/api/auth/check-user";
      await axios.post(url, { email });

      await resetPassword(email);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Paswword reset email sent, check your inbox!",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      if (error.response) {
        // HTTP odgovor sa greškom od servera
        if (error.response.status === 404) {
          setMessage("User with this email doesn't exist.");
        } else {
          setMessage(
            error.response.data.message ||
              "An error occurred. Please try again."
          );
        }
      } else {
        // Greška van HTTP odgovora (npr. mrežna greška)
        setMessage("Failed to connect to the server. Please try again.");
      }
      console.error("Error resetting password:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {" "}
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              {...register("email", { required: true })}
              type="email"
              name="email"
              id="email"
              placeholder="Your Email Address"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
          </div>
          <div>
            {message && (
              <p className="text-red-500 text-xs italic mb-3">{message}</p>
            )}
          </div>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
