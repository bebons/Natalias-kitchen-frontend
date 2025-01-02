import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const productToAdd = action.payload;

      // Check if the item with the same options already exists in the cart
      const existingItem = state.cartItems.find(
        (item) =>
          item._id === productToAdd._id &&
          JSON.stringify(item.options) === JSON.stringify(productToAdd.options) // Compare the options
      );

      if (existingItem) {
        // If item exists, just increase the quantity (or modify based on requirements)
        existingItem.quantity += 1;
      } else {
        // Otherwise, add the item to the cart with the initial quantity of 1
        state.cartItems.push({ ...productToAdd, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      const productToRemove = action.payload;
      const existingItem = state.cartItems.find(
        (item) =>
          item._id === productToRemove._id &&
          JSON.stringify(item.options) ===
            JSON.stringify(productToRemove.options)
      );

      if (existingItem) {
        if (existingItem.quantity > 1) {
          // If quantity > 1, just decrease the quantity
          existingItem.quantity -= 1;
        } else {
          // If quantity is 1, remove the item from the cart
          state.cartItems = state.cartItems.filter(
            (item) =>
              item._id !== productToRemove._id ||
              JSON.stringify(item.options) !==
                JSON.stringify(productToRemove.options)
          );
        }
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});
export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export const selectCartTotalItems = (state) => {
  return state.cart.cartItems.reduce((total, item) => total + item.quantity, 0);
};
export default cartSlice.reducer;
