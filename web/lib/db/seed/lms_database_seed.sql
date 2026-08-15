INSERT INTO users (
  id,
  cnic,
  password,
  full_name,
  phone,
  role,
  status
) VALUES
  ('V1StGXR8_Z5jdHi6B-myT', '1111111111111', '$2a$12$gxVtGZXGSoJUcs1/I2FeOu0QeGOehL7glfEgh/J9F8OOjAwhN7ZBO', 'Muhammad Usman Khan', '03001234567', 'admin', 'active'),
  ('mF8Kp2Lx9Qa7Wz3Nc6RtY', '2222222222222', '$2a$12$gxVtGZXGSoJUcs1/I2FeOu0QeGOehL7glfEgh/J9F8OOjAwhN7ZBO', 'Ayesha Fatima', '03121234567', 'admin', 'active'),
  ('K4nP8xQ2vL7mR5tY9cWzA', '3333333333333', '$2a$12$gxVtGZXGSoJUcs1/I2FeOu0QeGOehL7glfEgh/J9F8OOjAwhN7ZBO', 'Ahmed Raza', '03211234567', 'trainer', 'active'),
  ('Z6rT3mN8qW2xK9pL5vYcH', '4444444444444', '$2a$12$gxVtGZXGSoJUcs1/I2FeOu0QeGOehL7glfEgh/J9F8OOjAwhN7ZBO', 'Sana Iqbal', '03331234567', 'trainer', 'active'),
  ('P9xL4kR7mT2vN8qW5zYcB', '5555555555555', '$2a$12$gxVtGZXGSoJUcs1/I2FeOu0QeGOehL7glfEgh/J9F8OOjAwhN7ZBO', 'Hamza Ali', '03451234567', 'student', 'active'),
  ('Q5vN8mK2xR7tL4pW9zYcD', '6666666666666', '$2a$12$gxVtGZXGSoJUcs1/I2FeOu0QeGOehL7glfEgh/J9F8OOjAwhN7ZBO', 'Hira Ahmed', '03561234567', 'student', 'active');

INSERT INTO trainer_profiles (
  id,
  user_id,
  employee_code,
  specialization,
  bio,
  hourly_rate,
  joined_at
) VALUES
  (
    'TrnP8xQ2vL7mR5tY9cWzA',
    'K4nP8xQ2vL7mR5tY9cWzA',
    'TRN-001',
    'Web Development',
    'Experienced trainer specializing in modern web development, JavaScript, TypeScript, and backend development.',
    2500,
    '2025-01-15'
  ),
  (
    'TrnZ6rT3mN8qW2xK9pYcH',
    'Z6rT3mN8qW2xK9pL5vYcH',
    'TRN-002',
    'UI/UX Design',
    'Professional trainer specializing in UI/UX design, user research, wireframing, prototyping, and design systems.',
    2200,
    '2025-02-10'
  );

INSERT INTO student_profiles (
  id,
  user_id,
  roll_number,
  date_of_birth,
  guardian_name,
  guardian_phone,
  address,
  admission_date
) VALUES
  (
    'StdP9xL4kR7mT2vN8qYcB',
    'P9xL4kR7mT2vN8qW5zYcB',
    'STU-2025-001',
    '2004-06-18',
    'Muhammad Imran',
    '03011234567',
    'Gulshan-e-Iqbal, Karachi, Sindh',
    '2025-01-20'
  ),
  (
    'StdQ5vN8mK2xR7tL4pYcD',
    'Q5vN8mK2xR7tL4pW9zYcD',
    'STU-2025-002',
    '2005-09-24',
    'Ahmed Hassan',
    '03151234567',
    'North Nazimabad, Karachi, Sindh',
    '2025-01-20'
  );

INSERT INTO courses (
  id,
  title,
  slug,
  description,
  duration_weeks,
  fee_amount,
  created_by
) VALUES
  (
    'CrsW8kP2mL7xQ4vN9tYcA',
    'Full Stack Web Development',
    'full-stack-web-development',
    'A comprehensive course covering frontend and backend web development using HTML, CSS, JavaScript, TypeScript, React, Node.js, and MySQL.',
    16,
    45000.00,
    'V1StGXR8_Z5jdHi6B-myT'
  ),
  (
    'CrsZ6rT3nK8qW2mP5vYcH',
    'UI/UX Design',
    'ui-ux-design',
    'A practical course covering user research, wireframing, prototyping, visual design, design systems, and usability testing.',
    12,
    35000.00,
    'mF8Kp2Lx9Qa7Wz3Nc6RtY'
  );

