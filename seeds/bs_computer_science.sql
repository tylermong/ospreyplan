

--------------------------------------------------------------------------------
-- 1. MAJOR CORE (CS) - Priority: 10
--------------------------------------------------------------------------------
-- Split into individual requirements so they appear as specific slots
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('cs-core-2101', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Programming and Problem Solving I', 1, 10),
  ('cs-core-2102', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Programming and Problem Solving II', 1, 11),
  ('cs-core-3101', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Data Structures and Algorithms I', 1, 12),
  ('cs-core-3230', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Computer Networking Principles', 1, 13),
  ('cs-core-3250', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Computer Organization', 1, 14),
  ('cs-core-4104', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Data Structures and Algorithms II', 1, 15),
  ('cs-core-4485', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Software Engineering', 1, 16),
  ('cs-core-4600', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Senior Seminar', 1, 17);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES 
  ('cs-core-2101', 'COURSE', 'CSCI', 2101),
  ('cs-core-2102', 'COURSE', 'CSCI', 2102),
  ('cs-core-3101', 'COURSE', 'CSCI', 3101),
  ('cs-core-3230', 'COURSE', 'CIST', 3230),
  ('cs-core-3250', 'COURSE', 'CSCI', 3250),
  ('cs-core-4104', 'COURSE', 'CSCI', 4104),
  ('cs-core-4485', 'COURSE', 'CSCI', 4485),
  ('cs-core-4600', 'COURSE', 'CSCI', 4600);

--------------------------------------------------------------------------------
-- 2. CS ELECTIVES (Pool of ~10, Need 4) - Priority: 20
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('cs-elec', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Computer Science Elective', 4, 20);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES 
  ('cs-elec', 'COURSE', 'CIST', 3222), -- Database Systems
  ('cs-elec', 'COURSE', 'CIST', 3381), -- Information Assurance & Security
  ('cs-elec', 'COURSE', 'CSCI', 4105), -- Knowledge Discovery & Data Mining
  ('cs-elec', 'COURSE', 'CSCI', 4135), -- Web Application Engineering
  ('cs-elec', 'COURSE', 'CSCI', 4251), -- Operating Systems
  ('cs-elec', 'COURSE', 'CSCI', 4463), -- Artificial Intelligence
  ('cs-elec', 'COURSE', 'CSCI', 4464), -- Computer Vision
  ('cs-elec', 'COURSE', 'CSCI', 4465), -- Machine Learning
  ('cs-elec', 'COURSE', 'CSCI', 4469), -- Computer Architecture
  ('cs-elec', 'COURSE', 'CSCI', 4481), -- Cryptography and Data Security
  ('cs-elec', 'COURSE', 'CSCI', 4510); -- Topics in Computer Science

--------------------------------------------------------------------------------
-- 3. MATH CORE - Priority: 25
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('math-core-2215', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Calculus I', 1, 25),
  ('math-core-2216', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Calculus II', 1, 26),
  ('math-core-2225', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Discrete Mathematics', 1, 27),
  ('math-core-2226', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Foundations of Computer Science', 1, 28),
  ('math-core-3327', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Probability and Applied Statistics', 1, 29);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES 
  ('math-core-2215', 'COURSE', 'MATH', 2215), -- Calculus I
  ('math-core-2216', 'COURSE', 'MATH', 2216), -- Calculus II
  ('math-core-2225', 'COURSE', 'MATH', 2225), -- Discrete Mathematics
  ('math-core-2226', 'COURSE', 'CSCI', 2226), -- Foundations of Computer Science
  ('math-core-3327', 'COURSE', 'CSCI', 3327); -- Probability and Applied Statistics

--------------------------------------------------------------------------------
-- 4. SCIENCE CORE (Physics OR Bio OR Chem) - Priority: 30
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('science-core', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Science Core', 2, 30);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number, group_id)
VALUES 
  ('science-core', 'COURSE', 'PHYS', 2220, 'PHYS_SEQ_1'), ('science-core', 'COURSE', 'PHYS', 2225, 'PHYS_SEQ_1'),
  ('science-core', 'COURSE', 'BIOL', 1200, 'BIOL_SEQ_1'), ('science-core', 'COURSE', 'BIOL', 1205, 'BIOL_SEQ_1'),
  ('science-core', 'COURSE', 'CHEM', 2110, 'CHEM_SEQ_1'), ('science-core', 'COURSE', 'CHEM', 2115, 'CHEM_SEQ_1');

--------------------------------------------------------------------------------
-- 5. MATH/SCIENCE ELECTIVE - Priority: 35
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('math-sci-elec', 'bs-computer-science', 'Major in Computer Science, CSCI, BS', 'Math/Science Elective', 1, 35);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number, group_id)
VALUES 
  ('math-sci-elec', 'COURSE', 'MATH', 2217, NULL), -- Calculus III
  ('math-sci-elec', 'COURSE', 'MATH', 3323, NULL), -- Linear Algebra
  ('math-sci-elec', 'COURSE', 'BIOL', 1400, 'BIOL_SEQ_2'), -- Biodiversity and Evolution
  ('math-sci-elec', 'COURSE', 'BIOL', 1405, 'BIOL_SEQ_2'), -- Biodiversity and Evolution Lab
  ('math-sci-elec', 'COURSE', 'CHEM', 2120, 'CHEM_SEQ_2'), -- Chemistry II
  ('math-sci-elec', 'COURSE', 'CHEM', 2125, 'CHEM_SEQ_2'), -- Chemistry II Lab
  ('math-sci-elec', 'COURSE', 'PHYS', 2230, 'PHYS_SEQ_2'), -- Physics II
  ('math-sci-elec', 'COURSE', 'PHYS', 2235, 'PHYS_SEQ_2'); -- Physics II Lab

--------------------------------------------------------------------------------
-- 6. GENERAL STUDIES (GAH, GIS) - Priority: 50
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('cs-gen-gis', 'bs-computer-science', 'General Studies for Bachelor of Science, BFA, BSN', 'General Integration and Synthesis (GIS)', 1, 50),
  ('cs-gen-gen', 'bs-computer-science', 'General Studies for Bachelor of Science, BFA, BSN', 'General Interdisciplinary (GEN)', 1, 55),
  ('cs-gen-gah', 'bs-computer-science', 'General Studies for Bachelor of Science, BFA, BSN', 'General Arts and Humanities (GAH)', 2, 60),
  ('cs-gen-gnm', 'bs-computer-science', 'General Studies for Bachelor of Science, BFA, BSN', 'General Natural Mathematics and Sciences (GNM)', 2, 65),
  ('cs-gen-gss', 'bs-computer-science', 'General Studies for Bachelor of Science, BFA, BSN', 'General Social and Behavioral Sciences (GSS)', 2, 70);
INSERT INTO public.requirement_criteria (requirement_id, type, subject)
VALUES 
  ('cs-gen-gis', 'SUBJECT', 'GIS'),
  ('cs-gen-gen', 'SUBJECT', 'GEN'),
  ('cs-gen-gah', 'SUBJECT', 'GAH'),
  ('cs-gen-gnm', 'SUBJECT', 'GNM'),
  ('cs-gen-gss', 'SUBJECT', 'GSS');

--------------------------------------------------------------------------------
-- 7. ATTRIBUTES (Multi-Dippers) - Priority: 100+
-- These are Overlay requirements (Pass 2)
--------------------------------------------------------------------------------

-- Attribute Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('cs-attr-a', 'bs-computer-science', 'Attribute Requirements', 'Arts (A)', 1, 100),
  ('cs-attr-h', 'bs-computer-science', 'Attribute Requirements', 'Historical Consciousness (H)', 1, 101),
  ('cs-attr-v', 'bs-computer-science', 'Attribute Requirements', 'Values/Ethics (V)', 1, 102),
  ('cs-attr-i', 'bs-computer-science', 'Attribute Requirements', 'International/Multicultural (I)', 1, 103);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('cs-attr-a', 'ATTRIBUTE', 'A'),
  ('cs-attr-h', 'ATTRIBUTE', 'H'),
  ('cs-attr-v', 'ATTRIBUTE', 'V'),
  ('cs-attr-i', 'ATTRIBUTE', 'I');

-- Writing Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('cs-write-w1', 'bs-computer-science', 'Writing Requirements', 'Writing (W1)', 1, 110),
  ('cs-write-w1w2', 'bs-computer-science', 'Writing Requirements', 'Writing (W1 or W2)', 2, 111),
  ('cs-write-upper', 'bs-computer-science', 'Writing Requirements', 'Upper Level Writing (W1 or W2, 3000+)', 1, 112);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('cs-write-w1', 'ATTRIBUTE', 'W1'),
  ('cs-write-w1w2', 'ATTRIBUTE', 'W1'),
  ('cs-write-w1w2', 'ATTRIBUTE', 'W2');

INSERT INTO public.requirement_criteria (requirement_id, type, attribute, min_level)
VALUES 
  ('cs-write-upper', 'ATTRIBUTE', 'W1', 3000),
  ('cs-write-upper', 'ATTRIBUTE', 'W2', 3000);

-- Quantitative Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('cs-quant-q1', 'bs-computer-science', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q1)', 1, 120),
  ('cs-quant-q2', 'bs-computer-science', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q2)', 1, 121),
  ('cs-quant-q1q2', 'bs-computer-science', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q1 or Q2)', 1, 122);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('cs-quant-q1', 'ATTRIBUTE', 'Q1'),
  ('cs-quant-q2', 'ATTRIBUTE', 'Q2'),
  ('cs-quant-q1q2', 'ATTRIBUTE', 'Q1'),
  ('cs-quant-q1q2', 'ATTRIBUTE', 'Q2');

-- Race and Racism Education Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('cs-race-r1', 'bs-computer-science', 'Race and Racism Education Requirements', 'Race and Racism Education (R1)', 1, 130),
  ('cs-race-r1r2', 'bs-computer-science', 'Race and Racism Education Requirements', 'Race and Racism Education (R1 or R2)', 1, 131);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('cs-race-r1', 'ATTRIBUTE', 'R1'),
  ('cs-race-r1r2', 'ATTRIBUTE', 'R1'),
  ('cs-race-r1r2', 'ATTRIBUTE', 'R2');

--------------------------------------------------------------------------------
-- 8. AT SOME DISTANCE (ASD) - Priority: 999
-- Catch-all for anything not consumed above.
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('cs-asd-bucket', 'bs-computer-science', 'At Some Distance Requirements', 'At Some Distance', 4, 999);

INSERT INTO public.requirement_criteria (requirement_id, type)
VALUES ('cs-asd-bucket', 'CATCH_ALL');
