// User types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser extends User {
  token?: string;
}

// Product types
export interface Product {
  id: number;
  user_id: number;
  name: string;
  description: string;
  price: number;
  size?: string;
  color?: string;
  image?: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  size?: string;
  color?: string;
  stock_quantity: number;
}

// Order types
export interface Order {
  id: number;
  product_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'simulated';
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  amount: number;
  created_at: string;
  updated_at: string;
  product_name?: string;
  price?: number;
  image?: string;
}

export interface CreateOrderData {
  product_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  amount: number;
  quantity?: number;
}

// Form data types
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// API response types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  register: (userData: RegisterFormData) => Promise<{ success: boolean; token?: string; user?: User }>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Hook return types
export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | void>;
  refetch: () => Promise<void>;
}

// Component prop types
export interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: number) => void;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Export all types for use in components
