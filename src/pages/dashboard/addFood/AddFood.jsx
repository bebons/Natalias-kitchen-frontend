import React, { useState } from "react";
import InputField from "./InputField";
import SelectField from "./SelectField";
import { useFieldArray, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useAddFoodMutation } from "../../../redux/features/food/foodApi";
import axios from "axios";
import getBaseUrl from "../../../utils/baseUrl";

export const AddFood = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const {
    fields: fillingFields,
    append: addFilling,
    remove: removeFilling,
  } = useFieldArray({ control, name: "options.fillings" });
  const {
    fields: toppingFields,
    append: addTopping,
    remove: removeTopping,
  } = useFieldArray({ control, name: "options.toppings" });
  const {
    fields: spiceFields,
    append: addSpice,
    remove: removeSpice,
  } = useFieldArray({ control, name: "options.spices" });

  const [imageFile, setImageFile] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [addFood, { isLoading }] = useAddFoodMutation();

  const onSubmit = async (data) => {
    if (!imageFile) {
      Swal.fire({
        title: "Error",
        text: "Please select an image before submitting.",
        icon: "error",
      });
      return;
    }

    try {
      // Upload the image
      const formData = new FormData();
      formData.append("image", imageFile);
      const token = localStorage.getItem("token");
      const uploadResponse = await axios.post(
        `${getBaseUrl()}/api/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          Authorization: `Bearer ${token}`, // Dodaj token za autentifikaciju
        }
      );

      const imageUrl = uploadResponse.data.imageUrl;

      // Prepare new food data
      const newFoodData = {
        ...data,
        coverImage: imageUrl,
      };

      await addFood(newFoodData).unwrap();

      Swal.fire({
        title: "Food Added",
        text: "Your food was uploaded successfully!",
        icon: "success",
      });

      reset();
      setImageFile(null);
      setImageFileName("");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to add food. Please try again.",
        icon: "error",
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileName(file.name);
    }
  };

  const renderOptions = (fields, append, remove, name) =>
    fields.map((field, index) => (
      <div key={field.id} className="mb-4">
        <InputField
          label={`${name} #${index + 1} Name`}
          name={`options.${name}[${index}].name`}
          placeholder={`Enter ${name.toLowerCase()} name`}
          register={register}
        />
        <InputField
          label={`${name} #${index + 1} Price`}
          name={`options.${name}[${index}].price`}
          type="number"
          placeholder={`Enter ${name.toLowerCase()} price`}
          register={register}
        />
        <button
          type="button"
          onClick={() => remove(index)}
          className="text-red-500"
        >
          Remove {name}
        </button>
      </div>
    ));

  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Food</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="">
        <InputField
          label="Title"
          name="title"
          placeholder="Enter food title"
          register={register}
          required
        />
        <InputField
          label="Description"
          name="description"
          placeholder="Enter food description"
          type="textarea"
          register={register}
          required
        />
        <SelectField
          label="Category"
          name="category"
          options={[
            { value: "", label: "Choose A Category" },
            { value: "meal", label: "Meal" },
            { value: "beverage", label: "Beverage" },
            { value: "desert", label: "Desert" },
          ]}
          register={register}
          required
        />
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register("trending")}
              className="rounded text-blue-600 focus:ring focus:ring-offset-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-semibold text-gray-700">
              Trending
            </span>
          </label>
        </div>
        <InputField
          label="Old Price"
          name="oldPrice"
          type="number"
          placeholder="Old Price"
          register={register}
          required
        />
        <InputField
          label="New Price"
          name="newPrice"
          type="number"
          placeholder="New Price"
          register={register}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2 w-full"
            required
          />
          {imageFileName && (
            <p className="text-sm text-gray-500">Selected: {imageFileName}</p>
          )}
        </div>

        <h3 className="text-lg font-bold">Fillings</h3>
        {renderOptions(fillingFields, addFilling, removeFilling, "fillings")}
        <button
          type="button"
          onClick={() => addFilling({ name: "", price: "" })}
          className="text-blue-500"
        >
          Add More Fillings
        </button>

        <h3 className="text-lg font-bold mt-4">Toppings</h3>
        {renderOptions(toppingFields, addTopping, removeTopping, "toppings")}
        <button
          type="button"
          onClick={() => addTopping({ name: "", price: "" })}
          className="text-blue-500"
        >
          Add More Toppings
        </button>

        <h3 className="text-lg font-bold mt-4">Spices</h3>
        {renderOptions(spiceFields, addSpice, removeSpice, "spices")}
        <button
          type="button"
          onClick={() => addSpice({ name: "", price: "" })}
          className="text-blue-500"
        >
          Add More Spices
        </button>

        <button
          type="submit"
          className="w-full py-2 bg-green-500 text-white font-bold rounded-md mt-4"
        >
          {isLoading ? "Adding..." : "Add Food"}
        </button>
      </form>
    </div>
  );
};
