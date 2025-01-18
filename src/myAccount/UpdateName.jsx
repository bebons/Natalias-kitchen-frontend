import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import getBaseUrl from "../utils/baseUrl";

const UpdateName = () => {
  const [message, setMessage] = useState(""); // Poruka greške ili uspeha
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // React Hook Form
  const [isLoading, setIsLoading] = useState(false);

  // Funkcija koja se poziva pri submitovanju forme
  const onSubmit = async (data) => {
    const token = localStorage.getItem("userToken"); // Pretpostavljamo da je token u localStorage

    if (!token) {
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Token missing",
      });
    }

    try {
      setIsLoading(true); // Pokrećemo loading stanje dok traje zahtev

      // Pošaljite zahtev backend-u za ažuriranje imena
      await axios.patch(
        `${getBaseUrl()}/api/auth/update-name`, // Ruta za ažuriranje imena
        { name: data.name }, // Novi name koji korisnik unese
        {
          headers: {
            Authorization: `Bearer ${token}`, // Postavljamo token u header
          },
        }
      );

      // Prikazujemo korisniku uspeh
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Your name has been updated!",
        timer: 2000,
        showConfirmButton: false,
      });

      // Ako je potrebno, možeš redirectovati korisnika na neki drugi deo aplikacije
    } catch (err) {
      setMessage("There was an error updating your name. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false); // Završavamo loading
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Update Your Name</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <input
              {...register("name", { required: "Name is required" })}
              type="text"
              id="name"
              placeholder="new_cool_name"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            {message && (
              <p className="text-red-500 text-xs italic mb-3">{message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Name"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateName;
