export interface LecturerSeller {
  name: string;
  title: string;
  department: string;
  institution: string;
  rating: number;
  verified: boolean;
  totalNotesSold?: number;
}

export interface PDFItem {
  id: string;
  title: string;
  subjectCode: string;
  scheme: '2022 Scheme' | '2021 Scheme' | '2018 Scheme';
  branch: 'CSE' | 'ISE' | 'AIML' | 'ECE' | 'ME' | 'Civil' | 'EEE' | 'Common';
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  semester: number; // 1 to 8
  university: 'VTU' | 'Autonomous';
  lecturer: LecturerSeller;
  materialType: 'Module Notes' | 'Solved Question Bank' | 'Model Papers (MQP)' | 'Lab Manual' | 'Formula Sheet';
  author: string; // display author / lecturer name
  category: string;
  fileSize: string;
  pageCount: number;
  pdfUrl: string;
  driveFileId?: string;
  coverImage: string;
  description: string;
  rating: number;
  reviewsCount: number;
  downloadsCount: number;
  tags: string[];
  badge?: 'FEATURED' | 'POPULAR' | 'NEW' | 'ESSENTIAL' | 'TOP RATED' | 'EXAM READY';
  publishedYear: string;
  isFavorite?: boolean;
}

export const schemes = ['All Schemes', '2022 Scheme', '2021 Scheme', '2018 Scheme'] as const;

export const branches = [
  'All Branches',
  'CSE',
  'ISE',
  'AIML',
  'ECE',
  'ME',
  'Civil',
  'EEE',
] as const;

export const semesters = [
  'All Semesters',
  'Sem 1',
  'Sem 2',
  'Sem 3',
  'Sem 4',
  'Sem 5',
  'Sem 6',
  'Sem 7',
  'Sem 8',
] as const;

export const materialTypes = [
  'All Materials',
  'Module Notes',
  'Solved Question Bank',
  'Model Papers (MQP)',
  'Lab Manual',
  'Formula Sheet',
] as const;

export const sampleLecturers = [
  'All Lecturers',
  'Prof. Ramesh Kumar',
  'Dr. Ananya Sharma',
  'Prof. S. N. Murthy',
  'Dr. Priya Venkatesh',
  'Prof. Karthik Rao',
  'Dr. Meenakshi Sundaram',
];

export const pdfCategories = [
  'All',
  'CSE 2022 Scheme',
  '3rd & 4th Sem',
  '5th & 6th Sem',
  'Solved Papers',
  'Lab Manuals',
  'AIML & Data',
];

