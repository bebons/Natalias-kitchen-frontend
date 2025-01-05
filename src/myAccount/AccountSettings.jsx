import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import axios from "axios";

const AccountSettings = () => {
  const { deleteAccount, reauthenticateUser, currentUser } = useAuth();
  const handleDeactivateAccount = async () => {
    //za brisanje mejla iz monga
    const url = `https://natalias-kitchen-backend.vercel.app/api/auth/delete-user`;
    //////
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
        // Reauthentication is required
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
          await reauthenticateUser(email.value, password.value);
          await deleteAccount(); // Retry deleting account after reauthentication
          await axios.post(url, { email: email.value });
          Swal.fire(
            "Deleted!",
            "Your account has been deleted after reauthentication.",
            "success"
          );
        } else {
          Swal.fire("Cancelled", "Reauthentication was cancelled.", "info");
        }
      } catch (error) {
        console.error("Error during account deletion:", error);
        console.log(error.code);
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
      <h2 className="text-2xl font-semibold mb-6">My Account Settings</h2>

      {/* Options Navigation */}
      <div className="w-full max-w-lg mb-6 p-6 bg-white shadow-md rounded">
        <h3 className="text-xl font-medium mb-4">Account Options</h3>
        <div className="space-y-4">
          {/* Navigate to OrderPage */}
          <Link
            to="/orders"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            View Orders
          </Link>

          {/* Navigate to UpdatePassword */}
          <Link
            to="/update-password"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            Update Password
          </Link>

          {/* Deactivate Account - Button */}
          <button
            onClick={handleDeactivateAccount}
            className="w-full bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
