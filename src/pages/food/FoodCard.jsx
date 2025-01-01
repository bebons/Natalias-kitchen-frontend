import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import { getImgUrl } from "../../utils/getImg";
import { Link, useNavigate } from "react-router-dom";

export const FoodCard = ({ localFood }) => {
  const navigate = useNavigate();
  const handleSeeMore = (id) => {
    navigate(`/food/${id}`);
  };
  return (
    <div className="rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="flex items-center justify-center">
        <Link to={`/food/${localFood._id}`}>
          <img
            src={getImgUrl(localFood.coverImage)}
            alt={localFood.title}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <Link to={`/food/${localFood._id}`}>
            <h3 className="text-lg font-semibold hover:text-blue-600">
              {localFood.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mt-2">
            {localFood.description.length > 80
              ? `${localFood.description.slice(0, 80)}...`
              : localFood.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-lg font-medium text-gray-800">
            ${localFood.newPrice}
            {localFood.oldPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${localFood.oldPrice}
              </span>
            )}
          </p>
          <button
            onClick={() => handleSeeMore(localFood._id)}
            className="flex items-center px-4 py-2 bg-primary text-black rounded-md"
          >
            See more
          </button>
        </div>
      </div>
    </div>
  );
};
