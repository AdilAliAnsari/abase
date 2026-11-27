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
  uploadedAt?: string;
  createdAt?: string;
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
  'Dept. of Computer Science & Engineering',
];

export const pdfCategories = [
  'All',
  'CSE 2022 Scheme',
  '5th & 6th Sem',
  'Theory of Computation',
];

export const mockPDFs: PDFItem[] = [
  {
    id: 'pdf-bcs501-mod3',
    title: 'Theory of Computation (BCS501) — Module 3: Context Free Grammars & Pushdown Automata',
    subjectCode: 'BCS501',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    lecturer: {
      name: 'Dept. of CSE Faculty',
      title: 'Associate Professor & VTU Subject Expert',
      department: 'Dept. of Computer Science & Engineering',
      institution: 'VTU Affiliated Engineering Institution',
      rating: 5.0,
      verified: true,
      totalNotesSold: 1250,
    },
    materialType: 'Module Notes',
    author: 'Dept. of Computer Science & Engineering',
    category: 'CSE 2022 Scheme',
    fileSize: '1.87 MB',
    pageCount: 48,
    pdfUrl: '/pdfs/CSE/5th_Sem/BCS501_Module_3_Context_Free_Grammars.pdf',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&h=700&fit=crop',
    description: 'VTU 2022 Scheme BCS501 Module 3 complete handwritten notes covering Context-Free Grammars, Derivation Trees, Ambiguity, Pushdown Automata (PDA), and Equivalence of CFG and PDA.',
    rating: 5.0,
    reviewsCount: 340,
    downloadsCount: 4210,
    tags: ['BCS501', 'Theory of Computation', 'Context Free Grammars', 'PDA', '2022 Scheme', 'CSE 5th Sem'],
    badge: 'ESSENTIAL',
    publishedYear: '2024',
  },
  {
    id: 'pdf-bcs501-mod4',
    title: 'Theory of Computation (BCS501) — Module 4: Normal Forms (CNF, GNF) & Pumping Lemma',
    subjectCode: 'BCS501',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    lecturer: {
      name: 'Dept. of CSE Faculty',
      title: 'Associate Professor & VTU Subject Expert',
      department: 'Dept. of Computer Science & Engineering',
      institution: 'VTU Affiliated Engineering Institution',
      rating: 5.0,
      verified: true,
      totalNotesSold: 980,
    },
    materialType: 'Module Notes',
    author: 'Dept. of Computer Science & Engineering',
    category: 'CSE 2022 Scheme',
    fileSize: '1.02 MB',
    pageCount: 32,
    pdfUrl: '/pdfs/CSE/5th_Sem/BCS501_Module_4_Normal_Forms.pdf',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=700&fit=crop',
    description: 'VTU 2022 Scheme BCS501 Module 4 notes detailing Chomsky Normal Form (CNF), Greibach Normal Form (GNF), Simplification of CFGs, and Pumping Lemma for Context-Free Languages with exam proofs.',
    rating: 4.9,
    reviewsCount: 290,
    downloadsCount: 3670,
    tags: ['BCS501', 'CNF', 'GNF', 'Normal Forms', 'Pumping Lemma', '2022 Scheme', 'CSE 5th Sem'],
    badge: 'TOP RATED',
    publishedYear: '2024',
  },
  {
    id: 'pdf-bcs501-mod5',
    title: 'Theory of Computation (BCS501) — Module 5: Turing Machines, Decidability & Halting Problem',
    subjectCode: 'BCS501',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    lecturer: {
      name: 'Dept. of CSE Faculty',
      title: 'Associate Professor & VTU Subject Expert',
      department: 'Dept. of Computer Science & Engineering',
      institution: 'VTU Affiliated Engineering Institution',
      rating: 5.0,
      verified: true,
      totalNotesSold: 1420,
    },
    materialType: 'Module Notes',
    author: 'Dept. of Computer Science & Engineering',
    category: '5th & 6th Sem',
    fileSize: '1.94 MB',
    pageCount: 56,
    pdfUrl: '/pdfs/CSE/5th_Sem/BCS501_Module_5_Turing_Machine.pdf',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&h=700&fit=crop',
    description: 'VTU 2022 Scheme BCS501 Module 5 comprehensive guide on Turing Machine models, Instantaneous Descriptions, Variations of TM, Decidability, Undecidability, and the Halting Problem.',
    rating: 5.0,
    reviewsCount: 412,
    downloadsCount: 5120,
    tags: ['BCS501', 'Turing Machine', 'Decidability', 'Halting Problem', 'Undecidability', 'CSE 5th Sem'],
    badge: 'FEATURED',
    publishedYear: '2024',
  },
];
