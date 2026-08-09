/**
 * @project AncestorTree
 * @file src/messages/vi/tree.ts
 * @description Family tree view labels and actions
 * @version 1.1.0
 * @updated 2026-08-09
 */

export const Tree = {
  title: 'Cây gia phả',
  subtitle: 'Sơ đồ phả hệ tương tác',
  interactiveSubtitle:
    'Sơ đồ phả hệ trực quan - Click vào từng thành viên để xem chi tiết',
  listTitle: 'Danh sách thành viên theo đời',
  listSubtitle:
    'Xem danh sách thành viên phân theo từng đời — nhấn vào tên để xem chi tiết',
  searchPlaceholder: 'Tìm theo tên...',
  empty: 'Chưa có dữ liệu gia phả',
  loading: 'Đang tải cây gia phả...',
  actions: {
    zoomIn: 'Phóng to',
    zoomOut: 'Thu nhỏ',
    resetView: 'Đặt lại khung nhìn',
    resetZoom: 'Đặt lại zoom',
    expandAll: 'Mở rộng tất cả',
    expandShort: 'Mở rộng',
    collapseAll: 'Thu gọn tất cả',
    viewFromHere: 'Xem cây từ đây',
    viewFull: 'Xem toàn bộ cây',
    exportGedcom: 'Xuất GEDCOM',
    focusPerson: 'Tập trung vào thành viên',
    backToRoot: 'Về gốc',
  },
  guide: {
    title: 'Hướng dẫn',
    maleBorder: 'Viền xanh',
    femaleBorder: 'Viền hồng',
    spouseLine: 'Đường hồng',
    mobileHint: 'Trên mobile: kéo để di chuyển, dùng nút +/- để zoom',
  },
  canvas: {
    hintCompact: 'Kéo để di chuyển · Dùng nút +/- để zoom',
    hintFull:
      'Kéo để di chuyển · Cuộn để zoom · Click nút ± để thu/mở nhánh',
  },
  toolbar: {
    searching: 'Đang tìm kiếm...',
    noResults: 'Không tìm thấy kết quả',
    selectChi: 'Chọn chi',
    allChi: 'Tất cả chi',
    chiN: 'Chi {n}',
    chiGeneration: 'Chi {chi} - Đời {generation}',
    orientation: 'Hướng cây',
    horizontal: 'Hiển thị ngang',
    horizontalTitle: 'Ngang (trái → phải)',
    vertical: 'Hiển thị dọc',
    verticalTitle: 'Dọc (trên → dưới)',
    viewing: 'Đang xem: {name}',
  },
  selected: {
    chi: 'Chi: {chi}',
    generation: 'Đời: {n}',
  },
  node: {
    living: 'Còn sống',
    deceased: 'Đã mất',
    generation: 'Đời {n}',
    spouse: 'Vợ/Chồng',
  },
  toasts: {
    exportEmpty: 'Chưa có dữ liệu để xuất',
    exportSuccess: 'Xuất file GEDCOM thành công',
    exportError: 'Lỗi khi xuất file',
  },
  elderly: {
    title: 'Cây gia phả (chế độ đơn giản)',
    hint: 'Chạm vào tên để xem chi tiết',
    memberCount: '{count} người',
    childOf: 'con {name}',
  },
} as const;
