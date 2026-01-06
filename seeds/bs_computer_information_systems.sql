--------------------------------------------------------------------------------
-- 1. MAJOR CORE (CIS) - Priority: 10
--------------------------------------------------------------------------------
-- Split into individual requirements so they appear as specific slots
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('cis-core-2010', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Computer Information Systems: An Overview', 1, 10),
  ('cis-core-2101', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Programming and Problem Solving I', 1, 11),
  ('cis-core-2110', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Programming in Python', 1, 12),
  ('cis-core-2210', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Systems Analysis & Design', 1, 13),
  ('cis-core-3222', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Database Systems', 1, 14),
  ('cis-core-3230', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Computer Networking Principles', 1, 15),
  ('cis-core-3259', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Business Analytics', 1, 16),
  ('cis-core-3475', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Project Management', 1, 17),
  ('cis-core-4381', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'IT Infrastructure Management & Compliance', 1, 18),
  ('cis-core-4600', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Senior Seminar', 1, 19);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES 
  ('cis-core-2010', 'COURSE', 'CIST', 2010),
  ('cis-core-2101', 'COURSE', 'CIST', 2101),
  ('cis-core-2110', 'COURSE', 'CIST', 2110),
  ('cis-core-2210', 'COURSE', 'CIST', 2210),
  ('cis-core-3222', 'COURSE', 'CIST', 3222),
  ('cis-core-3230', 'COURSE', 'CIST', 3230),
  ('cis-core-3259', 'COURSE', 'CIST', 3259),
  ('cis-core-3475', 'COURSE', 'CIST', 3475),
  ('cis-core-4381', 'COURSE', 'CIST', 4381),
  ('cis-core-4600', 'COURSE', 'CIST', 4600);

--------------------------------------------------------------------------------
-- 2. CIS ELECTIVES (Pool of 11, Need 4) - Priority: 20
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('cis-elec', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Computer Information Systems Elective', 4, 20);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES 
  ('cis-elec', 'COURSE', 'CIST', 3110), -- Python for Data Analysis
  ('cis-elec', 'COURSE', 'CIST', 3240), -- Enterprise Resource Planning
  ('cis-elec', 'COURSE', 'CIST', 3381), -- Information Assurance and Security
  ('cis-elec', 'COURSE', 'CIST', 3430), -- Network & System Administration
  ('cis-elec', 'COURSE', 'CIST', 3450), -- Business Intelligence
  ('cis-elec', 'COURSE', 'CIST', 3470), -- Application Development
  ('cis-elec', 'COURSE', 'CIST', 3472), -- Human-Computer Interaction
  ('cis-elec', 'COURSE', 'CIST', 3481), -- Digital Forensics & Cybercrime Investigation
  ('cis-elec', 'COURSE', 'CIST', 4223), -- Advanced Database
  ('cis-elec', 'COURSE', 'CIST', 4520); -- Topics in Information Systems

--------------------------------------------------------------------------------
-- 3. IS ENVIRONMENT CORE - Priority: 25
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('is-environment-core-econ-1200', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Macroeconomics', 1, 25),
  ('is-environment-core-mgmt-2110', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Introduction to Management', 1, 26),
  ('is-environment-core-mktg-2110', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Marketing Principles', 1, 27),
  ('is-environment-core-acct-2110', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Financial Accounting', 1, 28);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES 
  ('is-environment-core-econ-1200', 'COURSE', 'ECON', 1200), -- Macroeconomics
  ('is-environment-core-mgmt-2110', 'COURSE', 'MGMT', 2110), -- Introduction to Management
  ('is-environment-core-mktg-2110', 'COURSE', 'MKTG', 2110), -- Marketing Principles
  ('is-environment-core-acct-2110', 'COURSE', 'ACCT', 2110); -- Financial Accounting

--------------------------------------------------------------------------------
-- 4. QUANTITATIVE ANALYSIS - Priority: 30
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('quantitative-analysis', 'bs-computer-information-systems', 'Major in Computer Information Systems, CIST, BS', 'Quantitative Analysis', 2, 30);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES 
  ('quantitative-analysis-1206', 'COURSE', 'CIST', 1206), -- Statistics
  ('quantitative-analysis-2225', 'COURSE', 'MATH', 2225); -- Discrete Mathematics

--------------------------------------------------------------------------------
-- 5. GENERAL STUDIES - Priority: 50
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('gen-gis', 'bs-computer-information-systems', 'General Studies for Bachelor of Science, BFA, BSN', 'General Integration and Synthesis (GIS)', 1, 50),
  ('gen-gen', 'bs-computer-information-systems', 'General Studies for Bachelor of Science, BFA, BSN', 'General Interdisciplinary (GEN)', 1, 55),
  ('gen-gah', 'bs-computer-information-systems', 'General Studies for Bachelor of Science, BFA, BSN', 'General Arts and Humanities (GAH)', 2, 60),
  ('gen-gnm', 'bs-computer-information-systems', 'General Studies for Bachelor of Science, BFA, BSN', 'General Natural Mathematics and Sciences (GNM)', 2, 65),
  ('gen-gss', 'bs-computer-information-systems', 'General Studies for Bachelor of Science, BFA, BSN', 'General Social and Behavioral Sciences (GSS)', 2, 70);

INSERT INTO public.requirement_criteria (requirement_id, type, subject)
VALUES 
  ('gen-gah', 'SUBJECT', 'GAH'),
  ('gen-gis', 'SUBJECT', 'GIS'),
  ('gen-gnm', 'SUBJECT', 'GNM'),
  ('gen-gss', 'SUBJECT', 'GSS');

--------------------------------------------------------------------------------
-- 6. ATTRIBUTES (Multi-Dippers) - Priority: 100+
-- These are Overlay requirements (Pass 2)
--------------------------------------------------------------------------------
-- Attribute Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('attr-a', 'bs-computer-science', 'Attribute Requirements', 'Arts (A)', 1, 100),
  ('attr-h', 'bs-computer-science', 'Attribute Requirements', 'Historical Consciousness (H)', 1, 101),
  ('attr-v', 'bs-computer-science', 'Attribute Requirements', 'Values/Ethics (V)', 1, 102),
  ('attr-i', 'bs-computer-science', 'Attribute Requirements', 'International/Multicultural (I)', 1, 103);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('attr-a', 'ATTRIBUTE', 'A'),
  ('attr-h', 'ATTRIBUTE', 'H'),
  ('attr-v', 'ATTRIBUTE', 'V'),
  ('attr-i', 'ATTRIBUTE', 'I');

-- Writing Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('write-w1', 'bs-computer-science', 'Writing Requirements', 'Writing (W1)', 1, 110),
  ('write-w1w2', 'bs-computer-science', 'Writing Requirements', 'Writing (W1 or W2)', 2, 111),
  ('write-upper', 'bs-computer-science', 'Writing Requirements', 'Upper Level Writing (W1 or W2, 3000+)', 1, 112);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('write-w1', 'ATTRIBUTE', 'W1'),
  ('write-w1w2', 'ATTRIBUTE', 'W1'), ('write-w1w2', 'ATTRIBUTE', 'W2');

INSERT INTO public.requirement_criteria (requirement_id, type, attribute, min_level)
VALUES 
  ('write-upper', 'ATTRIBUTE', 'W1', 3000),
  ('write-upper', 'ATTRIBUTE', 'W2', 3000);

-- Quantitative Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('quant-q1', 'bs-computer-science', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q1)', 1, 120),
  ('quant-q2', 'bs-computer-science', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q2)', 1, 121),
  ('quant-q1q2', 'bs-computer-science', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q1 or Q2)', 1, 122);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('quant-q1', 'ATTRIBUTE', 'Q1'),
  ('quant-q2', 'ATTRIBUTE', 'Q2'),
  ('quant-q1q2', 'ATTRIBUTE', 'Q1'), ('quant-q1q2', 'ATTRIBUTE', 'Q2');

-- Race and Racism Education Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('race-r1', 'bs-computer-science', 'Race and Racism Education Requirements', 'Race and Racism Education (R1)', 1, 130),
  ('race-r1r2', 'bs-computer-science', 'Race and Racism Education Requirements', 'Race and Racism Education (R1 or R2)', 1, 131);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('race-r1', 'ATTRIBUTE', 'R1'),
  ('race-r1r2', 'ATTRIBUTE', 'R1'), ('race-r1r2', 'ATTRIBUTE', 'R2');

--------------------------------------------------------------------------------
-- 7. AT SOME DISTANCE (ASD) - Priority: 999
-- Catch-all for anything not consumed above.
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('asd-bucket', 'bs-computer-science', 'At Some Distance Requirements', 'At Some Distance', 4, 999);

INSERT INTO public.requirement_criteria (requirement_id, type)
VALUES ('asd-bucket', 'CATCH_ALL');
