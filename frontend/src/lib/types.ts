export type LoginResponse = {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    phone: string;
    role: "owner" | "staff" | string;
    is_staff: boolean;
    is_superuser: boolean;
    shop_id: number | null;
  };
};

export type DashboardStats = {
  total_customers: number;
  sales_today: number;
  total_due: number;
  profit_today: number;
  profit_monthly: number;
  chart_data: { date: string; revenue: number; profit: number }[];
};

export type SuperAdminStats = {
  total_shops: number;
  total_users: number;
  total_customers: number;
  shops_by_type: { type: string; count: number }[];
};

export type SuperAdminShop = {
  id: number;
  name: string;
  address: string;
  phone: string;
  type: string;
  owner_name: string;
  owner_phone: string;
  user_count: number;
  customer_count: number;
  total_sales_count: number;
  total_revenue: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  buy_price: string;
  sale_price: string;
  stock_quantity: number;
  created_at: string;
};

export type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string;
  credit_limit: string;
  total_due: string;
};

export type SaleItem = {
  id?: number;
  product: number;
  product_name?: string;
  quantity: number;
  unit_price: string;
  unit_buy_price?: string;
};

export type Sale = {
  id: number;
  customer: number | null;
  customer_name?: string;
  total_amount: string;
  paid_amount: string;
  due_amount: string;
  sale_date: string;
  created_at: string;
  items?: SaleItem[];
};

export type Payment = {
  id: number;
  customer: number;
  amount: string;
  payment_date: string;
  note: string;
};
