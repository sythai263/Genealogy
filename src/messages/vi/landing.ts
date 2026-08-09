/**
 * @project AncestorTree
 * @file src/messages/vi/landing.ts
 * @description Public landing / welcome page copy
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Landing = {
  nav: {
    tree: 'Cây gia phả',
    council: 'Hội đồng',
    ancestralHall: 'Nhà thờ',
    registerMember: 'Ghi danh',
  },
  hero: {
    badge: 'Open Source · MIT License · v2.5.0',
    tagline: 'Gìn giữ tinh hoa — Tiếp bước cha ông',
    ctaStart: 'Bắt đầu ngay',
    ctaContact: 'Liên hệ',
    login: 'Đăng nhập',
    register: 'Đăng ký',
  },
  features: {
    title: 'Tính năng nổi bật',
    subtitle:
      'Giải pháp toàn diện cho quản lý gia phả — từ cây phả hệ đến lễ nghi truyền thống.',
    items: {
      tree: {
        title: 'Cây gia phả tương tác',
        desc: '10+ đời hiển thị, zoom, pan, lọc theo gốc. SVG rendering với layout engine tự phát triển.',
      },
      calendar: {
        title: 'Lịch âm dương & ngày giỗ',
        desc: 'Tự động chuyển đổi âm-dương, nhắc giỗ chạp hàng năm theo lịch truyền thống.',
      },
      branches: {
        title: 'Quản lý chi / nhánh',
        desc: 'Phân chia chi-nhánh rõ ràng, tính đời tự động, ghi nhận quan hệ cha-mẹ-con-vợ chồng.',
      },
      achievements: {
        title: 'Vinh danh & quỹ khuyến học',
        desc: 'Ghi nhận thành tích, quản lý quỹ khuyến học với tài khoản minh bạch.',
      },
      charter: {
        title: 'Hương ước gia tộc',
        desc: 'Lưu trữ và hiển thị hương ước, quy định dòng họ dạng bài viết có phiên bản.',
      },
      cauDuong: {
        title: 'Cầu đường — phân công lễ hội',
        desc: 'Thuật toán DFS tự động xoay vòng phân công cúng lễ công bằng giữa các gia đình.',
      },
      relations: {
        title: 'Quan hệ gia đình đầy đủ',
        desc: 'Cha mẹ, anh chị em, vợ/chồng, con cái — thêm/xóa trực tiếp từ trang cá nhân.',
      },
      security: {
        title: 'Bảo mật & phân quyền 4 cấp',
        desc: 'Row Level Security trên Supabase: admin, editor, viewer, guest — bảo vệ dữ liệu cá nhân.',
      },
      feed: {
        title: 'Góc giao lưu',
        desc: 'Feed bài viết, bình luận, thả tim, upload ảnh (tối đa 5/bài), lọc theo loại, moderation.',
      },
      relationship: {
        title: 'Tìm quan hệ',
        desc: 'BFS pathfinding tìm đường quan hệ giữa 2 thành viên bất kỳ trong gia phả.',
      },
      stats: {
        title: 'Thống kê nâng cao',
        desc: 'Dashboard biểu đồ phân bố đời, giới tính, còn sống/mất với Recharts.',
      },
      exportImport: {
        title: 'Export & Import đa dạng',
        desc: 'GEDCOM 7.0, CSV, Markdown, PDF — xuất/nhập dữ liệu gia phả linh hoạt.',
      },
      notifications: {
        title: 'Thông báo thời gian thực',
        desc: 'Bell icon + 6 loại thông báo tự động qua DB triggers khi có bình luận, thích bài.',
      },
      hall: {
        title: 'Nhà thờ họ & Hội đồng',
        desc: 'Trang công khai giới thiệu nhà thờ (gallery, bản đồ) và ban quản trị dòng họ.',
      },
      register: {
        title: 'Đăng ký thành viên online',
        desc: 'Con cháu sống xa ghi danh trực tuyến, admin duyệt đơn. Honeypot chống spam.',
      },
      search: {
        title: 'Tìm kiếm thông minh & SEO',
        desc: 'Fuzzy search (Fuse.js) hỗ trợ dấu tiếng Việt. Sitemap, Open Graph cho trang public.',
      },
    },
  },
  screenshots: {
    title: 'Giao diện ứng dụng',
    subtitle: 'Thiết kế hiện đại, hỗ trợ tiếng Việt, tương thích di động.',
    tree: { alt: 'Cây gia phả tương tác', label: 'Cây gia phả' },
    people: { alt: 'Quản lý thành viên', label: 'Danh sách thành viên' },
    admin: { alt: 'Trang quản trị', label: 'Trang quản trị' },
    mobile: { alt: 'Giao diện di động', label: 'Di động' },
  },
  guide: {
    title: 'Hướng dẫn sử dụng',
    subtitle: 'Tổng quan các chức năng chính và cách sử dụng ứng dụng.',
    navTitle: 'Thanh điều hướng',
    navItems: {
      home: { name: 'Trang chủ', desc: 'Tổng quan, thống kê' },
      tree: { name: 'Cây phả hệ', desc: 'Sơ đồ cây gia phả' },
      people: { name: 'Thành viên', desc: 'Quản lý thành viên' },
      directory: { name: 'Thư mục', desc: 'Danh bạ liên lạc' },
      events: { name: 'Sự kiện', desc: 'Ngày giỗ, lễ tết' },
      feed: { name: 'Góc giao lưu', desc: 'Feed, bình luận, ảnh' },
      relationship: { name: 'Tìm quan hệ', desc: 'Pathfinding 2 người' },
      stats: { name: 'Thống kê', desc: 'Biểu đồ, phân tích' },
      notifications: { name: 'Thông báo', desc: 'Cập nhật realtime' },
      achievements: { name: 'Vinh danh', desc: 'Thành tích con cháu' },
      fund: { name: 'Quỹ khuyến học', desc: 'Thu chi, học bổng' },
      charter: { name: 'Hương ước', desc: 'Gia huấn, quy ước' },
      cauDuong: { name: 'Cầu đương', desc: 'Phân công cúng lễ' },
      documents: { name: 'Kho tài liệu', desc: 'Ảnh, PDF, video' },
      exportImport: { name: 'Xuất/Nhập', desc: 'GEDCOM, CSV, PDF' },
      admin: { name: 'Quản trị', desc: 'Cài đặt hệ thống' },
    },
    workflows: {
      addPerson: {
        title: 'Thêm thành viên',
        steps: [
          'Nhấn "Thêm thành viên" ở trang Thành viên',
          'Điền họ tên, giới tính, đời, năm sinh',
          'Chọn Cha/Mẹ để tự động tạo quan hệ',
          'Nhấn Lưu — thành viên xuất hiện trên cây',
        ],
      },
      viewTree: {
        title: 'Xem cây gia phả',
        steps: [
          'Vào Cây phả hệ từ thanh điều hướng',
          'Cuộn chuột để thu phóng, kéo để di chuyển',
          'Click vào thành viên để xem chi tiết',
          'Chọn "Xem cây từ đây" để lọc theo nhánh',
        ],
      },
      events: {
        title: 'Quản lý sự kiện & ngày giỗ',
        steps: [
          'Ngày giỗ tự động tính từ ngày mất âm lịch',
          'Thêm sự kiện: Giỗ, Lễ/Tết, hoặc Khác',
          'Chọn ngày âm lịch và người liên quan',
          'Bật "Lặp lại hàng năm" cho ngày giỗ',
        ],
      },
      backup: {
        title: 'Sao lưu dữ liệu',
        steps: [
          'Vào Quản trị → Sao lưu & Khôi phục',
          'Nhấn "Xuất sao lưu" để tải file ZIP về máy',
          'Khôi phục: tải lên chính file ZIP đã xuất',
          'Nên sao lưu ít nhất 1 lần/tháng',
        ],
      },
    },
    tipsTitle: 'Mẹo sử dụng',
    tips: [
      'Bắt đầu từ thủy tổ — nhập thông tin từ đời cao nhất trở xuống',
      'Chọn Cha/Mẹ ngay khi tạo thành viên để cây tự động cập nhật',
      'Ghi ngày mất âm lịch — giúp tính ngày giỗ chính xác',
      'Sao lưu thường xuyên — dữ liệu gia phả là tài sản vô giá',
      'Dùng tìm kiếm khi gia phả lớn (>50 người) — nhanh hơn cuộn trang',
    ],
  },
  quickstart: {
    title: 'Bắt đầu nhanh',
    subtitle: 'Chạy ngay trên máy của bạn — chỉ cần Docker và 10 phút.',
    localTitle: 'Local Development',
    comment: '# Chạy local (cần Docker + pnpm)',
    openAt: 'Mở',
    loginHint: '— Đăng nhập:',
    meta: 'Chi phí: $0 · Thời gian: ~10 phút · Đầy đủ 100% tính năng',
  },
  faq: {
    title: 'Câu hỏi thường gặp',
    subtitle: 'Giải đáp các thắc mắc phổ biến.',
    items: {
      dataLoss: {
        q: 'Dữ liệu có mất khi cập nhật ứng dụng không?',
        a: 'Không. Dữ liệu được lưu trên Supabase cloud, tách biệt với mã nguồn nên không bị ảnh hưởng khi cập nhật.',
      },
      backup: {
        q: 'Làm sao để sao lưu toàn bộ dữ liệu?',
        a: 'Admin vào Quản trị → Sao lưu & Khôi phục để tải về file ZIP chứa toàn bộ dữ liệu, và khôi phục lại từ chính file đó khi cần.',
      },
      capacity: {
        q: 'Ứng dụng hỗ trợ bao nhiêu thành viên?',
        a: 'Không giới hạn cứng. Đã test tốt với 500+ thành viên, 10+ đời.',
      },
      permissions: {
        q: 'Ai có quyền chỉnh sửa dữ liệu?',
        a: 'Admin toàn quyền, Editor thêm/sửa/xóa, Viewer chỉ xem, Guest chỉ xem thông tin công khai.',
      },
    },
  },
  community: {
    title: 'Cộng đồng',
    subtitle: 'Góp ý, báo lỗi, hoặc đề xuất tính năng mới.',
    bug: {
      title: 'Báo lỗi',
      desc: 'Phát hiện lỗi? Vui lòng liên hệ ban quản trị.',
      action: 'Liên hệ',
    },
    feature: {
      title: 'Đề xuất tính năng',
      desc: 'Ý tưởng mới? Hãy chia sẻ với chúng tôi.',
      action: 'Đề xuất',
    },
    discuss: {
      title: 'Thảo luận & hỗ trợ',
      desc: 'Đặt câu hỏi, thảo luận với ban quản trị dòng họ.',
      action: 'Thảo luận',
    },
  },
  contact: {
    title: 'Liên hệ',
    subtitle:
      'Phần mềm được phát triển phục vụ {clanFullName}. Con cháu {clanName} vui lòng liên hệ để được hỗ trợ.',
    author: 'Tác giả',
    verifyTitle: 'Hướng dẫn xác nhận tài khoản',
    verifySteps: [
      'Đăng ký tài khoản tại trang Đăng ký',
      'Liên hệ Admin qua email hoặc điện thoại ở trên',
      'Cung cấp họ tên, quan hệ trong dòng họ',
      'Admin xác nhận — bạn có thể truy cập đầy đủ',
    ],
    registerCta: 'Đăng ký tài khoản',
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
    contact: 'Liên hệ',
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
