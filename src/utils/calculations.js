import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

// ─── Period label helpers ──────────────────────────────────────────────────────

export const PERIOD_LABELS = {
  day:        'Day',
  week:       'Week',
  biweekly:   '2 Weeks',
  triweekly:  '3 Weeks',
  month:      'Month',
};

/** Periods that allow the user to set a custom term count (> 1). */
export const VARIABLE_TERM_PERIODS = ['day', 'month'];

// ─── Date helpers ──────────────────────────────────────────────────────────────

const advanceDate = (start, step, period) => {
  switch (period) {
    case 'day':        return addDays(start, step);
    case 'week':       return addWeeks(start, step);
    case 'biweekly':   return addDays(start, step * 14);
    case 'triweekly':  return addDays(start, step * 21);
    case 'month':
    default:           return addMonths(start, step);
  }
};

// ─── FLAT RATE calculations ────────────────────────────────────────────────────

/**
 * Total interest for a flat rate loan.
 * interest = principal × (periodRate / 100) × numPeriods
 */
export const calculateFlatTotalInterest = (principal, periodRate, numPeriods) => {
  const p = parseFloat(principal) || 0;
  const r = parseFloat(periodRate) || 0;
  const n = parseFloat(numPeriods) || 0;
  return p * (r / 100) * n;
};

/**
 * Total repayment for a flat rate loan.
 */
export const calculateFlatTotalRepayment = (principal, periodRate, numPeriods) => {
  return parseFloat(principal) + calculateFlatTotalInterest(principal, periodRate, numPeriods);
};

/**
 * Installment per period = totalRepayment / numPeriods.
 */
export const calculateFlatInstallment = (principal, periodRate, numPeriods) => {
  const n = parseFloat(numPeriods) || 1;
  return calculateFlatTotalRepayment(principal, periodRate, numPeriods) / n;
};

/**
 * Generate repayment schedule for a flat rate loan.
 */
export const generateFlatSchedule = (principal, periodRate, numPeriods, period, startDate) => {
  if (!principal || !numPeriods || !startDate) return [];
  const start = new Date(startDate);
  const installment = calculateFlatInstallment(principal, periodRate, numPeriods);
  const schedule = [];
  for (let i = 1; i <= numPeriods; i++) {
    schedule.push({
      id:              `sched_${i}`,
      scheduledDate:   advanceDate(start, i, period),
      amountScheduled: installment,
      status:          'pending',
    });
  }
  return schedule;
};

// ─── SMART LOAN (Bank-style Reducing Balance / Amortization) ──────────────────

/**
 * Monthly Payment using the standard PMT formula.
 * Monthly rate = annualRate / 12 / 100
 */
