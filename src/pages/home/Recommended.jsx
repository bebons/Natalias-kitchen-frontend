import React, { useEffect, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useFetchAllFoodQuery } from "../../redux/features/food/foodApi";
import { FoodCard } from "../food/FoodCard";

export const Recommended = () => {
  const { data: food = [] } = useFetchAllFoodQuery();
  return (
    <div className="py-6">
      <h2 className="text-3xl font-semibold mb-6">Natalia's favourites</h2>
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
        {food.length > 0 &&
          food.slice(8, 11).map((eachFood, index) => (
            <SwiperSlide key={index}>
              <FoodCard localFood={eachFood} />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};
