import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCreateOrderMutation } from "../../redux/features/orders/ordersApi";
import { useForm } from "react-hook-form";

export const CheckoutPage = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Helper function to calculate the total price of a product
  const calculateTotalPrice = (product) => {
    let total = product.newPrice || 0;

    if (product.options) {
      total +=
        product.options.fillings?.reduce((sum, f) => sum + f.price, 0) || 0;
      total +=
        product.options.toppings?.reduce((sum, t) => sum + t.price, 0) || 0;
      total +=
        product.options.spices?.reduce((sum, s) => sum + s.price, 0) || 0;
    }

    return total;
  };

  const [totalPrice, setTotalPrice] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  // Update total price whenever cart items or delivery option changes
  useEffect(() => {
    const basePrice = cartItems.reduce(
      (sum, item) => sum + calculateTotalPrice(item) * item.quantity,
      0
    );

    const deliveryCharge = isDelivery ? 4.0 : 0;
    setTotalPrice((basePrice + deliveryCharge).toFixed(2));
  }, [cartItems, isDelivery]);

  // Generate a unique key for each product to avoid duplicates
  const generateUniqueProductKey = (product) => {
    const optionsKey = JSON.stringify(product.options || {});
    return `${product._id}-${optionsKey}`;
  };

  // Form submission handler
  const onSubmit = async (data) => {
    const orderDetails = {
      name: data.name,
      email: currentUser?.email,
      address: {
        street: data.street,
        streetNumber: data.streetNumber,
        floor: data.floor,
        flatNumber: data.flatNumber,
      },
      phone: data.phone,
      productIds: cartItems.flatMap(
        (item) => Array(item.quantity).fill(item._id) // Repeat item._id based on its quantity
      ),
      totalPrice: totalPrice,
      isDelivery: isDelivery,
    };

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Confirm your order details.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, place order",
    });

    if (result.isConfirmed) {
      try {
        await createOrder(orderDetails).unwrap();
        Swal.fire(
          "Order Placed!",
          "Your order has been successfully placed.",
          "success"
        );
        navigate("/orders");
      } catch (err) {
        console.error("Order placement failed:", err);
        Swal.fire(
          "Error",
          "Unable to place your order. Please try again.",
          "error"
        );
      }
    }
  };
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return (
    <section>
      <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
        <div className="container max-w-screen-lg mx-auto">
          <div>
            <div>
              <p className="text-gray-500 mb-2">Total Price: ${totalPrice}</p>
              <p className="text-gray-500 mb-6">
                Items: {cartItems.length > 0 ? totalItems : 0}
              </p>
            </div>

            <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 my-8"
              >
                <div className="text-gray-600">
                  <p className="font-medium text-lg">Personal Details</p>
                  <p>Please fill out all the fields.</p>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                    <div className="md:col-span-5">
                      <label htmlFor="name">Name</label>
                      <input
                        {...register("name", { required: true })}
                        type="text"
                        name="name"
                        id="name"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        disabled
                        defaultValue={currentUser?.email}
                        placeholder="email@domain.com"
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        {...register("phone", { required: true })}
                        type="number"
                        name="phone"
                        id="phone"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        placeholder="+123 456 7890"
                      />
                    </div>

                    {/* Delivery Checkbox */}
                    <div className="md:col-span-5 mt-3">
                      <div className="inline-flex items-center">
                        <input
                          {...register("isDelivery")}
                          onChange={(e) => setIsDelivery(e.target.checked)}
                          type="checkbox"
                          name="isDelivery"
                          id="isDelivery"
                          className="form-checkbox"
                        />
                        <label htmlFor="isDelivery" className="ml-2">
                          I want delivery (+4.00)
                        </label>
                      </div>
                    </div>

                    {/* Address Fields - Conditional Required */}
                    {isDelivery && (
                      <>
                        <div className="md:col-span-2">
                          <label htmlFor="street">Street</label>
                          <input
                            {...register("street", { required: true })}
                            type="text"
                            name="street"
                            id="street"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="streetNumber">Street number</label>
                          <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                            <input
                              {...register("streetNumber", { required: true })}
                              name="streetNumber"
                              id="streetNumber"
                              className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="floor">Floor</label>
                          <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                            <input
                              {...register("floor", { required: true })}
                              name="floor"
                              id="floor"
                              className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-1">
                          <label htmlFor="flatNumber">Flat Number</label>
                          <input
                            {...register("flatNumber", { required: true })}
                            type="text"
                            name="flatNumber"
                            id="flatNumber"
                            className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          />
                        </div>
                      </>
                    )}

                    <div className="md:col-span-5 mt-3">
                      <div className="inline-flex items-center">
                        <input
                          onChange={(e) => setIsChecked(e.target.checked)}
                          type="checkbox"
                          name="billing_same"
                          id="billing_same"
                          className="form-checkbox"
                        />
                        <label htmlFor="billing_same" className="ml-2 ">
                          I agree to the{" "}
                          <a className="underline underline-offset-2 text-blue-600">
                            Terms & Conditions
                          </a>{" "}
                          and{" "}
                          <a className="underline underline-offset-2 text-blue-600">
                            Shopping Policy.
                          </a>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-5 text-right">
                      <button
                        disabled={!isChecked || totalItems === 0}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Place an Order
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
