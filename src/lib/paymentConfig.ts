export interface PaymentGatewaySettings {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  upiEnabled: boolean;
  upiId: string;
  businessName: string;
  cardEnabled: boolean;
  netBankingEnabled: boolean;
  walletsEnabled: boolean;
  defaultCurrency: 'INR' | 'USD' | 'EUR' | 'GBP';
  taxPercentage: number;
  testMode: boolean;
  autoApprove: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  originalAmount: number;
  discountAmount: number;
  taxAmount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'stripe' | 'razorpay' | 'manual';
  providerRef: string;
  couponCode?: string;
  cardLast4?: string;
  cardBrand?: string;
  upiId?: string;
  bankName?: string;
  createdAt: string;
  invoiceNumber: string;
}

const SETTINGS_KEY = 'abdi_payment_settings';
const TRANSACTIONS_KEY = 'abdi_payment_transactions';
export const PAYMENT_EVENT = 'abdi-payment-updated';

export const DEFAULT_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  stripeEnabled: true,
  stripePublishableKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) || '',
  razorpayEnabled: true,
  razorpayKeyId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) || '',
  upiEnabled: true,
  upiId: 'abdi.academy@okhdfcbank',
  businessName: 'ABD"I Academy & Education',
  cardEnabled: true,
  netBankingEnabled: true,
  walletsEnabled: true,
  defaultCurrency: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PAYMENT_CURRENCY as any) || 'INR',
  taxPercentage: 18, // 18% GST standard or 0
  testMode: true,
  autoApprove: true,
};

export const getPaymentSettings = (): PaymentGatewaySettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_PAYMENT_SETTINGS;
    return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
};

export const savePaymentSettings = (settings: PaymentGatewaySettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(PAYMENT_EVENT));
};

export const COUPONS: Record<string, { discountPercent: number; description: string }> = {
  'WELCOME20': { discountPercent: 20, description: '20% off for new learners' },
  'STUDENT50': { discountPercent: 50, description: '50% student scholarship discount' },
  'ABDI100': { discountPercent: 100, description: '100% full scholarship coupon' },
  'SUPERLEARNER': { discountPercent: 30, description: '30% super learner discount' },
};

export const formatCurrency = (amount: number, currency: string = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const listTransactions = (): PaymentTransaction[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveTransaction = (tx: PaymentTransaction) => {
  const existing = listTransactions();
  const idx = existing.findIndex(t => t.id === tx.id);
  let updated: PaymentTransaction[];
  if (idx >= 0) {
    updated = existing.map(t => (t.id === tx.id ? tx : t));
  } else {
    updated = [tx, ...existing];
  }
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(PAYMENT_EVENT));
};

export const updateTransactionStatus = (id: string, status: PaymentTransaction['status']) => {
  const existing = listTransactions();
  const updated = existing.map(t => (t.id === id ? { ...t, status } : t));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(PAYMENT_EVENT));
};

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${randomDigits}`;
};

export const generateProviderRef = (method: string): string => {
  const prefix = method.toUpperCase().slice(0, 4);
  const timePart = Date.now().toString().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TXN_${prefix}_${timePart}${rand}`;
};
