import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Home } from "../pages/home/Home";
import { Login } from "../components/Login";
import { Register } from "../components/Register";
import { CartPage } from "../pages/food/CartPage";
import { CheckoutPage } from "../pages/food/CheckoutPage";
import { OrderPage } from "../myAccount/OrderPage";
import AdminRoute from "./AdminRoute";
import { AddFood } from "../pages/dashboard/addFood/AddFood";
import ManageFood from "../pages/dashboard/manageFood/ManageFood";
import { Dashboard } from "../pages/dashboard/Dashboard";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import AdminLogin from "../components/AdminLogin";
import { UpdateFood } from "../pages/dashboard/editFood/UpdateFood";
import { CompleteFood } from "../pages/food/CompleteFood";
import { VerifyEmail } from "../components/VerifyEmail";
import ForgotPassword from "../components/ForgotPassword";
import AccountSettings from "../myAccount/AccountSettings";
import UpdatePassword from "../myAccount/UpdatePassword";
import GroupChat from "../chat/GroupChat";
import UpdateName from "../myAccount/UpdateName";
import UpdateProfileImage from "../myAccount/UpdateProfileImage";
import EditAccount from "../myAccount/EditAccount";
import Inbox from "../chat/Inbox";
import UserProfile from "../chat/UserProfile";
import MyProfile from "../myAccount/MyProfile";
import FriendRequests from "../chat/FriendRequests";
import MyFriends from "../myAccount/MyFriends";
import UserChat from "../chat/UserChat";

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
        path: "/user-chat",
        element: (
          <PrivateRoute>
            <Inbox />
          </PrivateRoute>
        ),
      },
      {
        path: "/group-chat",
        element: (
          <PrivateRoute>
            <GroupChat />
          </PrivateRoute>
        ),
      },
      {
        path: "/my-friends",
        element: (
          <PrivateRoute>
            <MyFriends />
          </PrivateRoute>
        ),
      },
      {
        path: "/direct-messages",
        element: (
          <PrivateRoute>
            <UserChat />
          </PrivateRoute>
        ),
      },
      {
        path: "/friend-requests",
        element: (
          <PrivateRoute>
            <FriendRequests />
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
      {
        path: "/update-name",
        element: (
          <PrivateRoute>
            <UpdateName />
          </PrivateRoute>
        ),
      },
      {
        path: "/update-image",
        element: (
          <PrivateRoute>
            <UpdateProfileImage />
          </PrivateRoute>
        ),
      },
      {
        path: "/edit-account",
        element: (
          <PrivateRoute>
            <EditAccount />
          </PrivateRoute>
        ),
      },
      {
        path: "/group-chat",
        element: (
          <PrivateRoute>
            <GroupChat />
          </PrivateRoute>
        ),
      },
      {
        path: "/searched-user",
        element: (
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        ),
      },
      {
        path: "/my-profile",
        element: (
          <PrivateRoute>
            <MyProfile />
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

      // {
      //   path: "find-people",
      //   element: (
      //     <AdminRoute>
      //       < />
      //     </AdminRoute>
      //   ),
      // },
    ],
  },
]);

export default router;
