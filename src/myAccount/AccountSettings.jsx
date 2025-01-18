import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const AccountSettings = () => {
  const { deleteAccount, reauthenticateUser, currentUser } = useAuth();

  const handleDeactivateAccount = async () => {
    const url = `https://natalias-kitchen-backend.vercel.app/api/auth/delete-user`;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const email = await Swal.fire({
          title: "Reauthenticate",
          input: "email",
          inputLabel: "Enter your email",
          inputPlaceholder: "Your email",
          inputValidator: (value) => {
            if (!value) {
              return "You need to enter your email!";
            }
          },
        });

        const password = await Swal.fire({
          title: "Reauthenticate",
          input: "password",
          inputLabel: "Enter your password",
          inputPlaceholder: "Your password",
          inputAttributes: {
            type: "password",
          },
          inputValidator: (value) => {
            if (!value) {
              return "You need to enter your password!";
            }
          },
        });

        if (email.value && password.value) {
          const token = localStorage.getItem("userToken");
          await reauthenticateUser(email.value, password.value);
          await deleteAccount();
          await axios.post(
            url,
            {
              email: email.value,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          Swal.fire(
            "Deleted!",
            "Your account has been deleted after reauthentication.",
            "success"
          );
        } else {
          Swal.fire("Cancelled", "Reauthentication was cancelled.", "info");
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "Failed to delete your account. Please try again.",
          "error"
        );
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center p-6">
      <h2 className="text-2xl font-semibold mb-6">My Account </h2>

      {/* Options Navigation */}
      <div className="w-full max-w-lg mb-6 p-6 bg-white shadow-md rounded">
        <div className="space-y-4">
          {/* Prva dva linka */}
          <Link
            to="/orders"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            Orders
          </Link>
          <Link
            to="/my-profile"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            Profile
          </Link>
          <Link
            to="/my-friends"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            Friends
          </Link>
          <Link
            to="/edit-account"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            Edit Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
