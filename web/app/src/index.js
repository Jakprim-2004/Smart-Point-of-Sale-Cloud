import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import Register from "./pages/Register"; 


import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Product from "./pages/Product";
import User from "./pages/User";
import Sale from "./pages/Sale";
import BillSales from "./pages/BillSales";
import SumSalePerDay from "./pages/SumSalePerDay";
import Stock from "./pages/Stock";
import ReportStock from "./pages/ReportStock";
import Dashboard from "./pages/Dashboard";
import Terms from "./pages/Terms";
import DashboardReport from "./pages/DashboardReport";
import Customer from "./pages/Customer";
import Reward from "./pages/Reward";
import Category from "./pages/Category";
import LoginCustomer from "./pages/LoginCustomer";
import DetailCustomer from "./pages/DetailCustomer";
import PointHistory from "./pages/PointHistory";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
 {
    path: "/Register",
    element: <Register />,
 },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/product",
    element: <Product />,
  },
  {
    path: "/user",
    element: <User />,
  },
  {
    path: "/sale",
    element: <Sale />,
  },
  {
    path: "/billSales",
    element: <BillSales />,
  },
  {
    path: "/sumSalePerDay",
    element: <SumSalePerDay />,
  },
  {
    path: "/stock",
    element: <Stock />,
  },
  {
    path: "/reportStock",
    element: <ReportStock />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/terms",
    element: <Terms/>,
  },
  {
    path: "/dashboardreport",
    element: <DashboardReport />,
  },
  {
    path: "/customer",
    element: <Customer />,
  },{
    path: "/reward",
    element: <Reward />,
  },{
    path: "/category",
    element: <Category />,
  },{
    path: "/login/customer",
    element: <LoginCustomer />,
  },{
    path: "/DetailCustomer",
    element: <DetailCustomer />,
  },{
    path: "/PointHistory",
    element: <PointHistory />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);

reportWebVitals();