export const calculateSmartLoanPMT = (principal, annualRate, months) => {
  const p = parseFloat(principal) || 0;
  const r = (parseFloat(annualRate) || 0) / 12 / 100;
  const n = parseFloat(months) || 0;
  if (p <= 0 || n <= 0) return 0;
  if (r === 0) return p / n;
  return p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

/**
 * Total interest for a Smart Loan.
 */
export const calculateSmartLoanTotalInterest = (principal, annualRate, months) => {
  const pmt = calculateSmartLoanPMT(principal, annualRate, months);
  return Math.max(0, pmt * months - parseFloat(principal));
};

/**
 * Total repayment for a Smart Loan.
 */
export const calculateSmartLoanTotalRepayment = (principal, annualRate, months) => {
  const pmt = calculateSmartLoanPMT(principal, annualRate, months);
  return pmt * months;
};

/**
 * Full amortization schedule for a Smart Loan.
 */
export const generateSmartLoanSchedule = (principal, annualRate, months, startDate) => {
  if (!principal || !months || !startDate) return [];
  const p   = parseFloat(principal);
  const r   = (parseFloat(annualRate) || 0) / 12 / 100;
  const pmt = calculateSmartLoanPMT(principal, annualRate, months);
  const start   = new Date(startDate);
  let balance   = p;
  const schedule = [];

  for (let i = 1; i <= months; i++) {
    const interestForPeriod  = balance * r;
    let principalForPeriod   = pmt - interestForPeriod;
    if (i === months) principalForPeriod = balance; // absorb rounding

    balance -= principalForPeriod;

    schedule.push({
      id:               `sched_${i}`,
      scheduledDate:    addMonths(start, i),
      amountScheduled:  pmt,
      principalPortion: principalForPeriod,
      interestPortion:  interestForPeriod,
      balance:          Math.max(0, balance),
      status:           'pending',
    });
  }

  return schedule;
};

// ─── Legacy / generic helpers (kept for backwards compat) ─────────────────────

export const calculatePeriodicPayment = (principal, interestRate, term, interestType = 'FLAT', strategy = 'INSTALLMENTS') => {
  if (!principal || !term) return 0;
  const p = parseFloat(principal);
  const n = parseFloat(term);

  if (strategy === 'BULLET') return calculateTotalRepayment(principal, interestRate, term, interestType);

  if (interestType === 'REDUCING') {
    return calculateSmartLoanPMT(principal, interestRate, term);
  }
  // FLAT legacy
  const totalInterest = p * ((parseFloat(interestRate) || 0) / 100);
  return (p + totalInterest) / n;
};

export const calculateMonthlyPayment = calculatePeriodicPayment;

export const calculateLoanTotalInterest = (loan) => {
  if (!loan) return 0;
  const p = parseFloat(loan.principal_amount) || 0;
  const r = parseFloat(loan.interest_rate) || 0;
  const n = parseFloat(loan.loan_term_months) || 0;
  const type = (loan.interest_type || 'FLAT').toUpperCase();
  const templateType = loan.loanTemplate?.template_type;

  if (templateType === 'smart_loan' || type === 'REDUCING') {
    return calculateSmartLoanTotalInterest(p, r, n);
  }

  if (templateType === 'flat_rate') {
    return calculateFlatTotalInterest(p, r, n);
  }

  // Legacy fallback
  return p * (r / 100);
};

export const calculateLoanTotalRepayment = (loan) => {
  if (!loan) return 0;
  return (parseFloat(loan.principal_amount) || 0) + calculateLoanTotalInterest(loan);
};

export const calculateTotalInterest = (principal, interestRate, term, interestType = 'FLAT') => {
  if (interestType === 'REDUCING') return calculateSmartLoanTotalInterest(principal, interestRate, term);
  return parseFloat(principal) * ((parseFloat(interestRate) || 0) / 100);
};

export const calculateTotalRepayment = (principal, interestRate, term, interestType = 'FLAT') => {
  return parseFloat(principal) + calculateTotalInterest(principal, interestRate, term, interestType);
};

export const calculateRemainingBalance = (principal, interestRate, term, interestType, totalPaid) => {
  return Math.max(0, calculateTotalRepayment(principal, interestRate, term, interestType) - parseFloat(totalPaid || 0));
};

export const calculatePaymentProgress = (principal, interestRate, term, interestType, totalPaid) => {
  const total = calculateTotalRepayment(principal, interestRate, term, interestType);
  if (total === 0) return 0;
  return (parseFloat(totalPaid || 0) / total) * 100;
};

export const generateRepaymentSchedule = (principal, interestRate, term, termUnit, startDate, interestType = 'FLAT', strategy = 'INSTALLMENTS') => {
  if (!principal || !term || !startDate) return [];
  const start = new Date(startDate);
  const n     = parseFloat(term);
  const unit  = (termUnit || 'months').toLowerCase();

  const getDueDate = (s, step) => {
    switch (unit) {
      case 'days':   return addDays(s, step);
      case 'weeks':  return addWeeks(s, step);
      case 'years':  return addYears(s, step);
      case 'months':
      default:       return addMonths(s, step);
    }
  };

  if (strategy === 'BULLET') {
    return [{
      id: 'sched_1',
      scheduledDate:   getDueDate(start, n),
      amountScheduled: calculateTotalRepayment(principal, interestRate, term, interestType),
      status: 'pending',
    }];
  }

  if (interestType === 'REDUCING') {
    return generateSmartLoanSchedule(principal, interestRate, n, startDate);
  }

  // FLAT legacy
  const installment = calculatePeriodicPayment(principal, interestRate, term, 'FLAT', 'INSTALLMENTS');
  return Array.from({ length: n }, (_, i) => ({
    id:              `sched_${i + 1}`,
    scheduledDate:   getDueDate(start, i + 1),
    amountScheduled: installment,
    status:          'pending',
  }));
};
