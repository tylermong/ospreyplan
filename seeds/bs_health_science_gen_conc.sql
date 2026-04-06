

--------------------------------------------------------------------------------
-- 1. Major Core: Health Science, General Concentration - Priority: 10
--------------------------------------------------------------------------------
-- Split into individual requirements so they appear as specific slots
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('hs-gen-conc-core-1241', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Medical Terminology', 1, 10),
  ('hs-gen-conc-core-1101', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Introduction to Health Science', 1, 11),
  ('hs-gen-conc-core-2305', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Statistics for Health Professionals', 1, 12),
  ('hs-gen-conc-core-2411', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Informatics', 1, 13),
  ('hs-gen-conc-core-2110', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Chemistry I', 1, 14),
  ('hs-gen-conc-core-1260', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Anatomy and Physiology I', 1, 15),
  ('hs-gen-conc-core-2260', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Anatomy and Physiology II', 1, 16),
  ('hs-gen-conc-core-2501', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Ethics and Teamwork', 1, 17),
  ('hs-gen-conc-core-3411', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Writing and Editing for Health Professionals', 1, 18),
  ('hs-gen-conc-core-4200', 'bs-health-science-gen-conc', 'Major in Health Science, General Concentration, BS', 'Research for the Health Sciences', 1, 19);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES 
  ('hs-gen-conc-core-1241', 'COURSE', 'HLTH', 1241),
  ('hs-gen-conc-core-1101', 'COURSE', 'HLTH', 1101),
  ('hs-gen-conc-core-2305', 'COURSE', 'HLTH', 2305),
  ('hs-gen-conc-core-2305', 'COURSE', 'CIST', 1206),
  ('hs-gen-conc-core-2411', 'COURSE', 'HLTH', 2411),
  ('hs-gen-conc-core-2110', 'COURSE', 'CHEM', 2110),
  ('hs-gen-conc-core-1260', 'COURSE', 'BIOL', 1260),
  ('hs-gen-conc-core-2260', 'COURSE', 'BIOL', 2260),
  ('hs-gen-conc-core-2501', 'COURSE', 'HLTH', 2501),
  ('hs-gen-conc-core-3411', 'COURSE', 'HLTH', 3411),
  ('hs-gen-conc-core-4200', 'COURSE', 'HLTH', 4200);

--------------------------------------------------------------------------------
-- 2. Upper Level Cognates: Health Science, General Concentration (Need 5) - Priority: 20
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('hs-gen-conc-cognates', 'bs-health-science-gen-conc', 'Upper Level Cognates: Health Science, General Concentration', 'Health Science Cognate Courses', 5, 20);

-- NOTE:
-- The current criteria model supports minimum level but not maximum level,
-- explicit exclusions, or credit-hour ranges in requirement criteria.
-- This encodes the requested cognate pool as allowed subjects at 3000+,
-- plus the explicit BIOL/MGMT/MKTG gateway courses.
INSERT INTO public.requirement_criteria (requirement_id, type, subject, min_level)
VALUES
  ('hs-gen-conc-cognates', 'RANGE', 'ACCT', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'ANTH', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'BIOL', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'CHEM', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'ENVL', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'FINA', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'EXSC', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'GERO', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'HLTH', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'MGMT', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'MKTG', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'NURS', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'PLAW', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'PSYC', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'PUBH', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'SOCY', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'SOWK', 3000),
  ('hs-gen-conc-cognates', 'RANGE', 'SUST', 3000);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES
  ('hs-gen-conc-cognates', 'COURSE', 'BIOL', 2110),
  ('hs-gen-conc-cognates', 'COURSE', 'BIOL', 2170),
  ('hs-gen-conc-cognates', 'COURSE', 'MGMT', 2110),
  ('hs-gen-conc-cognates', 'COURSE', 'MKTG', 2110);

--------------------------------------------------------------------------------
-- 3. Lower Level Cognates: Health Science, General Concentration (At least 20 credits) - Priority: 25
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('hs-gen-conc-lower-cognates', 'bs-health-science-gen-conc', 'Lower Level Cognates: Health Science, General Concentration', 'Lower Level Cognate Courses', 5, 25);

-- NOTE:
-- The audit engine currently counts courses, not credits, for requirement completion.
-- This uses a 5-course proxy for the 20-credit requirement.
INSERT INTO public.requirement_criteria (requirement_id, type, subject)
VALUES
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'CHEM'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'BIOL'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'PSYC'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'HLTH'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'EXSC'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'GERO'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'PUBH'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'PHYS'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'ACCT'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'ECON'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'MGMT'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'MKTG'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'SOCY'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'ENVL'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'SOWK'),
  ('hs-gen-conc-lower-cognates', 'SUBJECT', 'SUST');

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES
  ('hs-gen-conc-lower-cognates', 'COURSE', 'LANG', 2144),
  ('hs-gen-conc-lower-cognates', 'COURSE', 'LANG', 2145),
  ('hs-gen-conc-lower-cognates', 'COURSE', 'EDUC', 1515),
  ('hs-gen-conc-lower-cognates', 'COURSE', 'EDUC', 2241);

INSERT INTO public.requirement_criteria (requirement_id, type, subject, course_number)
VALUES
  ('hs-gen-conc-lower-cognates', 'EXCLUDE_COURSE', 'CHEM', 2110),
  ('hs-gen-conc-lower-cognates', 'EXCLUDE_COURSE', 'CHEM', 2115);

--------------------------------------------------------------------------------
-- 4. General Studies (48 credits) - Priority: 30
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('hs-gen-conc-gis', 'bs-health-science-gen-conc', 'General Studies for Bachelor of Science, BFA, BSN', 'General Integration and Synthesis (GIS)', 1, 50),
  ('hs-gen-conc-gen', 'bs-health-science-gen-conc', 'General Studies for Bachelor of Science, BFA, BSN', 'General Interdisciplinary (GEN)', 1, 55),
  ('hs-gen-conc-gah', 'bs-health-science-gen-conc', 'General Studies for Bachelor of Science, BFA, BSN', 'General Arts and Humanities (GAH)', 2, 60),
  ('hs-gen-conc-gnm', 'bs-health-science-gen-conc', 'General Studies for Bachelor of Science, BFA, BSN', 'General Natural Mathematics and Sciences (GNM)', 2, 65),
  ('hs-gen-conc-gss', 'bs-health-science-gen-conc', 'General Studies for Bachelor of Science, BFA, BSN', 'General Social and Behavioral Sciences (GSS)', 2, 70);
INSERT INTO public.requirement_criteria (requirement_id, type, subject)
VALUES 
  ('hs-gen-conc-gis', 'SUBJECT', 'GIS'),
  ('hs-gen-conc-gen', 'SUBJECT', 'GEN'),
  ('hs-gen-conc-gah', 'SUBJECT', 'GAH'),
  ('hs-gen-conc-gnm', 'SUBJECT', 'GNM'),
  ('hs-gen-conc-gss', 'SUBJECT', 'GSS');

--------------------------------------------------------------------------------
-- 7. Attributes (Multi-Dippers) - Priority: 100+
-- These are Overlay requirements (Pass 2)
--------------------------------------------------------------------------------

-- Attribute Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('hs-gen-conc-attr-a', 'bs-health-science-gen-conc', 'Attribute Requirements', 'Arts (A)', 1, 100),
  ('hs-gen-conc-attr-h', 'bs-health-science-gen-conc', 'Attribute Requirements', 'Historical Consciousness (H)', 1, 101),
  ('hs-gen-conc-attr-v', 'bs-health-science-gen-conc', 'Attribute Requirements', 'Values/Ethics (V)', 1, 102),
  ('hs-gen-conc-attr-i', 'bs-health-science-gen-conc', 'Attribute Requirements', 'International/Multicultural (I)', 1, 103);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('hs-gen-conc-attr-a', 'ATTRIBUTE', 'A'),
  ('hs-gen-conc-attr-h', 'ATTRIBUTE', 'H'),
  ('hs-gen-conc-attr-v', 'ATTRIBUTE', 'V'),
  ('hs-gen-conc-attr-i', 'ATTRIBUTE', 'I');

-- Writing Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('hs-gen-conc-write-w1', 'bs-health-science-gen-conc', 'Writing Requirements', 'Writing (W1)', 1, 110),
  ('hs-gen-conc-write-w1w2', 'bs-health-science-gen-conc', 'Writing Requirements', 'Writing (W1 or W2)', 2, 111),
  ('hs-gen-conc-write-upper', 'bs-health-science-gen-conc', 'Writing Requirements', 'Upper Level Writing (W1 or W2, 3000+)', 1, 112);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('hs-gen-conc-write-w1', 'ATTRIBUTE', 'W1'),
  ('hs-gen-conc-write-w1w2', 'ATTRIBUTE', 'W1'),
  ('hs-gen-conc-write-w1w2', 'ATTRIBUTE', 'W2');

INSERT INTO public.requirement_criteria (requirement_id, type, attribute, min_level)
VALUES 
  ('hs-gen-conc-write-upper', 'ATTRIBUTE', 'W1', 3000),
  ('hs-gen-conc-write-upper', 'ATTRIBUTE', 'W2', 3000);

-- Quantitative Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('hs-gen-conc-quant-q1', 'bs-health-science-gen-conc', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q1)', 1, 120),
  ('hs-gen-conc-quant-q2', 'bs-health-science-gen-conc', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q2)', 1, 121),
  ('hs-gen-conc-quant-q1q2', 'bs-health-science-gen-conc', 'Quantitative Reasoning Requirements', 'Quantitative Reasoning (Q1 or Q2)', 1, 122);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('hs-gen-conc-quant-q1', 'ATTRIBUTE', 'Q1'),
  ('hs-gen-conc-quant-q2', 'ATTRIBUTE', 'Q2'),
  ('hs-gen-conc-quant-q1q2', 'ATTRIBUTE', 'Q1'),
  ('hs-gen-conc-quant-q1q2', 'ATTRIBUTE', 'Q2');

-- Race and Racism Education Requirements
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES 
  ('hs-gen-conc-race-r1', 'bs-health-science-gen-conc', 'Race and Racism Education Requirements', 'Race and Racism Education (R1)', 1, 130),
  ('hs-gen-conc-race-r1r2', 'bs-health-science-gen-conc', 'Race and Racism Education Requirements', 'Race and Racism Education (R1 or R2)', 1, 131);

INSERT INTO public.requirement_criteria (requirement_id, type, attribute)
VALUES 
  ('hs-gen-conc-race-r1', 'ATTRIBUTE', 'R1'),
  ('hs-gen-conc-race-r1r2', 'ATTRIBUTE', 'R1'),
  ('hs-gen-conc-race-r1r2', 'ATTRIBUTE', 'R2');

--------------------------------------------------------------------------------
-- 8. AT SOME DISTANCE (ASD) - Priority: 999
-- Catch-all for anything not consumed above.
--------------------------------------------------------------------------------
INSERT INTO public.degree_requirements (id, degree_code, category, name, required_count, priority)
VALUES ('hs-gen-conc-asd-bucket', 'bs-health-science-gen-conc', 'At Some Distance Requirements', 'At Some Distance', 4, 999);

INSERT INTO public.requirement_criteria (requirement_id, type)
VALUES ('hs-gen-conc-asd-bucket', 'CATCH_ALL');
