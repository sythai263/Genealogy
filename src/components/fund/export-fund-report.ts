/**
 * @project AncestorTree
 * @file src/components/fund/export-fund-report.ts
 * @description CSV export helper for education fund report
 * @version 1.0.0
 * @updated 2026-07-18
 */

import {
  FUND_REPORT_CLAN_NAME,
  FUND_SCHOLARSHIP_STATUS_LABELS,
  FUND_SCHOLARSHIP_TYPE_LABELS,
} from '@constants';
import { formatVND } from '@lib';
import type {
  FundBalance,
  FundTransaction,
  Person,
  Scholarship,
} from '@types';

export function exportFundReport(
  balance: FundBalance | undefined,
  transactions: FundTransaction[],
  scholarships: Scholarship[],
  peopleMap: Map<string, Person>
): void {
  const lines: string[] = [];
  lines.push(`BÁO CÁO QUỸ KHUYẾN HỌC - ${FUND_REPORT_CLAN_NAME}`);
  lines.push(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`);
  lines.push('');
  lines.push('=== TỔNG QUAN ===');
  lines.push(`Tổng thu: ${formatVND(balance?.income || 0)}`);
  lines.push(`Tổng chi: ${formatVND(balance?.expense || 0)}`);
  lines.push(`Số dư: ${formatVND(balance?.balance || 0)}`);
  lines.push('');
  lines.push('=== HỌC BỔNG & KHEN THƯỞNG ===');
  lines.push('Họ tên,Loại,Số tiền,Năm học,Trường,Khối/Lớp,Trạng thái');
  for (const scholarship of scholarships) {
    const name =
      peopleMap.get(scholarship.person_id)?.display_name || 'Không rõ';
    const type = FUND_SCHOLARSHIP_TYPE_LABELS[scholarship.type];
    const status = FUND_SCHOLARSHIP_STATUS_LABELS[scholarship.status];
    lines.push(
      `"${name}","${type}",${scholarship.amount},"${scholarship.academic_year}","${scholarship.school || ''}","${scholarship.grade_level || ''}","${status}"`
    );
  }
  lines.push('');
  lines.push('=== LỊCH SỬ GIAO DỊCH ===');
  lines.push('Ngày,Loại,Người/Mô tả,Số tiền,Năm học');
  for (const transaction of transactions) {
    const date = new Date(transaction.transaction_date).toLocaleDateString(
      'vi-VN'
    );
    const type = transaction.type === 'income' ? 'Thu' : 'Chi';
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
