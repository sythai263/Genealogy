/**
 * @project AncestorTree
 * @file src/messages/vi/landing.ts
 * @description Public landing / welcome page copy
 * @version 2.0.0
 * @updated 2026-10-09
 */

export const Landing = {
  nav: {
    tree: 'Cây gia phả',
    council: 'Hội đồng',
    ancestralHall: 'Nhà thờ',
    registerMember: 'Ghi danh',
  },
  hero: {
    tagline: 'Gìn giữ tinh hoa — Tiếp bước cha ông',
    ctaTree: 'Xem cây gia phả',
    ctaAbout: 'Về dòng họ',
    login: 'Đăng nhập',
    register: 'Đăng ký',
  },
  about: {
    title: 'Giới thiệu dòng họ',
    historyTitle: 'Lịch sử dòng họ',
    missionTitle: 'Sứ mệnh & Tầm nhìn',
    generalInfo: 'Thông tin chung',
    patriarch: 'Thủy tổ',
    foundingYear: 'Năm thành lập',
    origin: 'Quê gốc',
    contactTitle: 'Liên hệ ban quản trị',
    empty: 'Thông tin dòng họ chưa được cập nhật.',
    emptyHint: 'Ban quản trị có thể cập nhật trong mục Quản trị → Cài đặt dòng họ.',
  },
  explore: {
    title: 'Khám phá',
    subtitle: 'Tìm hiểu về cội nguồn và kết nối với con cháu trong dòng họ.',
    tree: { title: 'Cây gia phả', desc: 'Xem sơ đồ phả hệ các đời trong dòng họ.' },
    council: { title: 'Hội đồng gia tộc', desc: 'Ban quản trị và lịch sử dòng họ.' },
    hall: { title: 'Nhà thờ họ', desc: 'Hình ảnh, vị trí và lịch tế lễ hàng năm.' },
    register: { title: 'Ghi danh thành viên', desc: 'Con cháu sống xa ghi danh vào gia phả.' },
  },
  members: {
    title: 'Tham gia {clanName}',
    subtitle:
      'Đăng nhập để xem đầy đủ gia phả, hoặc ghi danh nếu bạn là con cháu sống xa.',
    login: 'Đăng nhập',
    registerMember: 'Ghi danh thành viên',
  },
  footer: {
    tree: 'Cây gia phả',
    council: 'Hội đồng',
    hall: 'Nhà thờ họ',
    copyright: '© {year} {clanFullName}',
  },
  pageNav: {
    home: 'Trang chủ',
    tree: 'Cây gia phả',
    council: 'Hội đồng gia tộc',
    hall: 'Nhà thờ họ',
    register: 'Đăng ký thành viên',
  },
  pages: {
    familyTree: {
      title: 'Cây gia phả',
      description: 'Xem sơ đồ gia phả dòng họ (chế độ khách).',
      legendDesktop:
        '<male>Viền xanh</male> = Nam · <female>Viền hồng</female> = Nữ · Kéo để di chuyển · Nút +/- để zoom',
      legendMobile:
        'Kéo để di chuyển · Dùng nút +/- để zoom · Chạm nút ± trên nhánh để thu/mở',
    },
    council: {
      title: 'Hội đồng gia tộc',
      description: 'Ban quản trị và thành viên hội đồng.',
      membersTitle: 'Ban quản trị',
      historyTitle: 'Lịch sử dòng họ',
      missionTitle: 'Sứ mệnh & Tầm nhìn',
      generalInfo: 'Thông tin chung',
      patriarch: 'Thủy tổ',
      foundingYear: 'Năm thành lập',
      origin: 'Quê gốc',
      empty: 'Thông tin hội đồng gia tộc chưa được cập nhật.',
      emptyHint: 'Vui lòng liên hệ ban quản trị.',
    },
    ancestralHall: {
      title: 'Nhà thờ họ',
      description: 'Giới thiệu nhà thờ họ, hình ảnh và vị trí.',
      images: 'Hình ảnh',
      imageAlt: 'Nhà thờ họ {n}',
      history: 'Lịch sử nhà thờ',
      ceremonies: 'Lịch tế lễ hàng năm',
      location: 'Vị trí',
      mapTitle: 'Bản đồ nhà thờ họ',
      empty: 'Thông tin nhà thờ họ chưa được cập nhật.',
      emptyHint: 'Vui lòng liên hệ ban quản trị.',
    },
    registerMember: {
      title: 'Đăng ký thành viên',
      description: 'Con cháu sống xa gửi đơn ghi danh trực tuyến.',
      forDescendants:
        'Dành cho con cháu {clanName} sống xa muốn ghi danh vào gia phả',
      formTitle: 'Thông tin ghi danh',
      formDesc:
        'Điền thông tin bên dưới. Ban quản trị sẽ xét duyệt và liên hệ lại. Trường có dấu (*) là bắt buộc.',
      fullName: 'Họ và tên *',
      fullNamePlaceholder: 'Nguyễn Văn A',
      gender: 'Giới tính *',
      selectGender: 'Chọn giới tính',
      birthYear: 'Năm sinh',
      birthPlace: 'Nơi sinh / Quê quán',
      birthPlacePlaceholder: 'Hà Nội',
      phone: 'Điện thoại',
      email: 'Email',
      parentName: 'Tên cha/mẹ (để đối chiếu)',
      parentPlaceholder: 'Họ tên cha/mẹ để đối chiếu',
      generation: 'Đời (tự khai)',
      chi: 'Chi (tự khai)',
      relationship: 'Quan hệ',
      relationshipPlaceholder: 'Cháu ông X',
      notes: 'Ghi chú',
      notesPlaceholder: 'Thông tin bổ sung...',
      submitError: 'Lỗi khi gửi đơn. Vui lòng thử lại.',
      submitting: 'Đang gửi...',
      submit: 'Gửi đơn ghi danh',
      successTitle: 'Ghi danh thành công!',
      successBody:
        'Thông tin của bạn đã được gửi đến ban quản trị {clanName}. Sau khi được xét duyệt, bạn sẽ được thêm vào gia phả.',
      success: 'Đã gửi đơn ghi danh. Admin sẽ xem xét sớm.',
      backHome: 'Về trang chủ',
      viewCouncil: 'Xem hội đồng gia tộc',
    },
  },
} as const;