INSERT INTO course_batches (
  id,
  course_id,
  trainer_id,
  batch_name,
  start_date,
  end_date
) VALUES
  (
    'BatF8kP2mL7xQ4vN9yA1',
    'CrsW8kP2mL7xQ4vN9tYcA',
    'TrnP8xQ2vL7mR5tY9cWzA',
    'FSD-2025-Morning',
    '2025-03-03',
    '2025-06-23'
  ),
  (
    'BatF9qR3nK8wT5mP2yB7',
    'CrsW8kP2mL7xQ4vN9tYcA',
    'TrnP8xQ2vL7mR5tY9cWzA',
    'FSD-2025-Evening',
    '2025-07-01',
    '2025-10-21'
  ),
  (
    'BatU6vN2xK9pL4rW8yC5',
    'CrsZ6rT3nK8qW2mP5vYcH',
    'TrnZ6rT3mN8qW2xK9pYcH',
    'UIUX-2025-Morning',
    '2025-03-10',
    '2025-06-02'
  ),
  (
    'BatU7mP4qL8xR2nW5yD9',
    'CrsZ6rT3nK8qW2mP5vYcH',
    'TrnZ6rT3mN8qW2xK9pYcH',
    'UIUX-2025-Evening',
    '2025-07-07',
    '2025-09-29'
  );

