import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const EditAccount = () => {
  const { deleteAccount, reauthenticateUser } = useAuth();

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
      <h2 className="text-2xl font-semibold mb-6">Edit Account Settings</h2>

      {/* Opcije za promene */}
      <div className="w-full max-w-lg mb-6 p-6 bg-white shadow-md rounded">
        <div className="space-y-4">
          <Link
            to="/update-name"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            Change Name
          </Link>

          <Link
            to="/update-password"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            Change Password
          </Link>

          <Link
            to="/update-image"
            className="block w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
          >
            Change Profile Image
          </Link>

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

export default EditAccount;
