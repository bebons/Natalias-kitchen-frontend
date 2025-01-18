import React from "react";
import { useGetOrderByEmailQuery } from "../redux/features/orders/ordersApi";
import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";

export const OrderPage = () => {
  const { currentUser } = useAuth();
  const token = localStorage.getItem("userToken"); // Pronađi token iz Redux stanja

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useGetOrderByEmailQuery(currentUser.email, {
    // Dodaj token u zaglavlje
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error getting orders data</div>;

  return (
    <div className="container mx-auto p-6">
      <h2>Your orders:</h2>
      {orders.length === 0 ? (
        <div>No orders found!</div>
      ) : (
        <div>
          {orders.map((order, index) => (
            <div key={`order._id-${index}`} className="border-b mb-4 pb-4">
              <p className="p-1 bg-secondary text-white w-10 rounded mb-1">
                # {index + 1}
              </p>
              <h2 className="font-bold">Order ID: {order._id}</h2>
              <p className="text-gray-600">Name: {order.name}</p>
              <p className="text-gray-600">Email: {order.email}</p>
              <p className="text-gray-600">Phone: {order.phone}</p>
              <h3 className="font-semibold mt-2">
                {order.isDelivery ? "Address:" : "Picked up"}
              </h3>{" "}
              <p>
                {order.isDelivery && (
                  <>
                    <span>Street: {order.address.street}, </span>
                    <br />
                    <span>Number: {order.address.streetNumber},</span>
                    <br />
                    <span>Floor: {order.address.floor},</span>
                    <br />
                    <span>Flat: {order.address.flatNumber}</span>
                  </>
                )}
              </p>
              {order.isDelivery && (
                <>
                  <h3 className="font-semibold mt-2">Delivery Fee: $4.00</h3>
                </>
              )}
              <h3 className="font-semibold mt-2">Products Id:</h3>
              <ul>
                {order.productIds.map((productId, index) => (
                  <li key={`productId-${index}`}>
                    {productId}

                    {/* Assuming `productOptions` contains options like fillings, toppings, spices */}
                    {/* {order.productOptions?.[productId] && (
                      <div>
                        <p className="font-semibold mt-2">Selected Options:</p>
                        <ul>
                          {order.productOptions[productId].fillings?.length >
                            0 && (
                            <li>
                              <strong>Fillings:</strong>{" "}
                              {order.productOptions[productId].fillings.join(
                                ", "
                              )}
                            </li>
                          )}
                          {order.productOptions[productId].toppings?.length >
                            0 && (
                            <li>
                              <strong>Toppings:</strong>{" "}
                              {order.productOptions[productId].toppings.join(
                                ", "
                              )}
                            </li>
                          )}
                          {order.productOptions[productId].spices?.length >
                            0 && (
                            <li>
                              <strong>Spices:</strong>{" "}
                              {order.productOptions[productId].spices.join(
                                ", "
                              )}
                            </li>
                          )}
                        </ul>
                      </div>
                    )} */}
                  </li>
                ))}
              </ul>
              <p className="text-gray-600">Total Price: ${order.totalPrice}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
