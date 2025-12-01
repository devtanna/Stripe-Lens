import {
  StripeProduct,
  StripeSession,
  StripeBalanceTransaction,
  StripeInvoice,
  DashboardData,
  ProductSummary
} from '../types';
import { generateMockData } from './mockData';
import { format } from 'date-fns';

// Helper to fetch from Stripe with Authorization header
const fetchStripe = async (endpoint: string, apiKey: string) => {
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Stripe API Error');
  }
  return response.json();
};

export const fetchDashboardData = async (apiKey: string | null, useDemo: boolean): Promise<DashboardData> => {
  let products: StripeProduct[] = [];
  let sessions: StripeSession[] = [];
  let invoices: StripeInvoice[] = [];
  let balanceTransactions: StripeBalanceTransaction[] = [];

  if (useDemo || !apiKey) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const mock = generateMockData();
    products = mock.products;
    sessions = mock.sessions;
    balanceTransactions = mock.balanceTransactions;
    invoices = [];
  } else {
    // REAL FETCH
    // Note: In a real client-side app, this might fail due to CORS if not proxied.
    // For this demo, we implement the logic correctly as if it were running in a Next.js API route or allowed origin.
    try {
      // 1. Fetch Products
      const prodData = await fetchStripe('/products?limit=100&active=true', apiKey);
      products = prodData.data;

      // 2. Fetch Checkout Sessions (to link revenue to products)
      // Expand line_items to see what was sold
      const sessionData = await fetchStripe('/checkout/sessions?limit=100&expand[]=data.line_items', apiKey);
      sessions = sessionData.data;

      // 3. Fetch Invoices (to capture invoiced revenue)
      // Expand lines to see what was invoiced
      const invoiceData = await fetchStripe('/invoices?limit=100&status=paid&expand[]=data.lines', apiKey);
      invoices = invoiceData.data;

      // 4. Fetch Balance Transactions (to get accurate fees)
      const balData = await fetchStripe('/balance_transactions?limit=100', apiKey);
      balanceTransactions = balData.data;

    } catch (e) {
      console.error("Stripe Fetch Error:", e);
      throw e;
    }
  }

  // --- PROCESSING LOGIC ---

  // 1. Map Product IDs to Names
  const productMap = new Map<string, string>();
  products.forEach(p => productMap.set(p.id, p.name));

  // 2. Calculate Totals
  const totalFees = balanceTransactions.reduce((acc, txn) => acc + txn.fee, 0);
  const sessionRevenue = sessions.reduce((acc, sess) => acc + sess.amount_total, 0);
  const invoiceRevenue = invoices.reduce((acc, inv) => acc + inv.amount_paid, 0);
  const totalGross = sessionRevenue + invoiceRevenue;

  // Note: balanceTransactions total might differ from session + invoice total if there are other types of charges.
  // For this simple view, we use balanceTransactions for fees and Sessions + Invoices for revenue breakdown.

  // 3. Process Sessions and Invoices into a time-series per product
  const productStats = new Map<string, ProductSummary>();
  const chartDataMap = new Map<string, any>();

  // Note: We don't pre-initialize productStats anymore since we aggregate by product name
  // and products can come from different sources (sessions, invoices)

  // Helper function to process line items
  const processLineItem = (
    productId: string,
    amount: number,
    quantity: number,
    dateKey: string,
    created: number,
    customerEmail?: string | null
  ) => {
    if (!chartDataMap.has(dateKey)) {
      chartDataMap.set(dateKey, { name: dateKey, date: created });
    }

    const chartPoint = chartDataMap.get(dateKey);

    // Determine product name - always use base product name for aggregation
    let baseProductName = productMap.get(productId) || 'Unknown Product';

    // For unknown products from invoices, use a more descriptive name
    if (baseProductName === 'Unknown Product' && customerEmail) {
      baseProductName = `Invoice to ${customerEmail}`;
    }

    // Update Product Totals (now always use base product name as key)
    const currentStat = productStats.get(baseProductName) || {
      id: baseProductName,
      name: baseProductName,
      totalRevenue: 0,
      unitsSold: 0
    };

    currentStat.totalRevenue += amount;
    currentStat.unitsSold += quantity;
    productStats.set(baseProductName, currentStat);

    // Update Chart Point (using base product name)
    chartPoint[baseProductName] = (chartPoint[baseProductName] || 0) + amount;
  };

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => a.created - b.created);

  // Process sessions
  sortedSessions.forEach(session => {
    const dateKey = format(new Date(session.created * 1000), 'MMM d');

    if (session.line_items && session.line_items.data) {
      session.line_items.data.forEach(item => {
        const productId = item.price?.product;
        const amount = item.amount_subtotal;

        if (productId) {
          processLineItem(productId, amount, item.quantity || 1, dateKey, session.created);
        }
      });
    }
  });

  // Sort invoices by date
  const sortedInvoices = [...invoices].sort((a, b) => a.created - b.created);

  // Process paid invoices
  sortedInvoices.forEach(invoice => {
    const dateKey = format(new Date(invoice.created * 1000), 'MMM d');
    const customerEmail = invoice.customer_email;

    if (invoice.lines && invoice.lines.data) {
      invoice.lines.data.forEach(item => {
        const productId = item.price?.product;
        const amount = item.amount;

        if (productId) {
          processLineItem(productId, amount, item.quantity || 1, dateKey, invoice.created, customerEmail);
        }
      });
    }
  });

  // Convert chartDataMap to Array
  let chartData = Array.from(chartDataMap.values());
  
  // Sort by Date
  chartData.sort((a, b) => a.date - b.date);

  // Transform to Cumulative
  // We need to carry forward the totals for each product
  const productNames = Array.from(productStats.values()).map(p => p.name);
  const runningTotals: Record<string, number> = {};
  productNames.forEach(n => runningTotals[n] = 0);

  const cumulativeChartData = chartData.map(point => {
    const newPoint: any = { name: point.name, date: point.date };
    productNames.forEach(name => {
      const dailyAmount = point[name] || 0;
      runningTotals[name] += dailyAmount;
      // Store value in dollars (not cents)
      newPoint[name] = runningTotals[name] / 100; 
    });
    return newPoint;
  });

  // Convert stats to array and sort by revenue
  const productList = Array.from(productStats.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    summary: {
      totalRevenue: totalGross / 100,
      totalFees: totalFees / 100,
      netRevenue: (totalGross - totalFees) / 100,
      transactionCount: sessions.length + invoices.length
    },
    products: productList,
    chartData: cumulativeChartData
  };
};