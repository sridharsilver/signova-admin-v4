import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageSkeleton } from "@/components/common/PageSkeleton";

// ── Eagerly loaded (critical path) ───────────────────────────────────────────
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Wrapper to handle Vite chunk load errors (happens when the app updates while open)
const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      const component = await componentImport();
      sessionStorage.removeItem("chunk-load-error-refresh");
      return component;
    } catch (error: any) {
      const isChunkLoadError = error?.message?.includes("Failed to fetch dynamically imported module") || error?.name === "ChunkLoadError";
      if (isChunkLoadError) {
        const hasRefreshed = sessionStorage.getItem("chunk-load-error-refresh");
        if (!hasRefreshed) {
          sessionStorage.setItem("chunk-load-error-refresh", "true");
          window.location.reload();
          return new Promise(() => {}); // Prevent React from immediately throwing
        }
      }
      throw error;
    }
  });
};

// ── Lazily loaded (route-based code splitting) ────────────────────────────────
// Each page becomes its own JS chunk, downloaded only when the route is visited.
const Dashboard        = lazyWithRetry(() => import("./pages/Dashboard"));
const Employees        = lazyWithRetry(() => import("./pages/Employees"));
const Leave            = lazyWithRetry(() => import("./pages/Leave"));
const Attendance       = lazyWithRetry(() => import("./pages/Attendance"));
const Documents        = lazyWithRetry(() => import("./pages/Documents"));
const Announcements    = lazyWithRetry(() => import("./pages/Announcements"));
const Reports          = lazyWithRetry(() => import("./pages/Reports"));
const Settings         = lazyWithRetry(() => import("./pages/Settings"));
const Profile          = lazyWithRetry(() => import("./pages/Profile"));
const Products         = lazyWithRetry(() => import("./pages/Products"));
const ProductCategories = lazyWithRetry(() => import("./pages/ProductCategories"));
const ProductDirectory = lazyWithRetry(() => import("./pages/ProductDirectory"));
const Users            = lazyWithRetry(() => import("./pages/Users"));
const Debug            = lazyWithRetry(() => import("./pages/Debug"));

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Suspense fallback={<PageSkeleton />}>
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
                <Route path="/products/directory" element={<ProtectedRoute module="products_qr"><ProductDirectory /></ProtectedRoute>} />
                <Route path="/products/categories" element={<ProtectedRoute module="products"><ProductCategories /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute module="super_admin"><Users /></ProtectedRoute>} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/debug" element={<Debug />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;

