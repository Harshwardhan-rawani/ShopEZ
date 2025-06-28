/**
 * Currency utility functions
 */

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatCurrencyWithoutSymbol = (amount: number): string => {
  return `${amount.toFixed(2)}`;
};

export const convertDollarToRupee = (dollarAmount: number): number => {
  // Using approximate conversion rate (you can update this or fetch from API)
  const conversionRate = 83.5; // 1 USD = 83.5 INR (approximate)
  return dollarAmount * conversionRate;
}; 