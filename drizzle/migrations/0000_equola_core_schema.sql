create type public.app_role as enum ('student', 'educator');
create type public.org_type as enum ('school', 'university', 'ngo', 'donor_government');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type public.org_type not null,
  governorate text,
  website text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  display_name text not null,
  role public.app_role not null default 'student',
  organization_id uuid references public.organizations(id) on delete set null,
  school_id uuid references public.organizations(id) on delete set null,
  grade text,
  governorate text,
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'scholarship',
  summary text not null,
  description text,
  provider_name text not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  posted_by uuid references public.profiles(id) on delete cascade,
  link text not null,
  is_free boolean not null default true,
  location text not null default 'online',
  eligibility text,
  requirements text[] not null default '{}',
  deadline date,
  created_at timestamptz not null default now()
);

create table public.tracker_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status text not null default 'saved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, opportunity_id)
);

-- Grants (required: Data API has no default privileges on public)
GRANT SELECT ON public.organizations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.opportunities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracker_entries TO authenticated;
GRANT ALL ON public.tracker_entries TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_entries ENABLE ROW LEVEL SECURITY;

-- Helper: security definer so educator policies don't recurse on profiles RLS
create or replace function public.is_educator_of_org(_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select _org is not null and exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'educator' and organization_id = _org
  );
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

GRANT EXECUTE ON FUNCTION public.is_educator_of_org(uuid), public.current_profile_id() TO authenticated, anon;

-- Policies: organizations (public directory)
create policy "Organizations are publicly readable"
  on public.organizations for select to anon, authenticated using (true);
create policy "Educators can list their organization"
  on public.organizations for insert to authenticated
  with check (created_by is null or created_by in (select id from public.profiles where user_id = auth.uid()));
create policy "Educators can update their organization"
  on public.organizations for update to authenticated
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.organization_id = organizations.id and p.role = 'educator'));

-- Policies: profiles
create policy "Users read their own profile"
  on public.profiles for select to authenticated using (user_id = auth.uid());
create policy "Educators read linked students"
  on public.profiles for select to authenticated
  using (role = 'student' and school_id is not null and public.is_educator_of_org(school_id));
create policy "Users create their own profile"
  on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Policies: opportunities
create policy "Opportunities are publicly readable"
  on public.opportunities for select to anon, authenticated using (true);
create policy "Educators post opportunities"
  on public.opportunities for insert to authenticated
  with check (
    posted_by is not null
    and posted_by in (select id from public.profiles where user_id = auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'educator'
        and (p.id = opportunities.posted_by)
        and (opportunities.organization_id is null or p.organization_id = opportunities.organization_id)
    )
  );
create policy "Educators edit their opportunities"
  on public.opportunities for update to authenticated
  using (posted_by in (select id from public.profiles where user_id = auth.uid()))
  with check (posted_by in (select id from public.profiles where user_id = auth.uid()));
create policy "Educators delete their opportunities"
  on public.opportunities for delete to authenticated
  using (posted_by in (select id from public.profiles where user_id = auth.uid()));

-- Policies: tracker entries
create policy "Students read their own tracker"
  on public.tracker_entries for select to authenticated
  using (student_id in (select id from public.profiles where user_id = auth.uid()));
create policy "Educators read tracker of their students"
  on public.tracker_entries for select to authenticated
  using (exists (
    select 1 from public.profiles s
    where s.id = tracker_entries.student_id
      and s.school_id is not null
      and public.is_educator_of_org(s.school_id)
  ));
create policy "Students manage their own tracker"
  on public.tracker_entries for insert to authenticated
  with check (student_id in (select id from public.profiles where user_id = auth.uid()));
create policy "Students update their own tracker"
  on public.tracker_entries for update to authenticated
  using (student_id in (select id from public.profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.profiles where user_id = auth.uid()));
create policy "Students delete their own tracker"
  on public.tracker_entries for delete to authenticated
  using (student_id in (select id from public.profiles where user_id = auth.uid()));

-- Real seed data: organizations (public Egyptian institutions)
insert into public.organizations (name, type, governorate, website) values
  ('Misr El Kheir Foundation', 'ngo', 'Cairo', 'https://misrelkheir.org'),
  ('Alashanek Ya Balady Association', 'ngo', 'Cairo', 'https://ayb-sd.org'),
  ('UNICEF Egypt', 'ngo', 'Cairo', 'https://www.unicef.org/egypt'),
  ('Ministry of Education and Technical Education', 'donor_government', 'Cairo', 'https://moe.gov.eg'),
  ('The American University in Cairo', 'university', 'Cairo', 'https://www.aucegypt.edu'),
  ('The German University in Cairo', 'university', 'Cairo', 'https://www.guc.edu.eg'),
  ('The British University in Egypt', 'university', 'Cairo', 'https://www.bue.edu.eg'),
  ('Obour STEM School', 'school', 'Qalyubia', null),
  ('Aswan STEM School', 'school', 'Aswan', null);

