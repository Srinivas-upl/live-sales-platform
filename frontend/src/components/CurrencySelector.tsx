import React from 'react';
import { useCurrency } from '../hooks/useCurrency';

const CurrencySelector: React.FC = () => {
  const { currency, currencies, setCurrency } = useCurrency();

  const handleCurrencyChange = (newCurrencyCode: string) => {
    const newCurrency = currencies.find(c => c.code === newCurrencyCode);
    if (newCurrency) {
      setCurrency(newCurrency);
    }
  };

  return (
    <select
      value={currency.code}
      onChange={(e) => handleCurrencyChange(e.target.value)}
      className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {currencies.map(curr => (
        <option key={curr.code} value={curr.code}>
          {curr.symbol} {curr.code}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
