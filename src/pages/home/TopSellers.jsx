import React, { useEffect, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useFetchAllFoodQuery } from "../../redux/features/food/foodApi";
import { FoodCard } from "../food/FoodCard";

const categories = ["Choose a category", "Meal", "Beverage", "Desert"];

export const TopSellers = () => {
  const [selectedCategory, setSelectedCategory] = useState("Choose a category");

  const { data: food = [] } = useFetchAllFoodQuery();

  const filteredFood =
    selectedCategory === "Choose a category"
      ? food
      : food.filter(
          (eachFood) => eachFood.category === selectedCategory.toLowerCase()
        );

  return (
    <div className="py-10">
      <h2 className="text-3xl font-semibold mb-6">Menu</h2>
      {/*category-filtering*/}
      <div className="mb-8 flex items-center">
        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          name="category"
          id="category"
          className="border bg-[#EAEAEA] border-gray-300 rounded-md px-4 py-2 focus:outline-none"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        navigation={true}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 50,
          },
          1180: {
            slidesPerView: 3,
            spaceBetween: 50,
          },
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {filteredFood.map((food, index) => (
          <SwiperSlide key={index}>
            <FoodCard localFood={food} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