INSERT INTO batch_schedules (
  id,
  batch_id,
  weekday,
  start_time,
  end_time,
  room
) VALUES
  -- Full Stack Web Development - Morning
  (
    'SchF8kP2mL7xQ4vN9yA1',
    'BatF8kP2mL7xQ4vN9yA1',
    'monday',
    '09:00:00',
    '11:00:00',
    'Lab A'
  ),
  (
    'SchF9qR3nK8wT5mP2yB7',
    'BatF8kP2mL7xQ4vN9yA1',
    'wednesday',
    '09:00:00',
    '11:00:00',
    'Lab A'
  ),
  (
    'SchF7vN4xK2pL8mW5yC9',
    'BatF8kP2mL7xQ4vN9yA1',
    'friday',
    '09:00:00',
    '11:00:00',
    'Lab A'
  ),

  -- Full Stack Web Development - Evening
  (
    'SchF6mP3qL8xR2nW5yD7',
    'BatF9qR3nK8wT5mP2yB7',
    'tuesday',
    '18:00:00',
    '20:00:00',
    'Lab B'
  ),
  (
    'SchF5rT8nK2qW6mP3yX9',
    'BatF9qR3nK8wT5mP2yB7',
    'thursday',
    '18:00:00',
    '20:00:00',
    'Lab B'
  ),
  (
    'SchF4xQ7mL9pK2vN5yZ8',
    'BatF9qR3nK8wT5mP2yB7',
    'saturday',
    '18:00:00',
    '20:00:00',
    'Lab B'
  ),

  -- UI/UX Design - Morning
  (
    'SchU6vN2xK9pL4rW8yC5',
    'BatU6vN2xK9pL4rW8yC5',
    'monday',
    '10:00:00',
    '12:00:00',
    'Design Studio'
  ),
  (
    'SchU7mP4qL8xR2nW5yD9',
    'BatU6vN2xK9pL4rW8yC5',
    'wednesday',
    '10:00:00',
    '12:00:00',
    'Design Studio'
  ),
  (
    'SchU8kR3nT6qW2mP5xY7',
    'BatU6vN2xK9pL4rW8yC5',
    'friday',
    '10:00:00',
    '12:00:00',
    'Design Studio'
  ),

  -- UI/UX Design - Evening
  (
    'SchU9pL4xK7mR2vN5qW8',
    'BatU7mP4qL8xR2nW5yD9',
    'tuesday',
    '17:30:00',
    '19:30:00',
    'Design Studio'
  ),
  (
    'SchU5qW8nK2xL6mP4rY7',
    'BatU7mP4qL8xR2nW5yD9',
    'thursday',
    '17:30:00',
    '19:30:00',
    'Design Studio'
  ),
  (
    'SchU4mN7xP2qL8rW5yK9',
    'BatU7mP4qL8xR2nW5yD9',
    'saturday',
    '17:30:00',
    '19:30:00',
    'Design Studio'
  );

  INSERT INTO course_modules (
  id,
  course_id,
  title,
  description,
  order_index
) VALUES
  -- Full Stack Web Development
  (
    'ModF8kP2mL7xQ4vN9yA1',
    'CrsW8kP2mL7xQ4vN9tYcA',
    'Frontend Fundamentals',
    'Learn the core technologies of modern frontend web development including HTML, CSS, and JavaScript.',
    0
  ),
  (
    'ModF9qR3nK8wT5mP2yB7',
    'CrsW8kP2mL7xQ4vN9tYcA',
    'React and TypeScript',
    'Build modern, scalable frontend applications using React and TypeScript.',
    1
  ),
  (
    'ModF7vN4xK2pL8mW5yC9',
    'CrsW8kP2mL7xQ4vN9tYcA',
    'Backend Development',
    'Learn backend development with Node.js, REST APIs, authentication, and MySQL.',
    2
  ),

  -- UI/UX Design
  (
    'ModU6vN2xK9pL4rW8yC5',
    'CrsZ6rT3nK8qW2mP5vYcH',
    'UX Research',
    'Learn user research techniques, user personas, user journeys, and identifying user needs.',
    0
  ),
  (
    'ModU7mP4qL8xR2nW5yD9',
    'CrsZ6rT3nK8qW2mP5vYcH',
    'Wireframing and Prototyping',
    'Learn to create wireframes, interactive prototypes, and effective user flows.',
    1
  ),
  (
    'ModU8kR3nT6qW2mP5xY7',
    'CrsZ6rT3nK8qW2mP5vYcH',
    'Visual Design and Systems',
    'Learn visual hierarchy, typography, color theory, components, and design systems.',
    2
  );

  INSERT INTO module_lessons (
  id,
  module_id,
  title,
  description,
  order_index
) VALUES
  -- Frontend Fundamentals
  (
    'LsnF8kP2mL7xQ4vN9yA1',
    'ModF8kP2mL7xQ4vN9yA1',
    'HTML and Semantic Markup',
    'Learn HTML structure, semantic elements, forms, tables, and accessibility fundamentals.',
    0
  ),
  (
    'LsnF9qR3nK8wT5mP2yB7',
    'ModF8kP2mL7xQ4vN9yA1',
    'CSS and Responsive Design',
    'Learn CSS layouts, Flexbox, Grid, responsive design, and modern styling techniques.',
    1
  ),
  (
    'LsnF7vN4xK2pL8mW5yC9',
    'ModF8kP2mL7xQ4vN9yA1',
    'JavaScript Fundamentals',
    'Learn variables, functions, arrays, objects, DOM manipulation, and asynchronous JavaScript.',
    2
  ),

  -- React and TypeScript
  (
    'LsnF6mP3qL8xR2nW5yD7',
    'ModF9qR3nK8wT5mP2yB7',
    'React Fundamentals',
    'Learn components, props, state, events, hooks, and component-based application architecture.',
    0
  ),
  (
    'LsnF5rT8nK2qW6mP3yX9',
    'ModF9qR3nK8wT5mP2yB7',
    'TypeScript Essentials',
    'Learn TypeScript types, interfaces, generics, and type-safe React development.',
    1
  ),
  (
    'LsnF4xQ7mL9pK2vN5yZ8',
    'ModF9qR3nK8wT5mP2yB7',
    'Building React Applications',
    'Build a complete React application using reusable components, routing, forms, and API integration.',
    2
  ),

  -- Backend Development
  (
    'LsnF3pK8mR2xQ7vN5yT9',
    'ModF7vN4xK2pL8mW5yC9',
    'Node.js and Express',
    'Learn Node.js fundamentals and build backend applications using Express.',
    0
  ),
  (
    'LsnF2qW7nK4xL8mP5yR9',
    'ModF7vN4xK2pL8mW5yC9',
    'REST API Development',
    'Learn REST API architecture, routing, validation, error handling, and API security.',
    1
  ),
  (
    'LsnF1mN6xP3qL8rW5yK7',
    'ModF7vN4xK2pL8mW5yC9',
    'MySQL and Database Integration',
    'Learn relational database concepts and connect a Node.js application with MySQL.',
    2
  ),

  -- UX Research
  (
    'LsnU6vN2xK9pL4rW8yC5',
    'ModU6vN2xK9pL4rW8yC5',
    'Introduction to UX Research',
    'Understand UX research principles, research goals, and qualitative and quantitative methods.',
    0
  ),
  (
    'LsnU7mP4qL8xR2nW5yD9',
    'ModU6vN2xK9pL4rW8yC5',
    'User Personas',
    'Learn how to create realistic user personas based on research and user data.',
    1
  ),
  (
    'LsnU8kR3nT6qW2mP5xY7',
    'ModU6vN2xK9pL4rW8yC5',
    'User Journeys and Problem Definition',
    'Map user journeys and define clear problems that design solutions should address.',
    2
  ),

  -- Wireframing and Prototyping
  (
    'LsnU9pL4xK7mR2vN5qW8',
    'ModU7mP4qL8xR2nW5yD9',
    'Information Architecture',
    'Learn how to organize content, navigation, and user flows for digital products.',
    0
  ),
  (
    'LsnU5qW8nK2xL6mP4rY7',
    'ModU7mP4qL8xR2nW5yD9',
    'Low-Fidelity Wireframes',
    'Create simple wireframes to explore layouts, functionality, and user interactions.',
    1
  ),
  (
    'LsnU4mN7xP2qL8rW5yK9',
    'ModU7mP4qL8xR2nW5yD9',
    'Interactive Prototypes',
    'Create interactive prototypes and test user flows before development.',
    2
  ),

  -- Visual Design and Systems
  (
    'LsnU3rT8mK2qW6pN5xY7',
    'ModU8kR3nT6qW2mP5xY7',
    'Typography and Color',
    'Learn typography principles, color theory, contrast, and accessible color combinations.',
    0
  ),
  (
    'LsnU2xQ7mL4pK8vN5yR9',
    'ModU8kR3nT6qW2mP5xY7',
    'UI Components',
    'Design reusable buttons, forms, navigation, cards, and other interface components.',
    1
  ),
  (
    'LsnU1pN6xK3qL8mW5yT7',
    'ModU8kR3nT6qW2mP5xY7',
    'Design Systems',
    'Learn how to create scalable design systems with reusable components and consistent visual rules.',
    2
  );

  INSERT INTO enrollments (
  id,
  batch_id,
  student_id,
  enrollment_status,
  enrolled_at,
  completed_at
) VALUES
  (
    'EnrH8kP2mL7xQ4vN9yA1',
    'BatF8kP2mL7xQ4vN9yA1',
    'StdP9xL4kR7mT2vN8qYcB',
    'active',
    '2025-02-20 10:00:00',
    NULL
  ),
  (
    'EnrH9qR3nK8wT5mP2yB7',
    'BatU6vN2xK9pL4rW8yC5',
    'StdP9xL4kR7mT2vN8qYcB',
    'active',
    '2025-02-25 11:00:00',
    NULL
  ),
  (
    'EnrH7vN4xK2pL8mW5yC9',
    'BatF9qR3nK8wT5mP2yB7',
    'StdQ5vN8mK2xR7tL4pYcD',
    'active',
    '2025-06-20 14:00:00',
    NULL
  ),
  (
    'EnrH6mP3qL8xR2nW5yD7',
    'BatU7mP4qL8xR2nW5yD9',
    'StdQ5vN8mK2xR7tL4pYcD',
    'active',
    '2025-06-25 15:00:00',
    NULL
  );

  INSERT INTO announcements (
  id,
  created_by,
  title,
  description,
  is_public,
  target_audience,
  is_pinned,
  start_date,
  end_date
) VALUES
  -- PAST
  (
    'AnnA8kP2mL7xQ4vN9yA1',
    'V1StGXR8_Z5jdHi6B-myT',
    'Welcome to the New Training Session',
    'Welcome to all students joining our new training programs. Please review your batch schedule and course information before attending your first class.',
    true,
    'all',
    true,
    '2025-01-20',
    '2025-02-10'
  ),
  (
    'AnnA9qR3nK8wT5mP2yB7',
    'mF8Kp2Lx9Qa7Wz3Nc6RtY',
    'Orientation Session Completed',
    'The student orientation session has been successfully completed. Students who missed the session should contact their trainer for the required information.',
    false,
    'students',
    false,
    '2025-02-15',
    '2025-02-20'
  ),
  (
    'AnnA7vN4xK2pL8mW5yC9',
    'V1StGXR8_Z5jdHi6B-myT',
    'Trainer Meeting Announcement',
    'All trainers were requested to attend the monthly academic coordination meeting to discuss student progress and upcoming course activities.',
    false,
    'trainers',
    false,
    '2025-03-01',
    '2025-03-01'
  ),

  -- PRESENT / CURRENT
  (
    'AnnA6mP3qL8xR2nW5yD7',
    'mF8Kp2Lx9Qa7Wz3Nc6RtY',
    'Assignment Submission Reminder',
    'Students are reminded to submit their pending assignments before the respective due dates. Late submissions may be subject to the course submission policy.',
    false,
    'students',
    true,
    '2026-08-01',
    '2026-08-31'
  ),
  (
    'AnnA5rT8nK2qW6mP3yX9',
    'V1StGXR8_Z5jdHi6B-myT',
    'Monthly Progress Review',
    'Trainers are requested to review student attendance, lesson progress, assignment performance, and overall batch progress during the current month.',
    false,
    'trainers',
    false,
    '2026-08-05',
    '2026-08-31'
  ),
  (
    'AnnA4xQ7mL9pK2vN5yZ8',
    'mF8Kp2Lx9Qa7Wz3Nc6RtY',
    'Learning Resources Available',
    'New learning resources have been added to the LMS. Students can access the available course materials and lesson resources from their respective course pages.',
    true,
    'all',
    false,
    '2026-08-10',
    '2026-08-25'
  ),
  (
    'AnnA3pK8mR2xQ7vN5yT9',
    'V1StGXR8_Z5jdHi6B-myT',
    'System Maintenance Notice',
    'The LMS may experience brief interruptions while routine system maintenance is performed. Please save your work before the maintenance window.',
    true,
    'all',
    true,
    '2026-08-14',
    '2026-08-16'
  ),

  -- FUTURE
  (
    'AnnA2qW7nK4xL8mP5yR9',
    'mF8Kp2Lx9Qa7Wz3Nc6RtY',
    'Upcoming Quiz Week',
    'Students should prepare for the upcoming assessment week. Quiz schedules and instructions will be available through the LMS before the assessment period begins.',
    false,
    'students',
    true,
    '2026-09-01',
    '2026-09-07'
  ),
  (
    'AnnA1mN6xP3qL8rW5yK7',
    'V1StGXR8_Z5jdHi6B-myT',
    'New Batch Enrollment Opens',
    'Enrollment for the upcoming training batches will open soon. Interested students should review the available courses and contact administration for enrollment information.',
    true,
    'all',
    false,
    '2026-09-10',
    '2026-09-30'
  ),
  (
    'AnnA0rT5kP8xQ2mL7yN4',
    'mF8Kp2Lx9Qa7Wz3Nc6RtY',
    'Trainer Development Workshop',
    'A professional development workshop for trainers is scheduled for next month. Trainers will receive the detailed agenda and participation instructions before the event.',
    false,
    'trainers',
    false,
    '2026-10-05',
    '2026-10-06'
  );

