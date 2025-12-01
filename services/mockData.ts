import { StripeProduct, StripeSession, StripeBalanceTransaction } from '../types';

const MOCK_PRODUCTS: StripeProduct[] = [
  { id: 'prod_1', name: 'Pro Subscription' },
  { id: 'prod_2', name: 'Starter Kit' },
  { id: 'prod_3', name: 'Enterprise License' },
  { id: 'prod_4', name: 'Consulting Hour' },
];

export const generateMockData = (): { 
  products: StripeProduct[]; 
  sessions: StripeSession[]; 
  balanceTransactions: StripeBalanceTransaction[] 
} => {
  const sessions: StripeSession[] = [];
  const balanceTransactions: StripeBalanceTransaction[] = [];
  const now = Date.now() / 1000;
  const daySeconds = 86400;

  // Generate 90 days of data
  for (let i = 0; i < 150; i++) {
    const timeOffset = Math.floor(Math.random() * (90 * daySeconds));
    const created = now - (90 * daySeconds) + timeOffset;
    
    // Pick a random product
    const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
    const price = Math.floor(Math.random() * 5000) + 1000; // $10 - $60
    
    // Create Session
    const session: StripeSession = {
      id: `sess_${i}`,
      created,
      amount_total: price,
      currency: 'usd',
      line_items: {
        data: [{
          id: `li_${i}`,
          amount_subtotal: price,
          quantity: 1,
          description: product.name,
          price: {
            id: `price_${i}`,
            product: product.id,
            unit_amount: price,
            currency: 'usd'
          }
        }]
      }
    };
    sessions.push(session);

    // Create Balance Transaction (Fee is usually ~2.9% + 30c)
    const fee = Math.floor(price * 0.029 + 30);
    balanceTransactions.push({
      id: `txn_${i}`,
      amount: price,
      fee: fee,
      net: price - fee,
      currency: 'usd',
      created,
      type: 'charge'
    });
  }

  // Sort by date ascending
  sessions.sort((a, b) => a.created - b.created);
  balanceTransactions.sort((a, b) => a.created - b.created);

  return { products: MOCK_PRODUCTS, sessions, balanceTransactions };
};