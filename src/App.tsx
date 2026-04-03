import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthWrapper from "./wrapper/AuthWrapper";
import Layout from "./Layout";
import NotFound from "./components/NotFound";
import Dashboard from "./pages/Dashboard";
import OrderDetails from "./pages/orderDetails";
import Settlements from "./pages/settlements/Settlements";
import Settlement from "./pages/settlements/Settlement";
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
              <Route path="settlements" element={<Settlements />} />
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