INSERT INTO assignments (
  id,
  batch_id,
  module_id,
  lesson_id,
  created_by,
  title,
  instructions,
  max_marks,
  assignment_status,
  assigned_at,
  due_at
) VALUES
(
  'AsgF8kP2mL7xQ4vN9yA1',
  'BatF8kP2mL7xQ4vN9yA1',
  'ModF8kP2mL7xQ4vN9yA1',
  'LsnF8kP2mL7xQ4vN9yA1',
  'TrnP8xQ2vL7mR5tY9cWzA',
  'Build a Semantic HTML Page',
  'Create a webpage using semantic HTML elements including header, navigation, main content, sections, articles, and footer. Follow HTML5 and accessibility best practices.',
  100,
  'published',
  '2025-03-10',
  '2025-03-20'
),
(
  'AsgF9qR3nK8wT5mP2yB7',
  'BatF8kP2mL7xQ4vN9yA1',
  'ModF8kP2mL7xQ4vN9yA1',
  'LsnF9qR3nK8wT5mP2yB7',
  'TrnP8xQ2vL7mR5tY9cWzA',
  'Responsive Landing Page',
  'Design and implement a responsive landing page using CSS Flexbox and CSS Grid. The page should work correctly on desktop, tablet, and mobile screen sizes.',
  100,
  'published',
  '2025-03-24',
  '2025-04-04'
),
(
  'AsgU6vN2xK9pL4rW8yC5',
  'BatU7mP4qL8xR2nW5yD9',
  'ModU6vN2xK9pL4rW8yC5',
  'LsnU6vN2xK9pL4rW8yC5',
  'TrnZ6rT3mN8qW2xK9pYcH',
  'User Persona Creation',
  'Create two detailed user personas for a selected digital product. Include demographics, goals, frustrations, behaviors, motivations, and a scenario describing how the user interacts with the product.',
  100,
  'published',
  '2025-07-15',
  '2025-07-25'
),
(
  'AsgU7mP4qL8xR2nW5yD9',
  'BatU7mP4qL8xR2nW5yD9',
  'ModU7mP4qL8xR2nW5yD9',
  'LsnU5qW8nK2xL6mP4rY7',
  'TrnZ6rT3mN8qW2xK9pYcH',
  'Mobile App Wireframe',
  'Create low-fidelity wireframes for a mobile application. Include the main navigation, home screen, relevant content screens, and a complete user flow for one important task.',
  100,
  'published',
  '2025-08-01',
  '2025-08-12'
),
(
  'AsgU8kR3nT6qW2mP5xY7',
  'BatU7mP4qL8xR2nW5yD9',
  'ModU8kR3nT6qW2mP5xY7',
  'LsnU1pN6xK3qL8mW5yT7',
  'TrnZ6rT3mN8qW2xK9pYcH',
  'Create a Mini Design System',
  'Create a small design system for a web application including typography, colors, buttons, form controls, cards, spacing rules, and reusable UI components.',
  100,
  'published',
  '2025-08-15',
  '2025-08-29'
);

