import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import ordersApi from "./features/orders/ordersApi";
import foodApi from "./features/food/foodApi";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [foodApi.reducerPath]: foodApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(foodApi.middleware, ordersApi.middleware),
});
