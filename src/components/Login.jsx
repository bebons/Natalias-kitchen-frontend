import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export const Login = () => {
  const [message, setMessage] = useState("");
  const { loginUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("userToken");
      const tokenTime = localStorage.getItem("userTokenTime");

      if (token && tokenTime) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - tokenTime;

        if (timeDiff >= 60 * 60 * 1000) {
          // Token istekao posle 1h
          localStorage.removeItem("userToken");
          localStorage.removeItem("userTokenTime");
          Swal.fire({
            icon: "error",
            title: "Session Expired",
            text: "Token has expired, please log in again",
          });
          navigate("/login");
        }
      }
    }, 5000); // Proveravaj svakih 5 sekundi (ili bilo koji interval po tvom izboru)

    // Očisti interval kada komponenta bude unmountovana
    return () => clearInterval(intervalId);
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      await loginUser(data.email, data.password);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Successfully logged in!",
        timer: 1000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (err) {
      setMessage("please provide a valid email and password");
      console.error(err);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Successfully signed in!",
        timer: 1000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Google sign-in failed. Please try again.",
      });
      console.error(err);
    }
  };
  return (
    <div className="h-[calc(100vh - 120px)] flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Please Login</h2>
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
              placeholder="Email Adress"
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
              placeholder="Password"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
          </div>
          <div>
            {message && (
              <p className="text-red-500 text-xs italic mb-3">{message}</p>
            )}
          </div>
          {/*forgot password */}
          <div>
            {message && (
              <>
                <p className="align-baseline font-medium mt-4 text-sm">
                  Forgot your password?{" "}
                  <Link
                    to="/forgot-password"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Click here to reset.
                  </Link>
                </p>
              </>
            )}
          </div>
          <br />
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline">
              Log in
            </button>
          </div>
        </form>
        <p className="align-baseline font-medium mt-4 text-sm">
          No account?{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-700">
            Register here
          </Link>
        </p>

        {/*google sigin in*/}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex flex-wrap gap-1 items-center justify-center bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
          >
            <FaGoogle className="mr-2" />
            Sign in with google
          </button>
        </div>
      </div>
    </div>
  );
};