INSERT INTO assignment_reference_links (
  id,
  assignment_id,
  submission_id,
  assignment_resource_type,
  title,
  url
) VALUES

-- =========================================================
-- Build a Semantic HTML Page
-- Assignment: AsgF8kP2mL7xQ4vN9yA1
-- =========================================================
(
  'RefF8kP2mL7xQ4vN9a1',
  'AsgF8kP2mL7xQ4vN9yA1',
  NULL,
  'assignment',
  'MDN HTML Introduction',
  'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content'
),
(
  'RefF8kP2mL7xQ4vN9a2',
  'AsgF8kP2mL7xQ4vN9yA1',
  NULL,
  'assignment',
  'HTML Semantic Elements',
  'https://developer.mozilla.org/en-US/docs/Glossary/Semantics'
),
(
  'RefF8kP2mL7xQ4vN9a3',
  'AsgF8kP2mL7xQ4vN9yA1',
  NULL,
  'assignment',
  'HTML Accessibility Basics',
  'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility'
),

-- =========================================================
-- Responsive Landing Page
-- Assignment: AsgF9qR3nK8wT5mP2yB7
-- =========================================================
(
  'RefF9qR3nK8wT5mP2b1',
  'AsgF9qR3nK8wT5mP2yB7',
  NULL,
  'assignment',
  'CSS Flexbox Guide',
  'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout'
),
(
  'RefF9qR3nK8wT5mP2b3',
  'AsgF9qR3nK8wT5mP2yB7',
  NULL,
  'assignment',
  'Responsive Web Design',
  'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design'
),

