/**
 * @project AncestorTree
 * @file src/messages/vi/validation.ts
 * @description Zod / form validation messages (source of truth for schemas)
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Validation = {
  auth: {
    emailRequired: 'Email là bắt buộc',
    emailInvalid: 'Email không hợp lệ',
    passwordRequired: 'Mật khẩu là bắt buộc',
    passwordMin8: 'Mật khẩu phải có ít nhất 8 ký tự',
    passwordMin6: 'Mật khẩu phải có ít nhất 6 ký tự',
    confirmPasswordRequired: 'Xác nhận mật khẩu là bắt buộc',
    passwordMismatch: 'Mật khẩu không khớp',
    fullNameRequired: 'Họ và tên là bắt buộc',
    fullNameTooLong: 'Họ và tên quá dài',
    otpLength: 'Mã OTP phải có 6 chữ số',
    otpDigitsOnly: 'Mã OTP chỉ gồm chữ số',
    totpLength: 'Mã xác thực phải có 6 chữ số',
    totpDigitsOnly: 'Mã xác thực chỉ gồm chữ số',
  },
  person: {
    handleRequired: 'Handle là bắt buộc',
    handleFormat: 'Handle chỉ chứa chữ thường, số và dấu gạch ngang',
    displayNameRequired: 'Tên hiển thị là bắt buộc',
    displayNameTooLong: 'Tên quá dài',
    generationMin: 'Đời phải từ 1 trở lên',
    generationMax: 'Đời tối đa là 20',
    lunarDateInvalid: 'Ngày âm lịch không hợp lệ. VD: 15/7 (ngày/tháng)',
    yearMin: 'Năm phải từ {min} trở lên',
    yearMax: 'Năm không thể vượt quá {max}',
    emailInvalid: 'Email không hợp lệ',
    urlInvalid: 'URL không hợp lệ',
    deathYearAfterBirth: 'Năm mất phải sau năm sinh',
    deathDateAfterBirth: 'Ngày mất phải sau ngày sinh',
  },
  profile: {
    displayNameRequired: 'Tên hiển thị là bắt buộc',
    displayNameTooLong: 'Tên hiển thị quá dài',
    passwordMin8: 'Mật khẩu phải có ít nhất 8 ký tự',
    confirmPasswordRequired: 'Xác nhận mật khẩu là bắt buộc',
    passwordMismatch: 'Mật khẩu không khớp',
  },
  contribution: {
    targetPersonRequired: 'Vui lòng chọn thành viên',
    changesRequired: 'Vui lòng thêm ít nhất một thay đổi',
  },
  achievement: {
    personRequired: 'Vui lòng chọn thành viên',
    titleRequired: 'Tiêu đề là bắt buộc',
    titleTooLong: 'Tiêu đề quá dài',
    yearFormat: 'Năm phải là 4 chữ số',
  },
  cauDuong: {
    poolNameRequired: 'Vui lòng điền tên nhóm',
    ancestorRequired: 'Vui lòng chọn tổ tông',
    minGeneration: 'Đời tối thiểu phải ≥ 1',
    maxAgeMin: 'Tuổi âm tối đa phải ≥ 1',
    maxAgeMax: 'Tuổi âm tối đa phải ≤ 120',
    delegateHostRequired: 'Chọn người thực hiện thay',
    rescheduleDateRequired: 'Chọn ngày thực hiện',
    assignPersonRequired: 'Chọn người thực hiện',
  },
  common: {
    required: 'Trường này là bắt buộc',
    tooLong: 'Nội dung quá dài',
    invalid: 'Giá trị không hợp lệ',
  },
} as const;
