import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import getBaseUrl from "../utils/baseUrl";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Check for token expiration on component mount
    const token = localStorage.getItem("token");
    const tokenTime = localStorage.getItem("tokenTime");

    if (token && tokenTime) {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - tokenTime;
      if (timeDiff >= 60 * 60 * 1000) {
        // 1 hour
        localStorage.removeItem("token");
        localStorage.removeItem("tokenTime");
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Token has been expired, please log in again",
        });
        navigate("/admin");
      }
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${getBaseUrl()}/api/auth/admin`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const auth = response.data;
      if (auth.token) {
        // Store token and the current time
        localStorage.setItem("token", auth.token);
        localStorage.setItem("tokenTime", new Date().getTime().toString());

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully logged in!",
          timer: 1000,
          showConfirmButton: false,
        });

        // Redirect to the dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage("Please provide a valid username and password");
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              {...register("username", { required: true })}
              type="text"
              name="username"
              id="username"
              placeholder="john_half"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              {...register("password", { required: true })}
              type="password"
              name="password"
              id="password"
              placeholder="secret123"
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
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
