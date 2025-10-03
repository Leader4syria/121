import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { ThemeProvider } from "@/react-app/hooks/useTheme";
import PopupAd from "@/react-app/components/PopupAd";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import LoginPage from "@/react-app/pages/Login";
import RegisterPage from "@/react-app/pages/Register";
import CategoriesPage from "@/react-app/pages/Categories";
import WalletPage from "@/react-app/pages/Wallet";
import AddFundsPage from "@/react-app/pages/AddFunds";
import PaymentDetailsPage from "@/react-app/pages/PaymentDetails";
import MyOrdersPage from "@/react-app/pages/MyOrders";
import MyPaymentsPage from "@/react-app/pages/MyPayments";

// Admin pages
import AdminLoginPage from "@/react-app/pages/admin/AdminLogin";
import AdminDashboard from "@/react-app/pages/admin/Dashboard";
import AdminUsers from "@/react-app/pages/admin/Users";
import AdminProducts from "@/react-app/pages/admin/Products";
import AdminCategories from "@/react-app/pages/admin/Categories";
import AdminBanners from "@/react-app/pages/admin/Banners";
import AdminOrders from "@/react-app/pages/admin/Orders";
import CatalogManagement from "@/react-app/pages/admin/CatalogManagement";
import ServiceProviders from "@/react-app/pages/admin/ServiceProviders";
import AdminTransactions from "@/react-app/pages/admin/Transactions";
import AdminPaymentMethods from "@/react-app/pages/admin/PaymentMethods";
import AdminSettings from "@/react-app/pages/admin/Settings";
import AdminsManagement from "@/react-app/pages/admin/Admins";
import AdminPopups from "@/react-app/pages/admin/Popups";

function AppContent() {
  const location = useLocation();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:id" element={<CategoriesPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/add-funds" element={<AddFundsPage />} />
        <Route path="/payment/:id" element={<PaymentDetailsPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/my-payments" element={<MyPaymentsPage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/banners" element={<AdminBanners />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/catalog" element={<CatalogManagement />} />
        <Route path="/admin/providers" element={<ServiceProviders />} />
        <Route path="/admin/payment-methods" element={<AdminPaymentMethods />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/admins" element={<AdminsManagement />} />
        <Route path="/admin/popups" element={<AdminPopups />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
      <PopupAd currentPath={location.pathname} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