-- Real seed data: opportunities (real programs; details should be confirmed at the provider link)
insert into public.opportunities (title, type, summary, description, provider_name, link, is_free, location, eligibility, requirements, deadline) values
  ('Rise — Global Talent Program', 'competition', 'A global program finding promising 15–17 year olds and funding their big ideas, with scholarships, mentorship and access.', 'Rise looks for 15–17 year olds from anywhere in the world with ideas that help others. Winners receive scholarships, need-based funding, mentorship, and a lifelong community.', 'Rise (risefortheworld.org)', 'https://www.risefortheworld.org', true, 'abroad', 'Ages 15–17 from any country', array['A project, invention or initiative you have started or dream of starting','Short video or written application'], '2027-01-15'),
  ('Misr El Kheir Scholarships', 'scholarship', 'Scholarships and educational support for outstanding students from families with limited income across Egypt.', 'The Misr El Kheir Foundation runs scholarship and educational support programs covering school and university stages for Egyptian students with financial need.', 'Misr El Kheir Foundation', 'https://misrelkheir.org', true, 'egypt', 'Egyptian students with financial need', array['Proof of enrollment','Family income statement','Academic transcript'], '2027-02-28'),
  ('AUC Excellence Scholarship Program', 'scholarship', 'Merit-based and need-based undergraduate scholarships at The American University in Cairo.', 'AUC offers a range of merit-based and need-based scholarships and financial aid packages for admitted Egyptian and international undergraduate students.', 'The American University in Cairo', 'https://www.aucegypt.edu/admissions/financial-support', true, 'egypt', 'Final-year secondary students applying to university', array['University application','Financial aid documents','Strong academic record'], '2027-03-15'),
  ('GUC Talent Scholarships', 'scholarship', 'Partial and full tuition scholarships for top-performing students at the German University in Cairo.', 'The German University in Cairo awards talent scholarships based on secondary school results and entrance assessments.', 'The German University in Cairo', 'https://www.guc.edu.eg', true, 'egypt', 'Final-year secondary students', array['Secondary school certificate','Entrance assessment'], '2027-03-01'),
  ('Regeneron ISEF — affiliated science fairs', 'research', 'Compete in a local, affiliated science fair for a chance to advance to the world''s largest pre-college research competition.', 'Students in grades 9–12 win an affiliated fair to compete at Regeneron ISEF. Egyptian students enter through ISEF-affiliated fairs run locally by universities and STEM school networks.', 'Society for Science', 'https://www.societyforscience.org/isef/', true, 'egypt', 'Grades 9–12 with an independent research project', array['Original research project','Abstract and poster','Local affiliated fair entry'], '2027-01-31'),
  ('Khan Academy — free SAT & math prep', 'training', 'Free, self-paced courses in math, science and SAT preparation — perfect for students preparing for thanaweya amma and scholarships.', 'Khan Academy offers completely free practice exercises, instructional videos and a personalized learning dashboard in math, sciences, SAT prep and more, in English and Arabic.', 'Khan Academy', 'https://www.khanacademy.org', true, 'online', 'Open to everyone', array['Just an email or Google account to track progress'], null),
  ('Google Career Certificates — scholarship seats', 'training', 'Scholarship-funded online certificates in IT, data analytics, UX and digital marketing from Google.', 'Through partner organizations, Google offers scholarship seats for its career certificates — job-ready skills in growing fields, studied fully online.', 'Grow with Google', 'https://grow.google', true, 'online', 'Ages 18+, students and job seekers', array['Apply through a partner organization','Reliable internet access'], '2027-04-30'),
  ('edX — free audit track courses', 'training', 'Audit university-level courses from top universities for free, including computer science and engineering.', 'edX lets you audit thousands of university courses for free; pay only if you want a verified certificate. Financial assistance is available for certificates.', 'edX', 'https://www.edx.org', true, 'online', 'Open to everyone', array['Free account registration','Financial aid application (for certificates)'], null),
  ('AYB Entrepreneurship Bootcamp', 'training', 'Free entrepreneurship and life-skills bootcamps for youth run by the Alashanek Ya Balady Association.', 'Alashanek Ya Balady runs free training bootcamps covering entrepreneurship, financial literacy and employability skills for underserved youth across Egypt.', 'Alashanek Ya Balady Association', 'https://ayb-sd.org', true, 'egypt', 'Ages 16–25 in target governorates', array['Registration form','Commitment to attend sessions'], '2026-12-15');