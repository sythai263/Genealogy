/**
 * @project AncestorTree
 * @file src/messages/vi/relationship.ts
 * @description Find relationship / tìm quan hệ
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Relationship = {
  title: 'Tìm quan hệ giữa 2 thành viên',
  subtitle:
    'Chọn 2 thành viên để tìm quan hệ theo tổ tông 18 đời — danh xưng Hán-Việt kèm diễn giải (ví dụ: Tằng Tổ (ông cố), Huyền Tôn (chút trai))',
  personA: 'Người 1',
  personB: 'Người 2',
  find: 'Tìm quan hệ',
  finding: 'Đang tìm...',
  empty: 'Chọn hai thành viên để tìm quan hệ',
  noPath: 'Không tìm thấy quan hệ giữa hai thành viên này',
  pathFound: 'Đường đi ({steps} bậc):',
  samePerson: 'Vui lòng chọn hai thành viên khác nhau',
  selectTitle: 'Chọn thành viên',
  selectHint: 'Nhập tên để tìm kiếm (tối thiểu 2 ký tự)',
  result: 'Kết quả',
  commonAncestor: 'Tổ tiên chung',
  viewOnTree: 'Xem trên cây gia phả',
  generationBadge: 'Đời {generation}',
  relations: {
    father: 'Cha',
    mother: 'Mẹ',
    child: 'Con',
    spouse: 'Vợ/Chồng',
    sibling: 'Anh/chị/em',
  },
} as const;
