import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getImgUrl } from "../../utils/getImg";
import {
  clearCart,
  removeFromCart,
  selectCartTotalItems,
} from "../../redux/features/cart/cartSlice";

export const CartPage = () => {
  const totalItems = useSelector(selectCartTotalItems);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const calculateTotalPrice = (product) => {
    let total = product.newPrice;

    // Dodavanje cene opcija
    if (product.options) {
      if (product.options.fillings) {
        total += product.options.fillings.reduce(
          (acc, filling) => acc + filling.price,
          0
        );
      }
      if (product.options.toppings) {
        total += product.options.toppings.reduce(
          (acc, topping) => acc + topping.price,
          0
        );
      }
      if (product.options.spices) {
        total += product.options.spices.reduce(
          (acc, spice) => acc + spice.price,
          0
        );
      }
    }

    return total;
  };
  const totalPrice = cartItems
    .reduce((acc, item) => acc + calculateTotalPrice(item) * item.quantity, 0)
    .toFixed(2);
  const handleRemoveFromCart = (product) => {
    dispatch(removeFromCart(product));
  };
  const handleClearCart = () => {
    dispatch(clearCart());
  };
  const renderSelectedOptions = (options) => {
    return (
      <div className="mt-2">
        {options?.fillings?.length > 0 && (
          <div>
            <strong>Fillings:</strong>
            <ul>
              {options.fillings.map((filling, index) => (
                <li key={index} className="text-sm text-gray-500">
                  {filling.name} - ${filling.price}
                </li>
              ))}
            </ul>
          </div>
        )}

        {options?.toppings?.length > 0 && (
          <div>
            <strong>Toppings:</strong>
            <ul>
              {options.toppings.map((topping, index) => (
                <li key={index} className="text-sm text-gray-500">
                  {topping.name} - ${topping.price}
                </li>
              ))}
            </ul>
          </div>
        )}

        {options?.spices?.length > 0 && (
          <div>
            <strong>Spices:</strong>
            <ul>
              {options.spices.map((spice, index) => (
                <li key={index} className="text-sm text-gray-500">
                  {spice.name} - ${spice.price}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  return (
    <>
      <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-xl">
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between">
            <div className="text-lg font-medium text-gray-900">
              Shopping cart
            </div>
            <div className="ml-3 flex h-7 items-center ">
              <button
                onClick={handleClearCart}
                type="button"
                className="relative -m-2 py-1 px-2 bg-red-500 text-white rounded-md hover:bg-secondary transition-all duration-200  "
              >
                <span className="">Clear Cart</span>
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="flow-root">
              {cartItems.length > 0 ? (
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                  {cartItems.map((product, index) => (
                    <li key={`${product.id}-${index}`} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          alt=""
                          src={`${getImgUrl(product?.coverImage)}`}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex flex-wrap justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link to="/">{product?.title}</Link>
                            </h3>
                            <p className="sm:ml-4">
                              $
                              {(
                                calculateTotalPrice(product) * product.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {renderSelectedOptions(product?.options)}
                        <div className="flex flex-1 flex-wrap items-end justify-between space-y-2 text-sm">
                          <p className="text-gray-500">
                            <strong>Qty:</strong> {product.quantity}
                          </p>

                          <div className="flex">
                            <button
                              onClick={() => handleRemoveFromCart(product)}
                              type="button"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No product found!</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Total</p>
            <p>${totalPrice ? totalPrice : 0}</p>
          </div>

          <div className="mt-6">
            <Link
              to="/checkout"
              className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Checkout
            </Link>
          </div>
          <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
            <Link to="/">
              or
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
              >
                Back to home page
                <span aria-hidden="true"> &rarr;</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