-- =========================================================
-- User Persona Creation
-- Assignment: AsgU6vN2xK9pL4rW8yC5
-- =========================================================
(
  'RefU6vN2xK9pL4rW8a1',
  'AsgU6vN2xK9pL4rW8yC5',
  NULL,
  'assignment',
  'Introduction to User Personas',
  'https://www.nngroup.com/articles/persona/'
),
(
  'RefU6vN2xK9pL4rW8a3',
  'AsgU6vN2xK9pL4rW8yC5',
  NULL,
  'assignment',
  'User Research Fundamentals',
  'https://www.usability.gov/how-to-and-tools/methods/user-research.html'
),

-- =========================================================
-- Mobile App Wireframe
-- Assignment: AsgU7mP4qL8xR2nW5yD9
-- =========================================================
(
  'RefU7mP4qL8xR2nW5a1',
  'AsgU7mP4qL8xR2nW5yD9',
  NULL,
  'assignment',
  'Wireframing Basics',
  'https://www.nngroup.com/articles/wireframes/'
),
(
  'RefU7mP4qL8xR2nW5a2',
  'AsgU7mP4qL8xR2nW5yD9',
  NULL,
  'assignment',
  'Information Architecture',
  'https://www.nngroup.com/articles/definition-information-architecture/'
),
(
  'RefU7mP4qL8xR2nW5a3',
  'AsgU7mP4qL8xR2nW5yD9',
  NULL,
  'assignment',
  'Mobile UX Design',
  'https://www.nngroup.com/articles/mobile-ux/'
),

