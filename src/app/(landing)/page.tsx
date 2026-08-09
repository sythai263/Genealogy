/**
 * @project AncestorTree
 * @file src/app/(landing)/page.tsx
 * @description Public home `/` — welcome landing (logged in or not)
 * @version 3.1.0
 * @updated 2026-07-28
 */

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { CLAN_FULL_NAME, CLAN_NAME } from '@lib';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bug,
  Calendar,
  ChevronRight,
  FileDown,
  GitBranch,
  Heart,
  Landmark,
  Lightbulb,
  LogIn,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Rocket,
  Route,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `AncestorTree — ${CLAN_FULL_NAME}`,
  description: `Gia phả điện tử ${CLAN_FULL_NAME}. Cây gia phả tương tác, lịch âm dương, quản lý dòng họ.`,
  alternates: {
    canonical: 'https://ancestortree.info/',
  },
  openGraph: {
    title: `AncestorTree — ${CLAN_FULL_NAME}`,
    description: 'Gìn giữ tinh hoa — Tiếp bước cha ông',
    type: 'website',
    locale: 'vi_VN',
    url: 'https://ancestortree.info/',
    images: [
      { url: '/og-landing.png', width: 1200, height: 630, alt: CLAN_FULL_NAME },
    ],
  },
};

// -- Data --

const features = [
  {
    icon: GitBranch,
    title: 'Cây gia phả tương tác',
    desc: '10+ đời hiển thị, zoom, pan, lọc theo gốc. SVG rendering với layout engine tự phát triển.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    icon: Calendar,
    title: 'Lịch âm dương & ngày giỗ',
    desc: 'Tự động chuyển đổi âm-dương, nhắc giỗ chạp hàng năm theo lịch truyền thống.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    icon: Users,
    title: 'Quản lý chi / nhánh',
    desc: 'Phân chia chi-nhánh rõ ràng, tính đời tự động, ghi nhận quan hệ cha-mẹ-con-vợ chồng.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    icon: Award,
    title: 'Vinh danh & quỹ khuyến học',
    desc: 'Ghi nhận thành tích, quản lý quỹ khuyến học với tài khoản minh bạch.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
  },
  {
    icon: BookOpen,
    title: 'Hương ước gia tộc',
    desc: 'Lưu trữ và hiển thị hương ước, quy định dòng họ dạng bài viết có phiên bản.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
  },
  {
    icon: Utensils,
    title: 'Cầu đường — phân công lễ hội',
    desc: 'Thuật toán DFS tự động xoay vòng phân công cúng lễ công bằng giữa các gia đình.',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
  },
  {
    icon: Heart,
    title: 'Quan hệ gia đình đầy đủ',
    desc: 'Cha mẹ, anh chị em, vợ/chồng, con cái — thêm/xóa trực tiếp từ trang cá nhân.',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-950/50',
  },
  {
    icon: Shield,
    title: 'Bảo mật & phân quyền 4 cấp',
    desc: 'Row Level Security trên Supabase: admin, editor, viewer, guest — bảo vệ dữ liệu cá nhân.',
    color: 'text-slate-600 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
  },
  {
    icon: MessageSquare,
    title: 'Góc giao lưu',
    desc: 'Feed bài viết, bình luận, thả tim, upload ảnh (tối đa 5/bài), lọc theo loại, moderation.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  {
    icon: Route,
    title: 'Tìm quan hệ',
    desc: 'BFS pathfinding tìm đường quan hệ giữa 2 thành viên bất kỳ trong gia phả.',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
  },
  {
    icon: BarChart3,
    title: 'Thống kê nâng cao',
    desc: 'Dashboard biểu đồ phân bố đời, giới tính, còn sống/mất với Recharts.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
  },
  {
    icon: FileDown,
    title: 'Export & Import đa dạng',
    desc: 'GEDCOM 7.0, CSV, Markdown, PDF — xuất/nhập dữ liệu gia phả linh hoạt.',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/50',
  },
  {
    icon: Bell,
    title: 'Thông báo thời gian thực',
    desc: 'Bell icon + 6 loại thông báo tự động qua DB triggers khi có bình luận, thích bài.',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/50',
  },
  {
    icon: Landmark,
    title: 'Nhà thờ họ & Hội đồng',
    desc: 'Trang công khai giới thiệu nhà thờ (gallery, bản đồ) và ban quản trị dòng họ.',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/50',
  },
  {
    icon: UserPlus,
    title: 'Đăng ký thành viên online',
    desc: 'Con cháu sống xa ghi danh trực tuyến, admin duyệt đơn. Honeypot chống spam.',
    color: 'text-lime-600 dark:text-lime-400',
    bg: 'bg-lime-50 dark:bg-lime-950/50',
  },
  {
    icon: Search,
    title: 'Tìm kiếm thông minh & SEO',
    desc: 'Fuzzy search (Fuse.js) hỗ trợ dấu tiếng Việt. Sitemap, Open Graph cho trang public.',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/50',
  },
];

