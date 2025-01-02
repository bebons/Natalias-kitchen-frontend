import React, { useEffect, useState } from "react";
import InputField from "../addFood/InputField";
import SelectField from "../addFood/SelectField";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Loading from "../../../components/Loading";
import Swal from "sweetalert2";
import axios from "axios";
import getBaseUrl from "../../../utils/baseUrl";
import {
  useFetchFoodByIdQuery,
  useUpdateFoodMutation,
} from "../../../redux/features/food/foodApi";

export const UpdateFood = () => {
  const { id } = useParams();
  const {
    data: foodData,
    isLoading,
    isError,
    refetch,
  } = useFetchFoodByIdQuery(id);
  const [updateFood] = useUpdateFoodMutation();
  const { register, handleSubmit, setValue, reset } = useForm();
  ///////////////////////////////////////////////////////////////////
  const [fillings, setFillings] = useState([{ name: "", price: "" }]);
  const [toppings, setToppings] = useState([{ name: "", price: "" }]);
  const [spices, setSpices] = useState([{ name: "", price: "" }]);
  const [clickedFillings, setClickedFillings] = useState(false);
  const [clickedToppings, setClickedToppings] = useState(false);
  const [clickedSpices, setClickedSpices] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileName, setImageFileName] = useState("");

  useEffect(() => {
    if (foodData) {
      // Set initial values for form fields
      setValue("title", foodData.title);
      setValue("description", foodData.description);
      setValue("category", foodData.category);
      setValue("trending", foodData.trending);
      setValue("oldPrice", foodData.oldPrice);
      setValue("newPrice", foodData.newPrice);
      setValue("coverImage", foodData.coverImage);

      // Dynamically set values for fillings, toppings, and spices
      setValue(
        "options.fillings",
        foodData.options.fillings || [{ name: "", price: "" }]
      );
      setValue(
        "options.toppings",
        foodData.options.toppings || [{ name: "", price: "" }]
      );
      setValue(
        "options.spices",
        foodData.options.spices || [{ name: "", price: "" }]
      );

      // Update state
      setFillings(foodData.options.fillings || [{ name: "", price: "" }]);
      setToppings(foodData.options.toppings || [{ name: "", price: "" }]);
      setSpices(foodData.options.spices || [{ name: "", price: "" }]);
      setImageFileName(foodData.coverImage || "");
    }
  }, [foodData, setValue]);

  const handleOptionChange = (type, index, field, value) => {
    if (type === "fillings") {
      const updatedFillings = [...fillings];
      updatedFillings[index][field] = value;
      setFillings(updatedFillings);
    }
    if (type === "toppings") {
      const updatedToppings = [...toppings];
      updatedToppings[index][field] = value;
      setToppings(updatedToppings);
    }
    if (type === "spices") {
      const updatedSpices = [...spices];
      updatedSpices[index][field] = value;
      setSpices(updatedSpices);
    }
  };

  const onSubmit = async (data) => {
    const filteredFillings = fillings.filter(
      (filling) => filling.name.trim() && filling.price
    );
    const filteredToppings = toppings.filter(
      (topping) => topping.name.trim() && topping.price
    );
    const filteredSpices = spices.filter(
      (spice) => spice.name.trim() && spice.price
    );
    try {
      let imageUrl = imageFileName;

      // If image is changed, upload new image
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadResponse = await axios.post(
          `${getBaseUrl()}/api/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageUrl = uploadResponse.data.imageUrl;
      }

      // Prepare data for updating food
      const updateFoodData = {
        ...data,
        coverImage: imageUrl,
        options: {
          fillings: filteredFillings,
          toppings: filteredToppings,
          spices: filteredSpices,
        },
      };

      // Make PUT request to update food
      await axios.put(`${getBaseUrl()}/api/food/edit/${id}`, updateFoodData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Display success message
      Swal.fire({
        title: "Food Updated",
        text: "Your food is updated successfully!",
        icon: "success",
        showCancelButton: false,
        showConfirmButton: false,
        timer: 1000,
      });

      // Refetch data after update
      await refetch();
    } catch (error) {
      console.log("Failed to update food.");
      Swal.fire({
        title: "Food NOT updated",
        text: "An error occurred",
        icon: "error",
        showCancelButton: false,
        showConfirmButton: false,
        timer: 1000,
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

  const handleAddOption = (type) => {
    if (type === "fillings" && fillings.length === 1) {
      setClickedFillings(true);
    }
    if (type === "toppings" && toppings.length === 1) {
      setClickedToppings(true);
    }
    if (type === "spices" && spices.length === 1) {
      setClickedSpices(true);
    }
    if (type === "fillings") {
      setFillings([...fillings, { name: "", price: "" }]);
    }
    if (type === "toppings") {
      setToppings([...toppings, { name: "", price: "" }]);
    }
    if (type === "spices") {
      setSpices([...spices, { name: "", price: "" }]);
    }
  };

  const handleRemoveOption = (type, index) => {
    if (type === "fillings" && fillings.length === 1) {
      setClickedFillings(false);
    }
    if (type === "toppings" && toppings.length === 1) {
      setClickedToppings(false);
    }
    if (type === "spices" && spices.length === 1) {
      setClickedSpices(false);
    }

    if (type === "fillings") {
      const updatedFillings = fillings.filter((_, i) => i !== index);
      setFillings(updatedFillings);
    }
    if (type === "toppings") {
      const updatedToppings = toppings.filter((_, i) => i !== index);
      setToppings(updatedToppings);
    }
    if (type === "spices") {
      const updatedSpices = spices.filter((_, i) => i !== index);
      setSpices(updatedSpices);
    }
  };
  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching food data</div>;
  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Food</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Title"
          name="title"
          placeholder="Enter food title"
          register={register}
          required={true}
        />

        <InputField
          label="Description"
          name="description"
          placeholder="Enter food description"
          type="textarea"
          register={register}
          required={true}
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
          required={true}
        />

        <InputField
          label="New Price"
          name="newPrice"
          type="number"
          placeholder="New Price"
          register={register}
          required={true}
        />

        {/* Image upload */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2 w-full"
          />
          {imageFileName && (
            <p className="text-sm text-gray-500">Selected: {imageFileName}</p>
          )}
        </div>

        {/* Fillings options */}
        {(fillings.length > 0 || clickedFillings) &&
          fillings.map((filling, index) => (
            <div key={index} className="mb-4">
              <InputField
                label={`Filling #${index + 1} Name`}
                name={`options.fillings[${index}].name`}
                placeholder="Enter filling name"
                register={register}
              />
              <InputField
                label={`Filling #${index + 1} Price`}
                name={`options.fillings[${index}].price`}
                type="number"
                placeholder="Enter filling price"
                register={register}
              />
              <button
                type="button"
                onClick={() => handleRemoveOption("fillings", index)}
                className="text-red-500"
              >
                Remove Filling
              </button>
            </div>
          ))}

        {/* Toppings options */}
        {(toppings.length > 0 || clickedToppings) &&
          toppings.map((topping, index) => (
            <div key={index} className="mb-4">
              <InputField
                label={`Topping #${index + 1} Name`}
                name={`options.toppings[${index}].name`}
                placeholder="Enter topping name"
                register={register}
              />
              <InputField
                label={`Topping #${index + 1} Price`}
                name={`options.toppings[${index}].price`}
                type="number"
                placeholder="Enter topping price"
                register={register}
              />
              <button
                type="button"
                onClick={() => handleRemoveOption("toppings", index)}
                className="text-red-500"
              >
                Remove Topping
              </button>
            </div>
          ))}

        {/* Spices options */}
        {(spices.length > 0 || clickedSpices) &&
          spices.map((spice, index) => (
            <div key={index} className="mb-4">
              <InputField
                label={`Spice #${index + 1} Name`}
                name={`options.spices[${index}].name`}
                placeholder="Enter spice name"
                register={register}
              />
              <InputField
                label={`Spice #${index + 1} Price`}
                name={`options.spices[${index}].price`}
                type="number"
                placeholder="Enter spice price"
                register={register}
              />
              <button
                type="button"
                onClick={() => handleRemoveOption("spices", index)}
                className="text-red-500"
              >
                Remove Spice
              </button>
            </div>
          ))}

        {/* Add more buttons */}
        <button
          type="button"
          onClick={() => handleAddOption("fillings")}
          className="text-blue-500"
        >
          Add Fillings
        </button>
        <hr />
        <button
          type="button"
          onClick={() => handleAddOption("toppings")}
          className="text-blue-500"
        >
          Add Toppings
        </button>
        <br />
        <hr />
        <button
          type="button"
          onClick={() => handleAddOption("spices")}
          className="text-blue-500"
        >
          Add Spices
        </button>
        <hr />
        <br />
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white font-bold rounded-md"
        >
          Update Food
        </button>
      </form>
    </div>
  );
};