-- =========================================================
-- Create a Mini Design System
-- Assignment: AsgU8kR3nT6qW2mP5xY7
-- =========================================================
(
  'RefU8kR3nT6qW2mP5a1',
  'AsgU8kR3nT6qW2mP5xY7',
  NULL,
  'assignment',
  'Design Systems Introduction',
  'https://www.nngroup.com/articles/design-systems-101/'
),
(
  'RefU8kR3nT6qW2mP5a2',
  'AsgU8kR3nT6qW2mP5xY7',
  NULL,
  'assignment',
  'Typography in UI Design',
  'https://www.nngroup.com/articles/typography-terms/'
),
(
  'RefU8kR3nT6qW2mP5a3',
  'AsgU8kR3nT6qW2mP5xY7',
  NULL,
  'assignment',
  'UI Design Components',
  'https://m3.material.io/components'
);

INSERT INTO quizzes (
  id,
  batch_id,
  created_by,
  quiz_creation_method,
  title,
  description,
  duration_minutes,
  total_marks,
  quiz_status,
  published_date
) VALUES
(
  'QzF8kP2mL7xQ4vN9yA1',
  'BatF8kP2mL7xQ4vN9yA1',
  'K4nP8xQ2vL7mR5tY9cWzA',
  'manual',
  'Frontend Fundamentals Quiz',
  'Assessment covering HTML, semantic markup, CSS fundamentals, responsive design, and JavaScript basics.',
  30,
  20,
  'published',
  '2025-04-10'
),
(
  'QzU6vN2xK9pL4rW8yC5',
  'BatU6vN2xK9pL4rW8yC5',
  'Z6rT3mN8qW2xK9pL5vYcH',
  'manual',
  'UX Research and Design Fundamentals Quiz',
  'Assessment covering UX research, user personas, user journeys, information architecture, and wireframing fundamentals.',
  30,
  20,
  'published',
  '2025-04-15'
);

INSERT INTO quiz_questions (
  id,
  quiz_id,
  quiz_question_type,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  quiz_option,
  marks,
  order_index
) VALUES

-- =========================================================
-- QUIZ 1
-- Frontend Fundamentals Quiz
-- Quiz ID: QzF8kP2mL7xQ4vN9yA1
-- =========================================================

(
  'QqF8kP2mL7xQ4vN9a1',
  'QzF8kP2mL7xQ4vN9yA1',
  'mcq',
  'Which HTML element is used to define the main content of a webpage?',
  'main',
  'section',
  'article',
  'content',
  'a',
  2,
  0
),
(
  'QqF8kP2mL7xQ4vN9a2',
  'QzF8kP2mL7xQ4vN9yA1',
  'mcq',
  'Which CSS property is primarily used to create space inside an element?',
  'margin',
  'padding',
  'border',
  'gap',
  'b',
  2,
  1
),
(
  'QqF8kP2mL7xQ4vN9a3',
  'QzF8kP2mL7xQ4vN9yA1',
  'boolean',
  'CSS Grid can be used to create two-dimensional layouts.',
  'True',
  'False',
  NULL,
  NULL,
  'a',
  2,
  2
),
(
  'QqF8kP2mL7xQ4vN9a4',
  'QzF8kP2mL7xQ4vN9yA1',
  'mcq',
  'Which CSS layout system is specifically designed for one-dimensional layouts?',
  'CSS Grid',
  'Flexbox',
  'Position',
  'Float',
  'b',
  2,
  3
),
(
  'QqF8kP2mL7xQ4vN9a5',
  'QzF8kP2mL7xQ4vN9yA1',
  'mcq',
  'Which JavaScript keyword declares a block-scoped variable that can be reassigned?',
  'var',
  'const',
  'let',
  'static',
  'c',
  2,
  4
),
(
  'QqF8kP2mL7xQ4vN9a6',
  'QzF8kP2mL7xQ4vN9yA1',
  'boolean',
  'The HTML alt attribute can provide alternative text for an image.',
  'True',
  'False',
  NULL,
  NULL,
  'a',
  2,
  5
),
(
  'QqF8kP2mL7xQ4vN9a7',
  'QzF8kP2mL7xQ4vN9yA1',
  'mcq',
  'Which CSS property changes the text color of an element?',
  'font-color',
  'text-color',
  'color',
  'foreground',
  'c',
  2,
  6
),
(
  'QqF8kP2mL7xQ4vN9a8',
  'QzF8kP2mL7xQ4vN9yA1',
  'mcq',
  'Which JavaScript method adds an item to the end of an array?',
  'pop()',
  'push()',
  'shift()',
  'add()',
  'b',
  2,
  7
),
(
  'QqF8kP2mL7xQ4vN9a9',
  'QzF8kP2mL7xQ4vN9yA1',
  'boolean',
  'Responsive web design allows a website layout to adapt to different screen sizes.',
  'True',
  'False',
  NULL,
  NULL,
  'a',
  2,
  8
),
(
  'QqF8kP2mL7xQ4vN9b0',
  'QzF8kP2mL7xQ4vN9yA1',
  'mcq',
  'Which HTML element is most appropriate for the primary navigation links of a website?',
  'nav',
  'links',
  'menu',
  'navigation',
  'a',
  2,
  9
),

