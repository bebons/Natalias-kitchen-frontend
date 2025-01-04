import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
export const VerifyEmail = () => {
  const { registerUser } = useAuth();
  const { token } = useParams(); // Dobijamo token iz URL-a
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(""); // Store email
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        const response = await axios.get(
          `https://vercel.com/bebons-projects/natalias-kitchen-backend/api/auth/verify/${token}`
        );
        setEmail(response.data.email); // Extract email from response

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
        setMessage("password minimum 6 characters");
        return;
      }
      await axios.post(
        `https://vercel.com/bebons-projects/natalias-kitchen-backend/api/auth/finish-registration/${token}`
      );

      await registerUser(email, data.password); //pravi usera u firebase

      Swal.fire({
        icon: "success",
        title: "Account made",
        text: "Your account has been created successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      // Redirect back to the login page or inform them to verify
      navigate("/");
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
          <div className="mb-4">
            <input
              {...register("password", { required: true })}
              type="password"
              name="password"
              id="password"
              placeholder="iLoveWomen"
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
              Sumbit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
