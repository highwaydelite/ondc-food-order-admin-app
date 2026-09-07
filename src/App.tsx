import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthWrapper from "./wrapper/AuthWrapper";
import Layout from "./Layout";
import NotFound from "./components/NotFound";
import Dashboard from "./pages/Dashboard";
import OrderDetails from "./pages/orderDetails";
import Settlement from "./pages/settlements/Settlement";
import SellerSettlements from "./pages/settlements/SellerSettlements";
import SettlementOrders from "./pages/settlements/SettlementOrders";
import Issues from "./pages/issues/Issues";
import SellerIssues from "./pages/issues/SellerIssues";
import SellerIssue from "./pages/issues/SellerIssue";

function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="admin/dashboard" />} />
            <Route path="admin">
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="order/:orderId" element={<OrderDetails />} />
              {/*
                Payouts are manual now: the Settlements section is the offline
                seller-settlement screen. The old ONDC settlement list is gone, but its
                detail page stays routed — order details still deep-links into it.
              */}
              <Route path="settlements" element={<SellerSettlements />} />
              <Route
                path="settlements/pending/:sellerId"
                element={<SettlementOrders />}
              />
              <Route
                path="settlements/settled/:settlementId"
                element={<SettlementOrders />}
              />
              <Route path="settlements/:id" element={<Settlement />} />
              <Route path="issues" element={<Issues />} />

              <Route path="seller-issues" element={<SellerIssues />} />
              <Route path="seller-issue/:id" element={<SellerIssue />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
