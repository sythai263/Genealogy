/**
 * @project AncestorTree
 * @file src/constants/help.ts
 * @description Content constants for in-app help guide
 * @version 1.0.0
 * @updated 2026-07-18
 */

export interface HelpNavItem {
  name: string;
  desc: string;
}

export interface HelpWorkflow {
  title: string;
  steps: string[];
  tip: string;
}

export interface HelpRole {
  role: string;
  permissions: string;
}

export interface HelpFaqItem {
  q: string;
  a: string;
}

export const HELP_NAV_ITEMS: HelpNavItem[] = [
  {
    name: 'Trang chủ',
    desc: 'Tổng quan thống kê: tổng thành viên, số đời, số gia đình, sự kiện sắp tới, hương ước nổi bật.',
  },
  {
    name: 'Cây phả hệ',
    desc: 'Sơ đồ cây gia phả tương tác: zoom, kéo, lọc theo gốc. Hỗ trợ 10+ đời, SVG rendering.',
  },
  {
    name: 'Thành viên',
    desc: 'Danh sách và quản lý thành viên: thêm, sửa, xóa, tìm kiếm. Ghi đầy đủ thông tin cá nhân.',
  },
  {
    name: 'Danh bạ',
    desc: 'Thư mục liên lạc: số điện thoại, email, Zalo. Chỉ hiển thị cho thành viên đã đăng nhập.',
  },
  {
    name: 'Lịch cúng lễ',
    desc: 'Ngày giỗ, lễ tết theo lịch âm. Tự động tính từ ngày mất âm lịch, lặp lại hàng năm.',
  },
  {
    name: 'Đề xuất',
    desc: 'Gửi đề xuất chỉnh sửa thông tin: thêm/sửa thành viên, sự kiện. Admin duyệt trước khi áp dụng.',
  },
  {
    name: 'Vinh danh',
    desc: 'Bảng vinh danh thành tích: Học tập, Sự nghiệp, Cống hiến, Khác. Ghi nhận con cháu xuất sắc.',
  },
  {
    name: 'Quỹ khuyến học',
    desc: 'Thu chi quỹ khuyến học minh bạch, cấp học bổng cho con cháu ưu tú. Admin quản lý.',
  },
  {
    name: 'Hương ước',
    desc: 'Gia huấn, quy ước, lời dặn dò của dòng họ. Lưu trữ dạng bài viết có phiên bản.',
  },
  {
    name: 'Cầu đương',
    desc: 'Phân công trách nhiệm cúng lễ xoay vòng giữa các gia đình. Thuật toán DFS tự động, công bằng.',
  },
  {
    name: 'Tài liệu',
    desc: 'Xuất gia phả dạng sách truyền thống. Sắp xếp theo đời, từ thủy tổ đến con cháu.',
  },
];

export const HELP_WORKFLOWS: HelpWorkflow[] = [
  {
    title: 'Thêm thành viên',
    steps: [
      'Vào Thành viên → nhấn "Thêm thành viên" (góc trên phải)',
      'Bắt buộc: Họ và tên, Giới tính',
      'Nên điền: Đời (1 = thủy tổ), Năm sinh, Ngày mất âm lịch (để tính ngày giỗ)',
      'Chọn Cha / Mẹ từ danh sách — tự động tạo quan hệ và hiển thị trên cây',
      'Tùy chọn: Tiểu sử, Nghề nghiệp, Liên lạc (SĐT, Email, Zalo)',
    ],
    tip: 'Mẹo: Nhập từ đời cao nhất (thủy tổ) trở xuống để cây gia phả hiển thị đúng.',
  },
  {
    title: 'Xem cây gia phả',
    steps: [
      'Vào Cây phả hệ từ thanh điều hướng',
      'Thu phóng: cuộn chuột hoặc pinch trên touchpad',
      'Di chuyển: click và kéo trên vùng trống',
      'Xem chi tiết: click vào thành viên → hiện popup thông tin',
      'Lọc nhánh: click thành viên → chọn "Xem cây từ đây" → chỉ hiện nhánh đó',
    ],
    tip: 'Mẹo: Khi gia phả lớn (>50 người), dùng "Xem cây từ đây" để tập trung vào một nhánh.',
  },
  {
    title: 'Quản lý sự kiện & ngày giỗ',
    steps: [
      'Ngày giỗ tự động tính từ ngày mất âm lịch (nhập ở trang thành viên)',
      'Thêm sự kiện thủ công: nhấn "Thêm sự kiện"',
      'Loại sự kiện: Giỗ (ngày giỗ), Lễ/Tết (Tết Nguyên Đán, Rằm…), Khác (họp họ…)',
      'Nhập ngày âm lịch (ví dụ: 12/3) + chọn người liên quan',
      'Bật "Lặp lại hàng năm" cho ngày giỗ và lễ tết',
    ],
    tip: 'Lưu ý: Ngày âm lịch được tự động chuyển sang dương lịch để hiển thị sự kiện sắp tới.',
  },
];