export const mockPDFs: PDFItem[] = [
  {
    id: 'vtu-cse-1',
    title: 'Data Structures & Applications (BCS304) — Modules 1 to 5 Handwritten Notes',
    subjectCode: 'BCS304',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '2nd Year',
    semester: 3,
    university: 'VTU',
    lecturer: {
      name: 'Prof. Ramesh Kumar',
      title: 'Associate Professor & VTU Question Paper Setter',
      department: 'Dept. of Computer Science & Engg.',
      institution: 'R.V. College of Engineering (VTU)',
      rating: 4.9,
      verified: true,
      totalNotesSold: 2840,
    },
    materialType: 'Module Notes',
    author: 'Prof. Ramesh Kumar',
    category: 'CSE 2022 Scheme',
    fileSize: '6.4 MB',
    pageCount: 168,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=700&fit=crop',
    description: 'Complete VTU 2022 Scheme notes for BCS304 covering Stacks, Queues, Linked Lists, Trees, Graphs, and Hashing with exam-focused algorithms and diagrams.',
    rating: 4.9,
    reviewsCount: 1420,
    downloadsCount: 18450,
    tags: ['BCS304', '2022 Scheme', 'Data Structures', 'CSE 3rd Sem', 'VTU Notes', 'Trees & Graphs'],
    badge: 'TOP RATED',
    publishedYear: '2024',
  },
  {
    id: 'vtu-cse-2',
    title: 'Database Management Systems (BCS501) — Comprehensive Notes & Solved Queries',
    subjectCode: 'BCS501',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    lecturer: {
      name: 'Dr. Ananya Sharma',
      title: 'Professor & HOD, Database Systems',
      department: 'Dept. of CSE & ISE',
      institution: 'BMS College of Engineering (VTU)',
      rating: 4.9,
      verified: true,
      totalNotesSold: 3410,
    },
    materialType: 'Module Notes',
    author: 'Dr. Ananya Sharma',
    category: '5th & 6th Sem',
    fileSize: '8.2 MB',
    pageCount: 220,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&h=700&fit=crop',
    description: 'In-depth ER Modeling, Relational Algebra, SQL, Normalization (1NF to BCNF), and Transaction Management tailored for 2022 Scheme examinations.',
    rating: 4.9,
    reviewsCount: 2150,
    downloadsCount: 24300,
    tags: ['BCS501', 'DBMS', '2022 Scheme', 'CSE 5th Sem', 'SQL', 'Normalization'],
    badge: 'FEATURED',
    publishedYear: '2024',
  },
  {
    id: 'vtu-cse-3',
    title: 'Operating Systems (BCS402) — Solved Question Bank & Last 5 Years Solutions',
    subjectCode: 'BCS402',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '2nd Year',
    semester: 4,
    university: 'VTU',
    lecturer: {
      name: 'Prof. S. N. Murthy',
      title: 'Senior Faculty & Systems Lab In-Charge',
      department: 'Dept. of CSE',
      institution: 'PES Institute of Technology (VTU)',
      rating: 4.8,
      verified: true,
      totalNotesSold: 1980,
    },
    materialType: 'Solved Question Bank',
    author: 'Prof. S. N. Murthy',
    category: 'Solved Papers',
    fileSize: '5.1 MB',
    pageCount: 142,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500&h=700&fit=crop',
    description: 'Solved VTU model question papers and previous semester exams with step-by-step CPU scheduling algorithms, Deadlock Bankers algorithms & Memory paging solutions.',
    rating: 4.8,
    reviewsCount: 980,
    downloadsCount: 12600,
    tags: ['BCS402', 'Operating Systems', '2022 Scheme', 'CSE 4th Sem', 'Solved QB', 'Bankers Algorithm'],
    badge: 'EXAM READY',
    publishedYear: '2024',
  },
  {
    id: 'vtu-aiml-1',
    title: 'Artificial Intelligence & Machine Learning (BAI502) — Module 1-5 Quick Revision Kit',
    subjectCode: 'BAI502',
    scheme: '2022 Scheme',
    branch: 'AIML',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    lecturer: {
      name: 'Dr. Priya Venkatesh',
      title: 'VTU Gold Medalist & Assoc. Professor AI',
      department: 'Dept. of AI & Machine Learning',
      institution: 'MSRIT Ramaiah Institute (VTU)',
      rating: 5.0,
      verified: true,
      totalNotesSold: 4120,
    },
    materialType: 'Formula Sheet',
    author: 'Dr. Priya Venkatesh',
    category: 'AIML & Data',
    fileSize: '4.7 MB',
    pageCount: 96,
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=700&fit=crop',
    description: 'High-yield revision notes covering Search Algorithms (A*, Heuristic, Minimax), Neural Networks, Decision Trees, SVM, and Bayesian Classifiers.',
    rating: 5.0,
    reviewsCount: 3840,
    downloadsCount: 31200,
    tags: ['BAI502', 'AIML', '2022 Scheme', '5th Sem', 'Heuristic Search', 'Machine Learning'],
    badge: 'POPULAR',
    publishedYear: '2024',
  },
  {
    id: 'vtu-cse-4',
    title: 'Computer Networks Lab Manual with Wireshark & Cisco Packet Tracer (BCSL504)',
    subjectCode: 'BCSL504',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    lecturer: {
      name: 'Prof. Karthik Rao',
      title: 'Networks Lab Coordinator',
      department: 'Dept. of CSE & ISE',
      institution: 'Siddaganga Institute of Technology (VTU)',
      rating: 4.8,
      verified: true,
      totalNotesSold: 1540,
    },
    materialType: 'Lab Manual',
    author: 'Prof. Karthik Rao',
    category: 'Lab Manuals',
    fileSize: '3.9 MB',
    pageCount: 84,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=700&fit=crop',
    description: 'Step-by-step Part A & Part B VTU lab programs with output screenshots, socket programming in C/Java, and NS2 / Packet Tracer routing simulations.',
    rating: 4.8,
    reviewsCount: 760,
    downloadsCount: 9400,
    tags: ['BCSL504', 'CN Lab', '2022 Scheme', 'Wireshark', 'Packet Tracer', 'CSE 5th Sem'],
    badge: 'NEW',
    publishedYear: '2024',
  },
  {
    id: 'vtu-ise-1',
    title: 'Design and Analysis of Algorithms (BCS401) — 2022 Scheme Model Question Papers',
    subjectCode: 'BCS401',
    scheme: '2022 Scheme',
    branch: 'ISE',
    year: '2nd Year',
    semester: 4,
    university: 'VTU',
    lecturer: {
      name: 'Dr. Meenakshi Sundaram',
      title: 'Professor & Algorithms Researcher',
      department: 'Dept. of Information Science & Engg.',
      institution: 'JSS Academy of Technical Education (VTU)',
      rating: 4.9,
      verified: true,
      totalNotesSold: 2260,
    },
    materialType: 'Model Papers (MQP)',
    author: 'Dr. Meenakshi Sundaram',
    category: '3rd & 4th Sem',
    fileSize: '5.6 MB',
    pageCount: 110,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=700&fit=crop',
    description: 'VTU Model Question Papers (Set 1 & Set 2) fully solved with asymptotic notation proofs, Dynamic Programming knapsack, Greedy methods, and Backtracking.',
    rating: 4.9,
    reviewsCount: 1180,
    downloadsCount: 14800,
    tags: ['BCS401', 'DAA', '2022 Scheme', 'ISE', 'CSE 4th Sem', 'Dynamic Programming', 'MQP'],
    badge: 'ESSENTIAL',
    publishedYear: '2024',
  },
  {
    id: 'vtu-ece-1',
    title: 'Digital Signal Processing (BEC502) — 2021 Scheme Master Formula & Module Guide',
    subjectCode: 'BEC502',
    scheme: '2021 Scheme',
    branch: 'ECE',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    lecturer: {
      name: 'Prof. Ramesh Kumar',
      title: 'Senior Faculty & Signal Processing Expert',
      department: 'Dept. of Electronics & Communication',
      institution: 'Dayananda Sagar College of Engg. (VTU)',
      rating: 4.7,
      verified: true,
      totalNotesSold: 1890,
    },
    materialType: 'Module Notes',
    author: 'Prof. Ramesh Kumar',
    category: '5th & 6th Sem',
    fileSize: '7.4 MB',
    pageCount: 188,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&h=700&fit=crop',
    description: 'DFT, FFT algorithms, IIR and FIR Filter design using Butterworth & Chebyshev transformations with MATLAB code snippets for VTU ECE students.',
    rating: 4.7,
    reviewsCount: 890,
    downloadsCount: 8900,
    tags: ['BEC502', 'DSP', '2021 Scheme', 'ECE 5th Sem', 'FFT', 'Filter Design'],
    badge: 'EXAM READY',
    publishedYear: '2023',
  },
  {
    id: 'vtu-cse-5',
    title: 'Full Stack Development (BCS601) — 2018 / 2021 Scheme Complete Project Notes',
    subjectCode: 'BCS601',
    scheme: '2021 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 6,
    university: 'VTU',
    lecturer: {
      name: 'Prof. Karthik Rao',
      title: 'Associate Professor & Full Stack Lead',
      department: 'Dept. of CSE',
      institution: 'Nitte Meenakshi Institute of Technology (VTU)',
      rating: 4.9,
      verified: true,
      totalNotesSold: 2750,
    },
    materialType: 'Module Notes',
    author: 'Prof. Karthik Rao',
    category: '5th & 6th Sem',
    fileSize: '9.1 MB',
    pageCount: 240,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=700&fit=crop',
    description: 'Comprehensive React, Node.js, Express, MongoDB architecture notes with lab exercises, API design, and VTU mini-project guidance.',
    rating: 4.9,
    reviewsCount: 1640,
    downloadsCount: 20100,
    tags: ['BCS601', 'FSD', '2021 Scheme', 'React', 'NodeJS', 'CSE 6th Sem'],
    badge: 'NEW',
    publishedYear: '2024',
  },
];
