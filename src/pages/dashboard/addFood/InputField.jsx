import React from "react";

const InputField = ({
  label,
  name,
  type = "text",
  register,
  placeholder,
  required = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        type={type}
        step={type === "number" ? "0.01" : undefined} // Allow decimals for number inputs
        {...register(name, {
          required: required ? "This field is required" : false,
        })}
        className="p-2 border w-full rounded-md focus:outline-none focus:ring focus:border-blue-300"
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputField;
