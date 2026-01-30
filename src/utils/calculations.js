import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

/**
 * Calculate periodic payment (installment) for a loan
 * Formula: (Principal + Flat Interest) / Term
 * Matches backend logic: Principal + (Principal * Rate / 100)
 */
export const calculatePeriodicPayment = (principal, interestRate, term) => {
  if (!principal || !term) return 0;

  const p = parseFloat(principal);
  const r = parseFloat(interestRate) || 0;
  const n = parseFloat(term);

  const totalInterest = p * (r / 100);
  const totalAmount = p + totalInterest;

  return totalAmount / n;
};

// Alias for backward compatibility if needed, but we should update usages
export const calculateMonthlyPayment = calculatePeriodicPayment;

/**
 * Calculate total interest for a loan
 */
export const calculateTotalInterest = (principal, interestRate) => {
  const p = parseFloat(principal);
  const r = parseFloat(interestRate) || 0;
  return p * (r / 100);
};

/**
 * Calculate total amount to be repaid
 */
export const calculateTotalRepayment = (principal, interestRate) => {
  const p = parseFloat(principal);
  const interest = calculateTotalInterest(p, interestRate);
  return p + interest;
};

/**
 * Calculate remaining balance
 */
export const calculateRemainingBalance = (principal, interestRate, term, totalPaid) => {
  const totalRepayment = calculateTotalRepayment(principal, interestRate);
  return Math.max(0, totalRepayment - parseFloat(totalPaid || 0));
};

/**
 * Calculate payment progress percentage
 */
export const calculatePaymentProgress = (principal, interestRate, term, totalPaid) => {
  const totalRepayment = calculateTotalRepayment(principal, interestRate);
  if (totalRepayment === 0) return 0;
  return (parseFloat(totalPaid || 0) / totalRepayment) * 100;
};

/**
 * Generate repayment schedule (Theoretical)
 * @returns {Array} Array of { scheduledDate, amountScheduled, status }
 */
export const generateRepaymentSchedule = (principal, interestRate, term, termUnit, startDate) => {
  if (!principal || !term || !startDate) return [];

  const installmentAmount = calculatePeriodicPayment(principal, interestRate, term);
  const start = new Date(startDate);
  const n = parseFloat(term);
  const unit = termUnit ? termUnit.toLowerCase() : 'months';

  const schedule = [];

  for (let i = 1; i <= n; i++) {
    let dueDate;

    switch (unit) {
      case 'days':
        dueDate = addDays(start, i);
        break;
      case 'weeks':
        dueDate = addWeeks(start, i);
        break;
      case 'years':
        dueDate = addYears(start, i);
        break;
      case 'months':
      default:
        dueDate = addMonths(start, i);
        break;
    }

    schedule.push({
      id: `sched_${i}`,
      scheduledDate: dueDate,
      amountScheduled: installmentAmount,
      status: 'pending' // Default status, we can't easily reconcile with actuals here without complex logic
    });
  }

  return schedule;
};
