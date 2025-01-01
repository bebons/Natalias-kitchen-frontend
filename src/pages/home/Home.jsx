import React from "react";
import { Banner } from "./Banner";
import { TopSellers } from "./TopSellers";
import { Recommended } from "./Recommended";

export const Home = () => {
  return (
    <>
      <Banner />
      <TopSellers />
      <Recommended />
    </>
  );
};