export const HELP_ROLES: HelpRole[] = [
  {
    role: 'Admin',
    permissions:
      'Toàn quyền: CRUD tất cả dữ liệu, quản lý người dùng, phân quyền, cài đặt hệ thống',
  },
  {
    role: 'Editor',
    permissions:
      'Thêm / sửa / xóa thành viên, sự kiện, thành tích, quỹ, hương ước, cầu đương',
  },
  {
    role: 'Viewer',
    permissions:
      'Xem tất cả thông tin (bao gồm liên lạc), không chỉnh sửa được',
  },
  {
    role: 'Guest',
    permissions:
      'Xem thông tin công khai, không thấy số điện thoại/email/Zalo',
  },
];

export const HELP_TIPS: string[] = [
  'Bắt đầu từ thủy tổ — nhập thông tin từ đời cao nhất trở xuống để cây gia phả chính xác',
  'Chọn Cha/Mẹ ngay khi tạo thành viên — cây phả hệ và quan hệ gia đình tự động cập nhật',
  'Ghi ngày mất âm lịch — đây là trường quan trọng nhất để tính ngày giỗ chính xác hàng năm',
  'Sao lưu thường xuyên — dữ liệu gia phả là tài sản vô giá, sao lưu ít nhất 1 lần/tháng',
  'Dùng tìm kiếm khi gia phả lớn (>50 người) — nhanh hơn cuộn trang rất nhiều',
  'Thêm quan hệ từ trang chi tiết — mở thành viên → phần Quan hệ → Thêm con hoặc Thêm vợ/chồng',
];

export const HELP_FAQ_ITEMS: HelpFaqItem[] = [
  {
    q: 'Dữ liệu có mất khi cập nhật ứng dụng không?',
    a: 'Không. Dữ liệu được lưu trên Supabase cloud, không bị ảnh hưởng khi cập nhật ứng dụng.',
  },
  {
    q: 'Làm sao để sao lưu toàn bộ dữ liệu?',
    a: 'Admin vào Quản trị → Sao lưu & Khôi phục để tải về file ZIP chứa toàn bộ dữ liệu, và khôi phục lại khi cần.',
  },
  {
    q: 'Ứng dụng hỗ trợ bao nhiêu thành viên?',
    a: 'Không giới hạn cứng. Đã test tốt với 500+ thành viên, 10+ đời. Cây gia phả và tìm kiếm vẫn mượt.',
  },
  {
    q: 'Cách thêm quan hệ gia đình (vợ/chồng, con cái)?',
    a: 'Mở trang chi tiết thành viên → phần Quan hệ gia đình → nhấn "Thêm quan hệ" → chọn "Thêm con" hoặc "Thêm vợ/chồng". Quan hệ tự động cập nhật ở cả hai phía.',
  },
  {
    q: 'Cầu đương hoạt động như thế nào?',
    a: 'Cầu đương là phong tục phân công lo việc cúng giỗ giữa các gia đình. Ứng dụng dùng thuật toán DFS (duyệt cây theo chiều sâu) để xoay vòng tự động, đảm bảo công bằng. Admin tạo đợt mới → hệ thống phân công → có thể điều chỉnh thủ công.',
  },
];