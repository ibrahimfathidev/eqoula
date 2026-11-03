-- Refresh opportunity rows with real, verified program details (checked Nov 2026
-- against provider pages). Placeholder deadlines are replaced with the providers'
-- published dates; programs without a published date become NULL ("Rolling
-- deadline" in the UI) rather than a guessed date.

update public.opportunities set deadline = '2027-01-17'
  where title = 'Rise — Global Talent Program';

update public.opportunities set
    link = 'https://mekeg.org/en/join_us/scholarships',
    deadline = null,
    description = 'The Misr El Kheir Foundation runs scholarship and educational support programs covering school and university stages for Egyptian students with financial need. Applications open in waves — current calls are published on the foundation''s scholarships page.',
    eligibility = 'Egyptian students with financial need (outstanding students also placed at partner universities such as Zewail City)'
  where title = 'Misr El Kheir Scholarships';

update public.opportunities set
    link = 'https://www.aucegypt.edu/admissions/scholarships/excellence-program',
    deadline = '2027-02-01',
    summary = 'Merit-based and need-based undergraduate scholarships at The American University in Cairo — up to 100% tuition coverage.',
    description = 'Through the Excellence Scholarship Program, AUC attracts outstanding students with five scholarship categories (academic achievement, international diversity and more); coverage starts at 20% and can reach 100% when combined. Scholarships are considered with the admission application. Fall 2027 early-admission deadline is February 1, 2027; regular admission closes June 1, 2027.',
    eligibility = 'Final-year secondary students applying to AUC — tick the scholarship box on the admission application'
  where title = 'AUC Excellence Scholarship Program';

update public.opportunities set
    link = 'https://www.guc.edu.eg/en/admission/undergraduate/scholarships.aspx',
    deadline = null,
    summary = 'Scholarships for top-ranked Thanaweya Amma students: the ten highest scorers nationwide plus two awards per governorate.',
    description = 'GUC runs two scholarship tracks for Egyptian secondary-school students: track one goes to the ten highest-scoring students in the entire country in the Thanaweya Amma national examinations; track two distributes roughly 54 awards across Egypt''s governorates — two per governorate — for the top-ranked holders of Thanaweya Amma or equivalent certificates. Assessment follows the annual exam results cycle.',
    eligibility = 'Top-ranked Thanaweya Amma (or equivalent certificate) holders'
  where title = 'GUC Talent Scholarships';

update public.opportunities set
    provider_name = 'Society for Science · ISEF Egypt (ASTF)',
    link = 'https://www.astf.net/isef-egypt.html',
    deadline = null,
    summary = 'Compete in ISEF Egypt — the official Regeneron ISEF affiliate for Egyptian students aged 14–18 across 17 scientific fields.',
    description = 'ISEF Egypt, launched in Cairo and run by the Arab Science and Technology Foundation, is the regional affiliate of the world''s largest pre-college research competition. Egyptian students aged 14–18 enter through ISEF Egypt with breakthrough innovations across 17 scientific fields, competing for a share of $4 million in prizes and scholarships across six Arab nations. Local fair dates are announced each season on the affiliate''s page.',
    eligibility = 'Egyptian students aged 14–18 with an independent research project'
  where title = 'Regeneron ISEF — affiliated science fairs';

update public.opportunities set
    deadline = null,
    description = 'Alashanek Ya Balady runs free training bootcamps covering entrepreneurship, financial literacy and employability skills for underserved youth across Egypt. Trainings run year-round through AYB branches and university chapters — register through the association''s programs page.'
  where title = 'AYB Entrepreneurship Bootcamp';

update public.opportunities set
    provider_name = 'Grow with Google · Amideast (MENA)',
    link = 'https://www.amideast.org/en/our-work/develop-a-skill/technical-skills',
    deadline = null,
    description = 'Google sponsors scholarship seats for its Career Certificates in IT, data analytics, UX and digital marketing across the Middle East and North Africa. In Egypt the seats are distributed through partner organizations such as Amideast''s "Grow Stronger with Google" program — apply through the partner''s page; seats open in rounds.',
    eligibility = 'MENA residents; students and job seekers (some certificates 18+)'
  where title = 'Google Career Certificates — scholarship seats';
