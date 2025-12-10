import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CurrencyProvider } from './hooks/useCurrency';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import ProductForm from './components/ProductForm';
import ProductPage from './components/ProductPage';
import OrdersHistory from './components/OrdersHistory';
import HomePage from './components/HomePage';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import Footer from './components/Footer';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth() as any;
  const { user, loading } = auth;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth() as any;
  const { user, loading } = auth;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Home Route Component (always accessible, no redirect)
function HomeRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Main App Component
function App() {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={
                  <HomeRoute>
                    <HomePage />
                  </HomeRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/new"
                element={
                  <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersHistory />
                  </ProtectedRoute>
                }
              />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </CurrencyProvider>
  );
}

export default App;
