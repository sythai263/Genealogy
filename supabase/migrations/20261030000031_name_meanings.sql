-- ============================================================================
-- name_meanings — public baby-name dictionary with community submissions
--   · approved rows are readable by everyone (anon + authenticated)
--   · anyone may insert, always as 'pending' — admin/editor approve later
--   · name_search keeps a folded (unaccent, lowercase) copy for DB-side search
-- ============================================================================

create extension if not exists unaccent with schema extensions;

create table public.name_meanings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text not null check (gender in ('male', 'female', 'both')),
  meaning text not null,
  -- words in the given name: 1 → 3-word full name, 2 → 4-word full name
  name_word_count smallint not null check (name_word_count in (1, 2)),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  contributor_name text,
  contributor_note text,
  name_search text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index name_meanings_status_idx on public.name_meanings (status);
create index name_meanings_search_idx on public.name_meanings (name_search);

create or replace function public.name_meanings_set_search()
returns trigger
language plpgsql
as $$
begin
  new.name_search := extensions.unaccent(lower(new.name));
  new.updated_at := now();
  return new;
end;
$$;

create trigger name_meanings_search_trg
  before insert or update of name on public.name_meanings
  for each row execute function public.name_meanings_set_search();

alter table public.name_meanings enable row level security;

-- Approved rows are public.
create policy "Anyone can read approved names"
  on public.name_meanings for select
  to anon, authenticated
  using (status = 'approved');

-- Admins/editors see every row including pending submissions.
create policy "Admin can read all names"
  on public.name_meanings for select
  to authenticated
  using (public.is_admin_or_editor());

-- Community contributions — only ever pending at insert time.
create policy "Anyone can submit a name"
  on public.name_meanings for insert
  to anon, authenticated
  with check (status = 'pending');

-- Admins may insert pre-approved rows (moderated seeds/manual additions).
create policy "Admin can insert names"
  on public.name_meanings for insert
  to authenticated
  with check (public.is_admin_or_editor());

create policy "Admin can update names"
  on public.name_meanings for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

create policy "Admin can delete names"
  on public.name_meanings for delete
  to authenticated
  using (public.is_admin_or_editor());