const techStack = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'Tailwind CSS 4',
  'Supabase (PostgreSQL)',
  'shadcn/ui',
];

// -- Page --

export default function WelcomePage() {
  return (
    <div className='flex flex-col'>
      {/* ───── 1. Hero ───── */}
      <section className='relative bg-linear-to-br from-emerald-800 to-emerald-950 text-white overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl' />
          <div className='absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center'>
          <Badge variant='secondary' className='mb-6 text-sm px-4 py-1'>
            Open Source &middot; MIT License &middot; v2.5.0
          </Badge>
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4'>
            {CLAN_FULL_NAME}
          </h1>
          <p className='text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto mb-10'>
            Gìn giữ tinh hoa — Tiếp bước cha ông
          </p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Button size='lg' variant='secondary' asChild>
              <a href='#quickstart'>
                <Rocket className='mr-2 h-5 w-5' />
                Bắt đầu ngay
              </a>
            </Button>
            <Button
              size='lg'
              className='bg-card/10 border border-white/30 text-white hover:bg-card/20'
              asChild>
              <a href='#contact'>
                <Mail className='mr-2 h-5 w-5' />
                Liên hệ
              </a>
            </Button>
          </div>
          <div className='mt-6'>
            <div className='flex items-center gap-3'>
              <Button
                variant='link'
                className='text-emerald-200 hover:text-white'
                asChild>
                <Link href='/login'>
                  <LogIn className='mr-2 h-4 w-4' />
                  Đăng nhập
                </Link>
              </Button>
              <span className='text-emerald-400'>|</span>
              <Button
                variant='link'
                className='text-emerald-200 hover:text-white'
                asChild>
                <Link href='/register'>Đăng ký</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───── 2. Features ───── */}
      <section className='py-20 bg-muted/50'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>
              Tính năng nổi bật
            </h2>
            <p className='text-muted-foreground max-w-xl mx-auto'>
              Giải pháp toàn diện cho quản lý gia phả — từ cây phả hệ đến lễ
              nghi truyền thống.
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map(f => (
              <Card
                key={f.title}
                className='border-0 shadow-sm hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div
                    className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <CardTitle className='text-base'>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── 3. Screenshots ───── */}
      <section className='py-20'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>
              Giao diện ứng dụng
            </h2>
            <p className='text-muted-foreground'>
              Thiết kế hiện đại, hỗ trợ tiếng Việt, tương thích di động.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[
              {
                src: '/screenshots/tree-view.png',
                alt: 'Cây gia phả tương tác',
                label: 'Cây gia phả',
              },
              {
                src: '/screenshots/people-list.png',
                alt: 'Quản lý thành viên',
                label: 'Danh sách thành viên',
              },
              {
                src: '/screenshots/admin-panel.png',
                alt: 'Trang quản trị',
                label: 'Trang quản trị',
              },
              {
                src: '/screenshots/mobile-view.png',
                alt: 'Giao diện di động',
                label: 'Di động',
              },
            ].map(img => (
              <div
                key={img.src}
                className='group relative rounded-xl overflow-hidden border bg-muted aspect-video flex items-center justify-center'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className='w-full h-full object-cover'
                  loading='lazy'
                />
                <div className='absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                <span className='absolute bottom-3 left-4 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity'>
                  {img.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── 4. Hướng dẫn sử dụng ───── */}
      <section id='guide' className='py-20 bg-muted/50'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>
              Hướng dẫn sử dụng
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Tổng quan các chức năng chính và cách sử dụng ứng dụng.
            </p>
          </div>

          {/* Navigation overview */}
          <div className='mb-14'>
            <h3 className='text-lg font-semibold text-foreground mb-4 text-center'>
              Thanh điều hướng
            </h3>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto'>
              {[
                { name: 'Trang chủ', desc: 'Tổng quan, thống kê' },
                { name: 'Cây phả hệ', desc: 'Sơ đồ cây gia phả' },
                { name: 'Thành viên', desc: 'Quản lý thành viên' },
                { name: 'Thư mục', desc: 'Danh bạ liên lạc' },
                { name: 'Sự kiện', desc: 'Ngày giỗ, lễ tết' },
                { name: 'Góc giao lưu', desc: 'Feed, bình luận, ảnh' },
                { name: 'Tìm quan hệ', desc: 'Pathfinding 2 người' },
                { name: 'Thống kê', desc: 'Biểu đồ, phân tích' },
                { name: 'Thông báo', desc: 'Cập nhật realtime' },
                { name: 'Vinh danh', desc: 'Thành tích con cháu' },
                { name: 'Quỹ khuyến học', desc: 'Thu chi, học bổng' },
                { name: 'Hương ước', desc: 'Gia huấn, quy ước' },
                { name: 'Cầu đương', desc: 'Phân công cúng lễ' },
                { name: 'Kho tài liệu', desc: 'Ảnh, PDF, video' },
                { name: 'Xuất/Nhập', desc: 'GEDCOM, CSV, PDF' },
                { name: 'Quản trị', desc: 'Cài đặt hệ thống' },
              ].map(item => (
                <div
                  key={item.name}
                  className='bg-card rounded-lg px-4 py-3 border shadow-sm'>
                  <p className='font-medium text-sm text-foreground'>
                    {item.name}
                  </p>
                  <p className='text-xs text-muted-foreground'>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key workflows */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-14'>
            {[
              {
                title: 'Thêm thành viên',
                steps: [
                  'Nhấn "Thêm thành viên" ở trang Thành viên',
                  'Điền họ tên, giới tính, đời, năm sinh',
                  'Chọn Cha/Mẹ để tự động tạo quan hệ',
                  'Nhấn Lưu — thành viên xuất hiện trên cây',
                ],
              },
              {
                title: 'Xem cây gia phả',
                steps: [
                  'Vào Cây phả hệ từ thanh điều hướng',
                  'Cuộn chuột để thu phóng, kéo để di chuyển',
                  'Click vào thành viên để xem chi tiết',
                  'Chọn "Xem cây từ đây" để lọc theo nhánh',
                ],
              },
              {
                title: 'Quản lý sự kiện & ngày giỗ',
                steps: [
                  'Ngày giỗ tự động tính từ ngày mất âm lịch',
                  'Thêm sự kiện: Giỗ, Lễ/Tết, hoặc Khác',
                  'Chọn ngày âm lịch và người liên quan',
                  'Bật "Lặp lại hàng năm" cho ngày giỗ',
                ],
              },
              {
                title: 'Sao lưu dữ liệu',
                steps: [
                  'Vào Quản trị → Sao lưu & Khôi phục',
                  'Nhấn "Xuất sao lưu" để tải file ZIP về máy',
                  'Khôi phục: tải lên chính file ZIP đã xuất',
                  'Nên sao lưu ít nhất 1 lần/tháng',
                ],
              },
            ].map(workflow => (
              <Card key={workflow.title}>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base'>{workflow.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className='space-y-2'>
                    {workflow.steps.map((step, i) => (
                      <li
                        key={i}
                        className='flex gap-3 text-sm text-muted-foreground'>
                        <span className='shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 text-xs flex items-center justify-center font-medium'>
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage tips */}
          <div className='max-w-3xl mx-auto'>
            <h3 className='text-lg font-semibold text-foreground mb-4 text-center'>
              Mẹo sử dụng
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {[
                'Bắt đầu từ thủy tổ — nhập thông tin từ đời cao nhất trở xuống',
                'Chọn Cha/Mẹ ngay khi tạo thành viên để cây tự động cập nhật',
                'Ghi ngày mất âm lịch — giúp tính ngày giỗ chính xác',
                'Sao lưu thường xuyên — dữ liệu gia phả là tài sản vô giá',
                'Dùng tìm kiếm khi gia phả lớn (>50 người) — nhanh hơn cuộn trang',
              ].map((tip, i) => (
                <div
                  key={i}
                  className='flex gap-3 bg-card rounded-lg px-4 py-3 border shadow-sm'>
                  <span className='shrink-0 text-emerald-600 dark:text-emerald-400 font-semibold text-sm'>
                    #{i + 1}
                  </span>
                  <p className='text-sm text-muted-foreground'>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── 5. Quickstart ───── */}
      <section id='quickstart' className='py-20'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>
              Bắt đầu nhanh
            </h2>
            <p className='text-muted-foreground'>
              Chạy ngay trên máy của bạn — chỉ cần Docker và 10 phút.
            </p>
          </div>

          {/* Local Dev quickstart */}
          <div className='max-w-2xl mx-auto mb-10'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg text-center'>
                  Local Development
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono text-sm leading-relaxed'>
                  <p className='text-zinc-400'>
                    # Chạy local (cần Docker + pnpm)
                  </p>
                  <p>cd frontend</p>
                  <p>
                    pnpm install &amp;&amp; pnpm local:setup &amp;&amp; pnpm dev
                  </p>
                </div>
                <div className='text-center space-y-1'>
                  <p className='text-sm text-muted-foreground'>
                    Mở{' '}
                    <span className='font-mono text-emerald-700 dark:text-emerald-400'>
                      http://localhost:4000
                    </span>{' '}
                    — Đăng nhập:{' '}
                    <span className='font-mono'>admin@giapha.local</span> /{' '}
                    <span className='font-mono'>admin123</span>
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Chi phí: $0 &middot; Thời gian: ~10 phút &middot; Đầy đủ
                    100% tính năng
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      {/* ───── 6. Câu hỏi thường gặp ───── */}
      <section className='py-20 bg-muted/50'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>
              Câu hỏi thường gặp
            </h2>
            <p className='text-muted-foreground'>
              Giải đáp các thắc mắc phổ biến.
            </p>
          </div>

          {/* FAQ items */}
          <div className='max-w-3xl mx-auto space-y-4'>
            {[
              {
                q: 'Dữ liệu có mất khi cập nhật ứng dụng không?',
                a: 'Không. Dữ liệu được lưu trên Supabase cloud, tách biệt với mã nguồn nên không bị ảnh hưởng khi cập nhật.',
              },
              {
                q: 'Làm sao để sao lưu toàn bộ dữ liệu?',
                a: 'Admin vào Quản trị → Sao lưu & Khôi phục để tải về file ZIP chứa toàn bộ dữ liệu, và khôi phục lại từ chính file đó khi cần.',
              },
              {
                q: 'Ứng dụng hỗ trợ bao nhiêu thành viên?',
                a: 'Không giới hạn cứng. Đã test tốt với 500+ thành viên, 10+ đời.',
              },
              {
                q: 'Ai có quyền chỉnh sửa dữ liệu?',
                a: 'Admin toàn quyền, Editor thêm/sửa/xóa, Viewer chỉ xem, Guest chỉ xem thông tin công khai.',
              },
            ].map(item => (
              <Card key={item.q}>
                <CardContent className='pt-6'>
                  <h4 className='font-semibold text-foreground mb-2'>
                    {item.q}
                  </h4>
                  <p className='text-sm text-muted-foreground'>{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── 7. Community ───── */}
      <section className='py-20'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>
              Cộng đồng
            </h2>
            <p className='text-muted-foreground'>
              Góp ý, báo lỗi, hoặc đề xuất tính năng mới.
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto'>
            <Card className='hover:shadow-md transition-shadow'>
              <CardContent className='pt-6 text-center space-y-3'>
                <div className='mx-auto w-10 h-10 bg-red-50 dark:bg-red-950/50 rounded-lg flex items-center justify-center'>
                  <Bug className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <h3 className='font-semibold'>Báo lỗi</h3>
                <p className='text-sm text-muted-foreground'>
                  Phát hiện lỗi? Vui lòng liên hệ ban quản trị.
                </p>
                <Button variant='outline' size='sm' asChild>
                  <a href='#contact'>
                    Liên hệ <ChevronRight className='ml-1 h-4 w-4' />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className='hover:shadow-md transition-shadow'>
              <CardContent className='pt-6 text-center space-y-3'>
                <div className='mx-auto w-10 h-10 bg-amber-50 dark:bg-amber-950/50 rounded-lg flex items-center justify-center'>
                  <Lightbulb className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                </div>
                <h3 className='font-semibold'>Đề xuất tính năng</h3>
                <p className='text-sm text-muted-foreground'>
                  Ý tưởng mới? Hãy chia sẻ với chúng tôi.
                </p>
                <Button variant='outline' size='sm' asChild>
                  <a href='#contact'>
                    Đề xuất <ChevronRight className='ml-1 h-4 w-4' />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className='hover:shadow-md transition-shadow'>
              <CardContent className='pt-6 text-center space-y-3'>
                <div className='mx-auto w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center'>
                  <MessageCircle className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                </div>
                <h3 className='font-semibold'>Thảo luận & hỗ trợ</h3>
                <p className='text-sm text-muted-foreground'>
                  Đặt câu hỏi, thảo luận với ban quản trị dòng họ.
                </p>
                <Button variant='outline' size='sm' asChild>
                  <a href='#contact'>
                    Thảo luận <ChevronRight className='ml-1 h-4 w-4' />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── 8. Liên hệ ───── */}
      <section
        id='contact'
        className='py-20 bg-emerald-50 dark:bg-emerald-950/30'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>Liên hệ</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Phần mềm được phát triển phục vụ {CLAN_FULL_NAME}. Con cháu{' '}
              {CLAN_NAME} vui lòng liên hệ để được hỗ trợ.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
            {/* Author card */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg'>Tác giả</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-base font-semibold text-foreground'>
                  Đặng Thế Tài
                </p>
                <div className='space-y-2'>
                  <a
                    href='mailto:dangtt1971@gmail.com'
                    className='flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400'>
                    <Mail className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                    dangtt1971@gmail.com
                  </a>
                  <a
                    href='tel:0939116006'
                    className='flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400'>
                    <Phone className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                    0939 116 006
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Verification guide card */}
            <Card className='border-emerald-200 dark:border-emerald-800'>
              <CardHeader className='pb-3'>
                <div className='w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-2'>
                  <UserCheck className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                </div>
                <CardTitle className='text-lg'>
                  Hướng dẫn xác nhận tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className='space-y-2'>
                  {[
                    'Đăng ký tài khoản tại trang Đăng ký',
                    'Liên hệ Admin qua email hoặc điện thoại ở trên',
                    'Cung cấp họ tên, quan hệ trong dòng họ',
                    'Admin xác nhận — bạn có thể truy cập đầy đủ',
                  ].map((step, i) => (
                    <li
                      key={i}
                      className='flex gap-3 text-sm text-muted-foreground'>
                      <span className='shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 text-xs flex items-center justify-center font-medium'>
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className='mt-4'>
                  <Button variant='outline' size='sm' asChild>
                    <Link href='/register'>
                      Đăng ký tài khoản{' '}
                      <ChevronRight className='ml-1 h-4 w-4' />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── 9. Dành cho thành viên ───── */}
      <section className='py-20 bg-muted/50'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-2xl mx-auto text-center'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>
              Tham gia {CLAN_NAME}
            </h2>
            <p className='text-muted-foreground mb-8'>
              Đăng nhập để xem đầy đủ gia phả, hoặc ghi danh nếu bạn là con cháu
              sống xa.
            </p>
            <div className='flex flex-wrap justify-center gap-2 mb-8'>
              {techStack.map(t => (
                <Badge key={t} variant='secondary' className='text-sm'>
                  {t}
                </Badge>
              ))}
            </div>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
              <Button asChild>
                <Link href='/login'>
                  <LogIn className='mr-2 h-5 w-5' />
                  Đăng nhập
                </Link>
              </Button>
              <Button variant='outline' asChild>
                <Link href='/register-member'>
                  <UserPlus className='mr-2 h-5 w-5' />
                  Ghi danh thành viên
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───── 10. Footer ───── */}
      <footer className='border-t bg-card py-10'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>🌳</span>
              <span className='font-semibold text-foreground/80'>
                {CLAN_NAME}
              </span>
            </div>
            <div className='flex items-center gap-4'>
              <Link href='/family-tree' className='hover:text-foreground/80'>
                Cây gia phả
              </Link>
              <Link href='/council' className='hover:text-foreground/80'>
                Hội đồng
              </Link>
              <a href='#contact' className='hover:text-foreground/80'>
                Liên hệ
              </a>
            </div>
          </div>
          <p className='text-center text-xs text-muted-foreground mt-6'>
            &copy; {new Date().getFullYear()} {CLAN_FULL_NAME}
          </p>
        </div>
      </footer>
    </div>
  );
}