-- =========================================================
-- QUIZ 2
-- UX Research and Design Fundamentals Quiz
-- Quiz ID: QzU6vN2xK9pL4rW8yC5
-- =========================================================

(
  'QqU6vN2xK9pL4rW8a1',
  'QzU6vN2xK9pL4rW8yC5',
  'mcq',
  'What is the primary purpose of UX research?',
  'To choose programming languages',
  'To understand users and their needs',
  'To create database schemas',
  'To increase server performance',
  'b',
  2,
  0
),
(
  'QqU6vN2xK9pL4rW8a2',
  'QzU6vN2xK9pL4rW8yC5',
  'mcq',
  'What is a user persona?',
  'A fictional representation based on research about a target user',
  'A project manager',
  'A visual design template',
  'A database record',
  'a',
  2,
  1
),
(
  'QqU6vN2xK9pL4rW8a3',
  'QzU6vN2xK9pL4rW8yC5',
  'boolean',
  'User interviews can be used as a UX research method.',
  'True',
  'False',
  NULL,
  NULL,
  'a',
  2,
  2
),
(
  'QqU6vN2xK9pL4rW8a4',
  'QzU6vN2xK9pL4rW8yC5',
  'mcq',
  'What does a user journey map primarily describe?',
  'The database structure of an application',
  'The steps and experiences a user has while completing a task',
  'The source code of an application',
  'The visual color palette',
  'b',
  2,
  3
),
(
  'QqU6vN2xK9pL4rW8a5',
  'QzU6vN2xK9pL4rW8yC5',
  'mcq',
  'What is the main purpose of a wireframe?',
  'To define the final brand colors',
  'To show the basic structure and layout of an interface',
  'To write application code',
  'To create database relationships',
  'b',
  2,
  4
),
(
  'QqU6vN2xK9pL4rW8a6',
  'QzU6vN2xK9pL4rW8yC5',
  'boolean',
  'Low-fidelity wireframes usually focus more on structure than visual details.',
  'True',
  'False',
  NULL,
  NULL,
  'a',
  2,
  5
),
(
  'QqU6vN2xK9pL4rW8a7',
  'QzU6vN2xK9pL4rW8yC5',
  'mcq',
  'Which activity helps designers understand how users organize and navigate information?',
  'Information architecture',
  'Unit testing',
  'Database normalization',
  'Server monitoring',
  'a',
  2,
  6
),
(
  'QqU6vN2xK9pL4rW8a8',
  'QzU6vN2xK9pL4rW8yC5',
  'mcq',
  'Which research method involves watching users perform tasks with a product?',
  'Observation',
  'Color testing',
  'Code review',
  'Database analysis',
  'a',
  2,
  7
),
(
  'QqU6vN2xK9pL4rW8a9',
  'QzU6vN2xK9pL4rW8yC5',
  'boolean',
  'A prototype can be used to test an interface before the final product is developed.',
  'True',
  'False',
  NULL,
  NULL,
  'a',
  2,
  8
),
(
  'QqU6vN2xK9pL4rW8b0',
  'QzU6vN2xK9pL4rW8yC5',
  'mcq',
  'Which principle is most important when designing a user-friendly interface?',
  'Consistency',
  'Complexity',
  'Hidden navigation',
  'Unpredictable interactions',
  'a',
  2,
  9
);