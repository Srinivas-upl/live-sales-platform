import React, { useState, useContext, createContext, useEffect } from 'react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Rate relative to INR (base currency)
}

const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0095 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.88 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 0.016 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 0.018 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 0.084 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rate: 0.011 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencies: Currency[];
  convertPrice: (priceInINR: number) => number;
  formatPrice: (priceInINR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to INR (Indian Rupee) - no persistence
  const defaultCurrency = CURRENCIES.find(c => c.code === 'INR') || CURRENCIES[0];

  const [currency, setCurrency] = useState<Currency>(defaultCurrency);

  // No useEffect for persisting currency - always defaults to INR

  const convertPrice = (priceInINR: number): number => {
    return priceInINR * currency.rate;
  };

  const formatPrice = (priceInINR: number): string => {
    const convertedPrice = convertPrice(priceInINR);
    return `${currency.symbol}${convertedPrice.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    currencies: CURRENCIES,
    convertPrice,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
