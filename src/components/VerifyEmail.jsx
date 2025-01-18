import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";

export const VerifyEmail = () => {
  const { registerUser, logout } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        const response = await axios.get(
          `https://natalias-kitchen-backend.vercel.app/api/auth/verify/${token}`
        );
        setEmail(response.data.email);

        Swal.fire({
          icon: "success",
          title: "Email Verified",
          text: response.data.message,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Email verification failed.";
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: errorMessage,
        });
        setMessage(errorMessage);
      }
    };

    verifyUserEmail();
  }, [token]);

  const onSubmit = async (data) => {
    try {
      if (data.password.length < 6) {
        setMessage("Password must be at least 6 characters long.");
        return;
      }
      if (data.password !== data.confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
      await axios.post(
        `https://natalias-kitchen-backend.vercel.app/api/auth/finish-registration/${token}`
      );

      await registerUser(email, data.password);

      await Swal.fire({
        icon: "success",
        title: "Account Created",
        text: "Your account has been created successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      logout();
      navigate("/login");
    } catch (err) {
      setMessage("Failed to register.");
      console.error("Error during registration:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Type in your password</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 relative">
            <input
              {...register("password", { required: true })}
              type={showPassword ? "text" : "password"} // Toggles between password and text
              name="password"
              id="password"
              placeholder="lil_half_king"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mb-4 relative">
            <input
              {...register("confirmPassword", { required: true })}
              type={showConfirmPassword ? "text" : "password"} // Toggles between password and text
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Type that again"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
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
