import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { getImgUrl } from "../../utils/getImg";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { useFetchFoodByIdQuery } from "../../redux/features/food/foodApi";
import Swal from "sweetalert2"; // Import SweetAlert2
import "sweetalert2/dist/sweetalert2.min.css"; // O

export const CompleteFood = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data: food, isLoading, isError } = useFetchFoodByIdQuery(id);
  const [selectedOptions, setSelectedOptions] = useState({
    fillings: [],
    toppings: [],
    spices: [],
  });

  // Funkcija za selektovanje opcija
  const handleOptionChange = (type, option, isChecked) => {
    setSelectedOptions((prev) => {
      const newOptions = { ...prev };
      if (isChecked) {
        newOptions[type] = [...newOptions[type], option]; // Dodaj opciju
      } else {
        newOptions[type] = newOptions[type].filter(
          (item) => item.name !== option.name
        ); // Ukloni opciju
      }
      return newOptions;
    });
  };
  // Funkcija za dodavanje u korpu
  const handleAddToCart = (product) => {
    const productWithOptions = {
      ...product,
      options: selectedOptions,
    };
    dispatch(addToCart(productWithOptions));
    Swal.fire({
      title: "Added to Cart!",
      text: `${product.title} has been added to your cart.`,
      icon: "success",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load food data.</div>;
  if (!food) return null;
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="sm:w-1/2 h-80 border rounded-md overflow-hidden flex-shrink-0">
          <img
            src={`${getImgUrl(food?.coverImage)}`}
            alt="Food"
            className="w-full h-full object-cover p-2 hover:scale-105 transition-transform duration-200"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-gray-800 hover:text-blue-600 mb-4">
            {food?.title}
          </h3>
          <p className="text-gray-700 mb-6">{food?.description}</p>
          <p className="text-xl font-medium text-gray-900 mb-6">
            ${food?.newPrice}
            <span className="line-through text-gray-500 text-lg ml-2">
              ${food?.oldPrice}
            </span>
          </p>

          {food?.options && (
            <div className="mb-8">
              {food?.options.fillings?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Fillings
                  </h4>
                  <div className="space-y-2">
                    {food?.options.fillings.map((filling, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`filling-${filling.name}`}
                          className="mr-2"
                          onChange={(e) =>
                            handleOptionChange(
                              "fillings",
                              filling,
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor={`filling-${filling.name}`}
                          className="text-gray-700"
                        >
                          {filling.name} - ${filling.price}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {food?.options.toppings?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Toppings
                  </h4>
                  <div className="space-y-2">
                    {food?.options.toppings.map((topping, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`topping-${topping.name}`}
                          className="mr-2"
                          onChange={(e) =>
                            handleOptionChange(
                              "toppings",
                              topping,
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor={`topping-${topping.name}`}
                          className="text-gray-700"
                        >
                          {topping.name} - ${topping.price}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {food?.options.spices?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Spices
                  </h4>
                  <div className="space-y-2">
                    {food?.options.spices.map((spice, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`spice-${spice.name}`}
                          className="mr-2"
                          onChange={(e) =>
                            handleOptionChange(
                              "spices",
                              spice,
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor={`spice-${spice.name}`}
                          className="text-gray-700"
                        >
                          {spice.name} - ${spice.price}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => handleAddToCart(food)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 shadow-md transition-colors duration-200"
          >
            <FiShoppingCart />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
