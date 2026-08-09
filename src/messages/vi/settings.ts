/**
 * @project AncestorTree
 * @file src/messages/vi/settings.ts
 * @description Profile and security settings
 * @version 1.1.0
 * @updated 2026-08-09
 */

export const Settings = {
  profile: {
    title: 'Hồ sơ cá nhân',
    subtitle: 'Thông tin tài khoản của bạn',
    fullName: 'Tên hiển thị',
    fullNamePlaceholder: 'Nguyễn Văn A',
    nameUnset: 'Chưa cập nhật tên',
    email: 'Email',
    emailVerified: 'Email đã xác thực',
    emailReadonly: 'Email không thể thay đổi qua giao diện này.',
    role: 'Vai trò',
    roleHint: '— do quản trị viên phân quyền',
    avatar: 'Ảnh đại diện',
    save: 'Lưu thay đổi',
    toastSuccess: 'Đã lưu thông tin cá nhân',
    toastError: 'Lỗi khi lưu',
    language: 'Ngôn ngữ',
    languageDesc: 'Chọn ngôn ngữ giao diện',
    createdAt: 'Ngày tạo',
    updatedAt: 'Cập nhật lần cuối',
  },
  password: {
    title: 'Đổi mật khẩu',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu mới',
    newPasswordPlaceholder: 'Tối thiểu 8 ký tự',
    confirmPasswordPlaceholder: 'Nhập lại mật khẩu mới',
    submit: 'Đổi mật khẩu',
    submitting: 'Đang đổi...',
    toastSuccess: 'Đã đổi mật khẩu thành công',
    toastError: 'Lỗi khi đổi mật khẩu',
  },
  security: {
    title: 'Bảo mật (MFA)',
    pageTitle: 'Bảo mật tài khoản',
    subtitle: 'Xác thực hai yếu tố bằng ứng dụng Authenticator',
    pageSubtitle: 'Quản lý xác thực 2 bước (MFA)',
    totpTitle: 'Xác thực 2 bước (TOTP)',
    totpDescription:
      'Bảo vệ tài khoản bằng mã xác thực từ Google Authenticator hoặc ứng dụng tương tự.',
    mfaEnabled: 'Xác thực 2 bước đang bật',
    mfaEnabledActive: 'Xác thực 2 bước đã được bật',
    mfaDisabled: 'Xác thực 2 bước chưa bật',
    mfaDisabledHint:
      'Xác thực 2 bước chưa được bật. Bật ngay để bảo vệ tài khoản tốt hơn.',
    enable: 'Bật xác thực 2 bước',
    disable: 'Tắt xác thực 2 bước',
    disableShort: 'Tắt',
    active: 'Đang hoạt động',
    enrolling: 'Đang khởi tạo...',
    verifying: 'Đang xác nhận...',
    confirmEnable: 'Xác nhận & Bật',
    scanQr: 'Quét mã QR bằng Google Authenticator',
    step1Title: 'Bước 1: Quét mã QR',
    step1Body:
      'Mở Google Authenticator → Thêm tài khoản → Quét mã QR bên dưới.',
    step2Label: 'Bước 2: Nhập mã xác thực ({count} chữ số)',
    manualEntry: 'Không quét được mã QR? Nhập thủ công',
    qrAlt: 'QR code cho Google Authenticator',
    enterCode: 'Nhập mã 6 chữ số để xác nhận',
    verify: 'Xác nhận',
    info: 'Khi bật xác thực 2 bước, mỗi lần đăng nhập bạn sẽ cần nhập mã 6 chữ số từ ứng dụng xác thực (Google Authenticator, Authy, ...) ngoài mật khẩu.',
    unenrollTitle: 'Tắt xác thực 2 bước?',
    unenrollDescription:
      'Sau khi tắt, tài khoản chỉ được bảo vệ bằng mật khẩu. Bạn có thể bật lại bất cứ lúc nào.',
    unenrolling: 'Đang tắt...',
    toastEnableSuccess: 'Xác thực 2 bước đã được bật thành công!',
    toastEnableError: 'Lỗi khi khởi tạo xác thực',
    toastInvalidCode: 'Mã xác thực không đúng. Vui lòng thử lại.',
    toastDisableSuccess: 'Đã tắt xác thực 2 bước.',
    toastDisableError: 'Lỗi khi tắt xác thực',
  },
  roles: {
    admin: 'Quản trị viên',
    editor: 'Biên tập viên',
    viewer: 'Người xem',
  },
  version: 'Phiên bản {version}',
} as const;
