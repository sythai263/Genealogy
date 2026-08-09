/**
 * @project AncestorTree
 * @file src/messages/vi/auth.ts
 * @description Auth pages: login, register, OTP, MFA, password reset
 * @version 1.1.0
 * @updated 2026-08-09
 */

export const Auth = {
  login: {
    title: 'Đăng nhập',
    description: 'Cổng thông tin gia phả',
    otpTitle: 'Đăng nhập bằng mã OTP',
    otpDescription: 'Không cần mật khẩu',
    totpTitle: 'Xác thực 2 bước',
    totpDescription: 'Nhập mã từ ứng dụng xác thực',
    email: 'Email',
    password: 'Mật khẩu',
    submit: 'Đăng nhập',
    submitting: 'Đang đăng nhập...',
    forgotPassword: 'Quên mật khẩu?',
    noAccount: 'Chưa có tài khoản?',
    registerLink: 'Đăng ký',
    tabPassword: 'Mật khẩu',
    tabOtp: 'Mã OTP',
    success: 'Đăng nhập thành công!',
    failed: 'Đăng nhập thất bại',
    suspended:
      'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ quản trị viên.',
    lockout: 'Sai thông tin đăng nhập nhiều lần. Thử lại sau {seconds} giây.',
    retryAfter: 'Thử lại sau {seconds}s',
  },
  otp: {
    sendCode: 'Gửi mã OTP',
    sending: 'Đang gửi...',
    sendingCode: 'Đang gửi mã...',
    codeSent: 'Mã OTP đã được gửi đến email của bạn',
    codeSentBanner:
      'Mã OTP đã gửi đến <email></email>. Kiểm tra hộp thư (kể cả spam).',
    enterCode: 'Nhập mã OTP gồm 6 chữ số',
    codeLabel: 'Mã OTP',
    codeLabelDigits: 'Mã OTP (6 chữ số)',
    validFor: 'Mã có hiệu lực trong 15 phút',
    emailHint:
      'Nhập email đã đăng ký — chúng tôi sẽ gửi mã OTP 6 chữ số để đăng nhập ngay, không cần mật khẩu.',
    changeEmail: 'Đổi email',
    passwordLogin: 'Đăng nhập bằng mật khẩu',
    resend: 'Gửi lại mã',
    noAccount: 'Email này chưa có tài khoản. Vui lòng đăng ký trước.',
    sendFailed: 'Không thể gửi mã OTP',
    invalidCode: 'Mã OTP không hợp lệ',
    expiredCode: 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.',
  },
  totp: {
    confirm: 'Xác nhận',
    confirming: 'Đang xác nhận...',
    verifying: 'Đang xác thực...',
    success: 'Xác thực 2 bước thành công!',
    invalidCode:
      'Mã không đúng hoặc đã hết hạn. Kiểm tra đồng hồ thiết bị và thử lại.',
    codeLabel: 'Mã xác thực',
    hint: 'Nhập mã 6 chữ số từ ứng dụng xác thực (Google Authenticator).',
    backToLogin: 'Quay lại đăng nhập',
  },
  register: {
    title: 'Đăng ký',
    description: 'Tạo tài khoản để truy cập gia phả',
    fullName: 'Họ và tên',
    fullNamePlaceholder: 'Nguyễn Văn A',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    submit: 'Đăng ký',
    submitting: 'Đang đăng ký...',
    failed: 'Đăng ký thất bại',
    hasAccount: 'Đã có tài khoản?',
    loginLink: 'Đăng nhập',
    checkEmailTitle: 'Kiểm tra email',
    checkEmailDescription:
      'Chúng tôi đã gửi email xác nhận. Vui lòng mở hộp thư và làm theo hướng dẫn.',
    checkEmailSentTo:
      'Chúng tôi đã gửi email xác nhận đến <email></email>',
    checkEmailAdminNote:
      'Vui lòng nhấp vào liên kết trong email để xác nhận tài khoản. Sau khi xác nhận email, quản trị viên sẽ duyệt tài khoản của bạn.',
    alreadyVerified: 'Đã xác nhận? Đăng nhập',
  },
  forgotPassword: {
    title: 'Quên mật khẩu',
    description: 'Nhập email để nhận link đặt lại mật khẩu',
    email: 'Email',
    submit: 'Gửi link đặt lại mật khẩu',
    submitting: 'Đang gửi...',
    success: 'Email đặt lại mật khẩu đã được gửi!',
    failed: 'Gửi email thất bại',
    backToLogin: 'Quay lại đăng nhập',
    sentTo:
      'Email đặt lại mật khẩu đã được gửi đến <email></email>. Vui lòng kiểm tra hộp thư (bao gồm thư rác).',
  },
  resetPassword: {
    title: 'Đặt lại mật khẩu',
    description: 'Nhập mật khẩu mới cho tài khoản của bạn',
    password: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu',
    submit: 'Đặt lại mật khẩu',
    submitting: 'Đang lưu...',
    updating: 'Đang cập nhật...',
    verifyingLink: 'Đang xác thực link đặt lại mật khẩu...',
    success: 'Đặt lại mật khẩu thành công!',
    failed: 'Đặt lại mật khẩu thất bại',
  },
  pendingVerification: {
    title: 'Chờ xác nhận tài khoản',
    description:
      'Tài khoản của bạn đã được tạo nhưng chưa được admin xác nhận. Vui lòng liên hệ ban quản trị dòng họ.',
    registeredSuccess: 'Tài khoản của bạn đã được đăng ký thành công.',
    waitMessage:
      'Vui lòng chờ quản trị viên xác nhận tài khoản để truy cập đầy đủ hệ thống gia phả. Bạn sẽ được thông báo khi tài khoản được kích hoạt.',
    contactHint: 'Cung cấp họ tên và quan hệ trong dòng họ khi liên hệ.',
    contactIfError:
      'Nếu bạn cho rằng đây là lỗi, hãy liên hệ quản trị viên dòng họ.',
    logout: 'Đăng xuất',
  },
  verificationGuard: {
    title: 'Tài khoản chưa được xác nhận',
    message: 'Bạn cần được admin xác nhận trước khi sử dụng tính năng này.',
  },
} as const;
