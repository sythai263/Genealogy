/**
 * @project AncestorTree
 * @file src/messages/en/fund.ts
 * @description Education fund
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Fund = {
  title: 'Education fund',
  subtitle: 'Transparent ledger and scholarships for descendants',
  empty: 'No transactions yet',
  balance: 'Fund balance',
  transactions: 'Transactions',
  scholarships: 'Scholarships / Awards',
  addTransaction: 'Add transaction',
  addScholarship: 'Add nomination',
  income: 'Income',
  expense: 'Expense',
  exportCsv: 'Export CSV',
  exporting: 'Exporting...',
  printReport: 'Print report',
  exportError: 'Failed to export report',
  anonymous: 'Anonymous',
  unknown: 'Unknown',
  tabs: {
    scholarships: 'Scholarships & Awards',
    donations: 'Donations',
    history: 'History',
  },
  stats: {
    balance: 'Balance',
    income: 'Total income',
    expense: 'Total expense',
    scholarshipCount: 'Scholarships',
  },
  scholarshipsSection: {
    title: 'Scholarships ({count})',
    empty: 'No scholarships yet',
    itemLabel: 'scholarships',
  },
  rewardsSection: {
    title: 'Awards ({count})',
    empty: 'No awards yet',
    itemLabel: 'awards',
  },
  donationsSection: {
    title: 'Donations ({count})',
    empty: 'No donations yet',
    itemLabel: 'donations',
  },
  historySection: {
    title: 'Transaction history ({count})',
    empty: 'No transactions yet',
    itemLabel: 'transactions',
  },
  scholarshipStatuses: {
    pending: 'Pending',
    approved: 'Approved',
    paid: 'Paid',
  },
  scholarshipTypes: {
    hoc_bong: 'Scholarship',
    khen_thuong: 'Award',
  },
  form: {
    amount: 'Amount',
    amountRequired: 'Amount (VND) *',
    type: 'Type',
    category: 'Category',
    description: 'Description',
    note: 'Note',
    date: 'Date',
    person: 'Person',
    status: 'Status',
    year: 'Academic year',
    donor: 'Donor',
    gradeLevel: 'Grade / Level',
    school: 'School',
    reason: 'Reason',
    categories: {
      dong_gop: 'Donation',
      hoc_bong: 'Scholarship',
      khen_thuong: 'Award',
      other: 'Other',
    },
  },
  toasts: {
    amountInvalid: 'Amount must be greater than 0',
    fieldsRequired: 'Please fill in all fields (amount > 0)',
    txSuccess: 'Transaction added',
    txError: 'Failed to add transaction',
    schSuccess: 'Nomination added',
    schError: 'Failed to add nomination',
    updateError: 'Failed to update',
    deleteSuccess: 'Deleted',
    deleteError: 'Error',
  },
  report: {
    title: 'Fund report',
    clanName: 'CHI TỘC Lê Sỹ',
    header: 'EDUCATION FUND REPORT - {clanName}',
    exportDate: 'Exported: {date}',
    overview: '=== OVERVIEW ===',
    totalIncome: 'Total income: {amount}',
    totalExpense: 'Total expense: {amount}',
    balanceLine: 'Balance: {amount}',
    scholarshipsHeading: '=== SCHOLARSHIPS & AWARDS ===',
    scholarshipColumns:
      'Name,Type,Amount,Academic year,School,Grade,Status',
    transactionsHeading: '=== TRANSACTION HISTORY ===',
    transactionColumns: 'Date,Type,Person/Description,Amount,Academic year',
  },
} as const satisfies AppMessages['Fund'];
