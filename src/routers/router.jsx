import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Home } from "../pages/home/Home";
import { Login } from "../components/Login";
import { Register } from "../components/Register";
import { CartPage } from "../pages/food/CartPage";
import { CheckoutPage } from "../pages/food/CheckoutPage";
import { OrderPage } from "../pages/food/OrderPage";
import AdminRoute from "./AdminRoute";
import { AddFood } from "../pages/dashboard/addFood/AddFood";
import ManageFood from "../pages/dashboard/manageFood/ManageFood";
import { Dashboard } from "../pages/dashboard/Dashboard";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import { FoodCard } from "../pages/food/FoodCard";
import PrivateRoute from "./PrivateRoute";
import AdminLogin from "../components/AdminLogin";
import { UpdateFood } from "../pages/dashboard/editFood/UpdateFood";
import { CompleteFood } from "../pages/food/CompleteFood";
import { VerifyEmail } from "../components/VerifyEmail";
import ForgotPassword from "../components/ForgotPassword";
import AccountSettings from "../myAccount/AccountSettings";
import UpdatePassword from "../myAccount/UpdatePassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/orders",
        element: (
          <PrivateRoute>
            <OrderPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: (
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/food/:id",
        element: <CompleteFood />,
      },
      {
        path: "/verify/:token",
        element: <VerifyEmail />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/my-account",
        element: (
          <PrivateRoute>
            <AccountSettings />
          </PrivateRoute>
        ),
      },
      {
        path: "/update-password",
        element: (
          <PrivateRoute>
            <UpdatePassword />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/dashboard",
    element: (
      <AdminRoute>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: "",
        element: (
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        ),
      },
      {
        path: "add-new-food",
        element: (
          <AdminRoute>
            <AddFood />
          </AdminRoute>
        ),
      },
      {
        path: "edit-food/:id",
        element: (
          <AdminRoute>
            <UpdateFood />
          </AdminRoute>
        ),
      },
      {
        path: "manage-food",
        element: (
          <AdminRoute>
            <ManageFood />
          </AdminRoute>
        ),
      },
    ],
  },
]);

export default router;
