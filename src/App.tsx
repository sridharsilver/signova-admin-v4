import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Leave from "./pages/Leave";
import Attendance from "./pages/Attendance";
import Documents from "./pages/Documents";
import Announcements from "./pages/Announcements";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductCategories from "./pages/ProductCategories";
import ProductDirectory from "./pages/ProductDirectory";
import Users from "./pages/Users";
import Debug from "./pages/Debug";

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/leave" element={<Leave />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/products" element={<ProtectedRoute module="products"><Products /></ProtectedRoute>} />
              <Route path="/products/directory" element={<ProtectedRoute module="products"><ProductDirectory /></ProtectedRoute>} />
              <Route path="/products/categories" element={<ProtectedRoute module="products"><ProductCategories /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute module="super_admin"><Users /></ProtectedRoute>} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/debug" element={<Debug />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