-- ============================================================================
-- Seed — common Vietnamese given names with meanings
-- ============================================================================
insert into public.name_meanings (name, gender, meaning, name_word_count, status) values
-- male, 1 word
('An','male','Bình an, yên lành, không lo lắng',1,'approved'),
('Bảo','male','Báu vật quý giá, đứa con trân quý',1,'approved'),
('Cường','male','Mạnh mẽ, cứng cáp, ý chí vững vàng',1,'approved'),
('Đạt','male','Thành đạt, đạt được ước nguyện',1,'approved'),
('Đức','male','Đức độ, nhân đức, sống tử tế',1,'approved'),
('Dũng','male','Dũng cảm, gan dạ, mạnh mẽ',1,'approved'),
('Duy','male','Duyên dáng, duy nhất, quý trọng',1,'approved'),
('Giang','male','Con sông lớn, mạnh mẽ dồi dào',1,'approved'),
('Hải','male','Biển cả bao la, rộng lớn',1,'approved'),
('Hiếu','male','Hiếu thảo, thương yêu cha mẹ',1,'approved'),
('Hoàng','male','Vàng rực, quý phái, rạng rỡ',1,'approved'),
('Hùng','male','Hùng vĩ, hùng dũng, mạnh mẽ',1,'approved'),
('Huy','male','Huy hoàng, vinh quang',1,'approved'),
('Khang','male','An khang, khỏe mạnh bình an',1,'approved'),
('Kiên','male','Kiên cường, bền chí, nhẫn nại',1,'approved'),
('Lâm','male','Rừng xanh, sức sống mãnh liệt',1,'approved'),
('Long','male','Rồng — sức mạnh, may mắn, quý tộc',1,'approved'),
('Lộc','male','Phúc lộc, tài lộc dồi dào',1,'approved'),
('Minh','male','Sáng sủa, thông minh, sáng láng',1,'approved'),
('Nam','male','Phương nam, ấm áp, vững chãi',1,'approved'),
('Nghĩa','male','Trọng nghĩa khí, sống có tình có nghĩa',1,'approved'),
('Nguyên','male','Nguyên vẹn, khởi đầu, nguồn gốc',1,'approved'),
('Nhân','male','Nhân đức, nhân nghĩa, lương thiện',1,'approved'),
('Phát','male','Phát triển, phát đạt, thịnh vượng',1,'approved'),
('Phong','male','Phong lưu, phong cách, tài phong',1,'approved'),
('Phúc','male','Phúc khí, hạnh phúc, may mắn',1,'approved'),
('Quân','male','Người tài, quân tử, đoàn kết',1,'approved'),
('Sơn','male','Núi cao, vững chãi, bền vững',1,'approved'),
('Tài','male','Tài năng, tài trí, tài lộc',1,'approved'),
('Tâm','male','Tâm đức, tấm lòng trong sáng',1,'approved'),
('Thắng','male','Chiến thắng, thành công',1,'approved'),
('Thành','male','Thành công, thành đạt',1,'approved'),
('Thái','male','An thái, bình yên, to lớn như Thái Sơn',1,'approved'),
('Thiện','male','Thiện lương, tốt đẹp',1,'approved'),
('Thịnh','male','Thịnh vượng, hưng thịnh',1,'approved'),
('Trí','male','Trí tuệ, chí hướng, ý chí',1,'approved'),
('Trung','male','Trung thành, trung thực',1,'approved'),
('Tuấn','male','Tuấn tú, đẹp trai, tài giỏi',1,'approved'),
('Tùng','male','Cây tùng, bền bỉ quanh năm',1,'approved'),
('Việt','male','Người Việt, vượt trội',1,'approved'),
('Vinh','male','Vinh quang, vinh dự',1,'approved'),
('Vũ','male','Vũ trụ, mưa (vũ), mạnh mẽ',1,'approved'),
('Xuân','male','Mùa xuân, khởi đầu mới, tươi trẻ',1,'approved'),
-- female, 1 word
('Ánh','female','Ánh sáng, rạng rỡ, tươi sáng',1,'approved'),
('Anh','female','Anh tuệ, thông minh, hoa anh',1,'approved'),
('Bình','female','Bình yên, an bình',1,'approved'),
('Chi','female','Chi nhánh, chí hướng',1,'approved'),
('Diễm','female','Đẹp rực rỡ, kiều diễm',1,'approved'),
('Dung','female','Dung nhan, dung hòa, vẻ đẹp',1,'approved'),
('Đào','female','Hoa đào, xuân sắc, tươi đẹp',1,'approved'),
('Giang','female','Trăng giang, thanh cao dịu dàng',1,'approved'),
('Hà','female','Sông Hà, hiền hòa êm dịu',1,'approved'),
('Hạnh','female','Hạnh phúc, đức hạnh',1,'approved'),
('Hiền','female','Hiền hậu, hiền lành',1,'approved'),
('Hoa','female','Hoa đẹp, tươi sáng, ngọt ngào',1,'approved'),
('Hồng','female','Hồng hào, hoa hồng, may mắn',1,'approved'),
('Huệ','female','Hiền huệ, mùi hương thơm',1,'approved'),
('Hương','female','Hương thơm, ngát hương',1,'approved'),
('Lan','female','Hoa lan, thanh cao, dịu dàng',1,'approved'),
('Linh','female','Linh thiêng, lanh lợi, linh hoạt',1,'approved'),
('Loan','female','Loan báo tin vui, chim loan',1,'approved'),
('Mai','female','Hoa mai, mùa xuân, hy vọng',1,'approved'),
('My','female','Đẹp đẽ, mỹ miều, mỹ vị',1,'approved'),
('Nga','female','Nga du, mây trời, thanh nhã',1,'approved'),
('Ngọc','female','Ngọc quý, đá quý, quý giá',1,'approved'),
('Như','female','Như ý, như hoa, êm ái',1,'approved'),
('Nhung','female','Nhung nhúc, nhung nhớ, mềm mại',1,'approved'),
('Oanh','female','Chim oanh, khiêm nhường, dịu dàng',1,'approved'),
('Phương','female','Phương hướng, chững chạc',1,'approved'),
('Quỳnh','female','Hoa quỳnh nở đêm, quý hiếm đẹp',1,'approved'),
('Thảo','female','Thảo hiền, hiếu thảo, cỏ thơm',1,'approved'),
('Thu','female','Mùa thu, thuần khiết, mát lành',1,'approved'),
('Thúy','female','Ngọc thúy, trong vắt quý giá',1,'approved'),
('Trang','female','Trang nhã, đẹp đẽ, lịch sự',1,'approved'),
('Trinh','female','Trinh khiết, trong sạch',1,'approved'),
('Uyên','female','Chim uyên ương, uyên bác',1,'approved'),
('Vân','female','Mây trắng, thanh nhã bay bổng',1,'approved'),
('Vy','female','Duyên dáng, xinh đẹp, thanh vy',1,'approved'),
('Yến','female','Chim yến, yên lành, bình yên',1,'approved'),
-- both genders, 1 word
('An','both','Bình an, yên lành cho cả nam và nữ',1,'approved'),
('Bình','both','Bình an, hòa bình, điềm đạm',1,'approved'),
('Giang','both','Sông lớn, trăng giang — mạnh mẽ hoặc dịu dàng',1,'approved'),
('Hà','both','Sông Hà, êm dịu an lành',1,'approved'),
('Linh','both','Linh thiêng, linh hoạt, nhanh nhẹn',1,'approved'),
('Minh','both','Sáng sủa, thông minh',1,'approved'),
('Tâm','both','Tâm lành, tấm lòng đẹp đẽ',1,'approved'),
('Thiện','both','Thiện tâm, nhân từ tốt đẹp',1,'approved'),
('Trúc','both','Cây trúc, ngay thẳng bền bỉ',1,'approved'),
-- male, 2 words (4-word full name)
('Đức Anh','male','Đức độ và anh tuệ, vừa đức vừa tài',2,'approved'),
('Gia Bảo','male','Báu vật của gia đình',2,'approved'),
('Hải Đăng','male','Ngọn hải đăng, soi đường đi vững chắc',2,'approved'),
('Hoài Nam','male','Khát vọng, tài năng lớn lao',2,'approved'),
('Minh Đức','male','Sáng và đức, trí tuệ và đạo đức',2,'approved'),
('Minh Kha','male','Minh mẫn, tài trí sáng suốt',2,'approved'),
('Nhật Minh','male','Ánh sáng mặt trời, tương lai rực rỡ',2,'approved'),
('Phúc An','male','Phúc lộc và bình an đầy đủ',2,'approved'),
('Quốc Bảo','male','Bảo vật của đất nước, quý trọng',2,'approved'),
('Thanh Tùng','male','Thanh tùng cao đẹp, quân tử chính trực',2,'approved'),
('Trọng Nghĩa','male','Trọng chữ nghĩa, sống nghĩa khí',2,'approved'),
('Tuấn Kiệt','male','Tuấn kiệt, tài trí xuất chúng',2,'approved'),
('Anh Khoa','male','Anh tuệ và hiểu biết khoa học',2,'approved'),
('Hữu Phúc','male','Hữu phúc, gặp nhiều may mắn hạnh phúc',2,'approved'),
('Đức Thịnh','male','Đức độ và thịnh vượng',2,'approved'),
('Minh Quân','male','Người tài sáng suốt, quân tử',2,'approved'),
('Hồng Phúc','male','Phúc khí hồng hào, may mắn',2,'approved'),
('Thanh Bình','male','Thanh bình, yên lành trong sáng',2,'approved'),
('Tuệ Minh','male','Trí tuệ sáng suốt, minh mẫn',2,'approved'),
('Việt Anh','male','Người Việt anh tuệ, kiêu hãnh',2,'approved'),
-- female, 2 words
('An Nhiên','female','An nhiên tự tại, thanh thản',2,'approved'),
('Bảo Anh','female','Viên ngọc quý, anh tuệ sắc sảo',2,'approved'),
('Bảo Ngọc','female','Ngọc quý, con gái trân bảo',2,'approved'),
('Cát Tường','female','Cát tường như ý, may mắn lành',2,'approved'),
('Gia Hân','female','Vui vẻ hân hoan của gia đình',2,'approved'),
('Hồng Anh','female','Hồng hào và anh tuệ, rạng rỡ thông minh',2,'approved'),
('Khánh Linh','female','Khánh linh vui vẻ, điềm lành linh thiêng',2,'approved'),
('Kim Ngân','female','Ngân vang như chuông, quý phái',2,'approved'),
('Lam Ngọc','female','Ngọc lam quý hiếm, trong sáng',2,'approved'),
('Minh Anh','female','Minh anh, sáng và đẹp, thông minh',2,'approved'),
('Minh Châu','female','Ngọc châu sáng, quý giá rực rỡ',2,'approved'),
('Mỹ Duyên','female','Duyên dáng đẹp đẽ, phúc duyên',2,'approved'),
('Ngọc Anh','female','Ngọc quý và anh tuệ',2,'approved'),
('Ngọc Hân','female','Viên ngọc hân hoan, quý giá vui vẻ',2,'approved'),
('Nguyệt Ánh','female','Ánh trăng, trong sáng thuần khiết',2,'approved'),
('Phương Thảo','female','Phương thảo hiền, đức hạnh thơm',2,'approved'),
('Thanh Trúc','female','Trúc thanh nhã, ngay thẳng thanh cao',2,'approved'),
('Thiên Ân','female','Ân điển trời ban, phúc lành',2,'approved'),
('Thu Hằng','female','Thu hằng như trăng rằm, đẹp lâu bền',2,'approved'),
('Thùy Linh','female','Thùy linh trong veo, lanh lợi đẹp đẽ',2,'approved'),
('Tuệ Anh','female','Trí tuệ và anh tài, sáng suốt',2,'approved'),
('Hà My','female','Hà my dịu dàng, đẹp như sông êm',2,'approved'),
('Khánh An','female','Khánh an, vui vẻ và bình an',2,'approved'),
('Thảo Nhi','female','Thảo nhi nhỏ nhắn, hiền lành xinh xắn',2,'approved'),
('Diễm Quỳnh','female','Diễm quỳnh, đẹp như hoa quỳnh',2,'approved');
