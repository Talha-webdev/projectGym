import { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { publicRoutes, protectedRoutes, adminRoutes, notFoundRoute } from "@/routes";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.match(/^\/admin(\/|$)/);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        {!isAdminRoute && <Navbar />}
        <main className={`flex-1 ${isAdminRoute ? "p-0" : ""}`}>
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingScreen />}>
              <Routes location={location} key={location.pathname}>
                {publicRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<route.element />}
                  />
                ))}
                {protectedRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <ProtectedRoute>
                        <route.element />
                      </ProtectedRoute>
                    }
                  />
                ))}
                {adminRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <route.element />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                ))}
                <Route path={notFoundRoute.path} element={<notFoundRoute.element />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
