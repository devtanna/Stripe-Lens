export interface StripeProduct {
  id: string;
  name: string;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
}

export interface StripeBalanceTransaction {
  id: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  created: number;
  type: string;
}

export interface StripeLineItem {
  id: string;
  amount_subtotal: number;
  price: StripePrice;
  description: string;
  quantity: number;
}

export interface StripeSession {
  id: string;
  created: number;
  amount_total: number;
  currency: string;
  line_items?: {
    data: StripeLineItem[];
  };
}

export interface StripeInvoiceLineItem {
  id: string;
  amount: number;
  price?: StripePrice;
  description: string | null;
  quantity: number;
}

export interface StripeInvoice {
  id: string;
  created: number;
  amount_paid: number;
  status: string;
  currency: string;
  customer_email: string | null;
  lines?: {
    data: StripeInvoiceLineItem[];
  };
}

export interface ProcessedTransaction {
  id: string;
  date: number; // timestamp
  productId: string;
  productName: string;
  amount: number;
  fee: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  totalRevenue: number;
  unitsSold: number;
}

export interface DashboardData {
  summary: {
    totalRevenue: number;
    totalFees: number;
    netRevenue: number;
    transactionCount: number;
  };
  products: ProductSummary[];
  chartData: any[]; // formatted for Recharts
}