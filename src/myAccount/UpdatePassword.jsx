import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { updateUserPassword, reauthenticateUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

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

      await updateUserPassword(data.password);

      Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "Your account has been updated successfully.",
        timer: 3000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        // Handle reauthentication
        try {
          const email = prompt("Enter your email to reauthenticate:");
          const password = prompt("Enter your password to reauthenticate:");

          if (email && password) {
            await reauthenticateUser(email, password);
            await updateUserPassword(data.password);

            Swal.fire({
              icon: "success",
              title: "Password updated",
              text: "Your account has been updated successfully.",
              timer: 3000,
              showConfirmButton: false,
            });
            navigate("/");
          } else {
            setMessage("Reauthentication canceled.");
          }
        } catch (reauthErr) {
          console.error("Reauthentication failed:", reauthErr);
          setMessage("Failed to reauthenticate. Please try again.");
        }
      } else {
        setMessage("Failed to update password. Please try again.");
      }
      console.error("Error during update:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">
          Type in your new password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 relative">
            <input
              {...register("password", { required: true })}
              type={showPassword ? "text" : "password"} // Toggles between password and text
              name="password"
              id="password"
              placeholder="some_new_shit"
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
              placeholder="type_that_shit_again"
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

export default UpdatePassword;
