import React from "react";
import bannerImg from "../../assets/banner.png";

export const Banner = () => {
  return (
    <div className="flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12">
      {/* Slika - zauzima pola širine na velikim ekranima */}
      <div className="md:w-1/2 w-full flex items-center md:justify-end">
        <img src={bannerImg} alt="" className="w-full h-auto" />
      </div>

      {/* Tekst - zauzima pola širine na velikim ekranima */}
      <div className="md:w-1/2 w-full">
        <h1 className="md:text-5xl text-2xl font-medium mb-7">Homemade Food</h1>
        <p className="mb-10">
          Homemade Food refers to dishes that are prepared and cooked at home
          rather than purchased from restaurants or pre-packaged. These meals
          are typically made from fresh ingredients and can range from simple
          snacks to elaborate meals. Homemade cooking allows for creativity in
          the kitchen and often brings a sense of warmth and connection to
          family traditions.
          <br />
          This is Natalia's kitchen and welcome to her homemade food heaven!
        </p>
      </div>
    </div>
  );
};
