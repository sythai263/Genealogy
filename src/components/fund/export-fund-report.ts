/**
 * @project AncestorTree
 * @file src/components/fund/export-fund-report.ts
 * @description CSV export helper for education fund report
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type {
  FundBalance,
  FundTransaction,
  Person,
  Scholarship,
  ScholarshipStatus,
  ScholarshipType,
} from '@types';

export interface ExportFundReportLabels {
  header: string;
  exportDate: string;
  overview: string;
  totalIncome: string;
  totalExpense: string;
  balanceLine: string;
  scholarshipsHeading: string;
  scholarshipColumns: string;
  transactionsHeading: string;
  transactionColumns: string;
  income: string;
  expense: string;
  unknown: string;
  typeLabels: Record<ScholarshipType, string>;
  statusLabels: Record<ScholarshipStatus, string>;
  dateLocale: string;
}

export function exportFundReport(
  _balance: FundBalance | undefined,
  transactions: FundTransaction[],
  scholarships: Scholarship[],
  peopleMap: Map<string, Person>,
  labels: ExportFundReportLabels
): void {
  const lines: string[] = [];
  lines.push(labels.header);
  lines.push(labels.exportDate);
  lines.push('');
  lines.push(labels.overview);
  lines.push(labels.totalIncome);
  lines.push(labels.totalExpense);
  lines.push(labels.balanceLine);
  lines.push('');
  lines.push(labels.scholarshipsHeading);
  lines.push(labels.scholarshipColumns);
  for (const scholarship of scholarships) {
    const name =
      peopleMap.get(scholarship.person_id)?.display_name || labels.unknown;
    const type = labels.typeLabels[scholarship.type];
    const status = labels.statusLabels[scholarship.status];
    lines.push(
      `"${name}","${type}",${scholarship.amount},"${scholarship.academic_year}","${scholarship.school || ''}","${scholarship.grade_level || ''}","${status}"`
    );
  }
  lines.push('');
  lines.push(labels.transactionsHeading);
  lines.push(labels.transactionColumns);
  for (const transaction of transactions) {
    const date = new Date(transaction.transaction_date).toLocaleDateString(
      labels.dateLocale
    );
    const type =
      transaction.type === 'income' ? labels.income : labels.expense;
    const description =
      transaction.donor_name || transaction.description || '';
    lines.push(
      `"${date}","${type}","${description}",${transaction.amount},"${transaction.academic_year || ''}"`
    );
  }

  const blob = new Blob(['\uFEFF' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `bao-cao-quy-khuyen-hoc-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
