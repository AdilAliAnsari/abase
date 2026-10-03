export interface VideoInstructor {
  name: string;
  title: string;
  department: string;
  institution: string;
  verified: boolean;
  avatar?: string;
  totalStudents?: number;
}

export interface VideoItem {
  id: string;
  title: string;
  subjectCode: string;
  scheme: '2022 Scheme' | '2021 Scheme' | '2018 Scheme';
  branch: 'CSE' | 'ISE' | 'AIML' | 'ECE' | 'ME' | 'Civil' | 'Common';
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  semester: number;
  university: 'VTU' | 'Autonomous';
  instructor: VideoInstructor;
  duration: string;
  durationSeconds: number;
  videoUrl: string;
  thumbnail: string;
  viewsCount: number;
  rating: number;
  reviewsCount: number;
  quality: '4K UHD' | '1080p FHD' | '720p HD';
  category: string;
  description: string;
  topics: string[];
  badge?: 'TRENDING' | 'VTU MUST WATCH' | 'CRASH COURSE' | 'LAB DEMO' | 'NEW' | 'TOP RATED';
  publishedDate: string;
  fileSize: string;
}

export const videoSchemes = ['All Schemes', '2022 Scheme', '2021 Scheme', '2018 Scheme'] as const;

export const videoBranches = [
  'All Branches',
  'CSE',
  'ISE',
  'AIML',
  'ECE',
  'ME',
  'Civil',
] as const;

export const videoSemesters = [
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

export const videoCategories = [
  'All',
  'CSE 2022 Scheme',
  'Data Structures & Algo',
  'Operating Systems & SysDesign',
  'Full-Stack Web Dev',
  'AIML Masterclass',
  'VTU Lab Demos',
];

export const sampleInstructors = [
  'All Lecturers',
  'Prof. Ramesh Kumar',
  'Dr. Ananya Sharma',
  'Prof. S. N. Murthy',
  'Dr. Priya Venkatesh',
  'Prof. Karthik Rao',
  'Dr. Meenakshi Sundaram',
];

export const mockVideos: VideoItem[] = [
  {
    id: 'vid-vtu-1',
    title: 'Data Structures & Applications (BCS304) — Complete Module 1 to 5 Video Masterclass',
    subjectCode: 'BCS304',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '2nd Year',
    semester: 3,
    university: 'VTU',
    instructor: {
      name: 'Prof. Ramesh Kumar',
      title: 'Associate Professor & VTU Subject Expert',
      department: 'Dept. of Computer Science & Engg.',
      institution: 'R.V. College of Engineering (VTU)',
      verified: true,
      totalStudents: 48200,
    },
    duration: '48:30',
    durationSeconds: 2910,
    // Reliable high-bandwidth open mp4 video stream
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
    viewsCount: 42800,
    rating: 4.9,
    reviewsCount: 3240,
    quality: '1080p FHD',
    category: 'Data Structures & Algo',
    description: 'Complete high-yield video lectures covering Stacks, Queues, Linked Lists, Trees (AVL, Binary Search Trees), Graphs, and Hashing with live visual animations and VTU exam problem solving.',
    topics: ['Stacks & Queues', 'Linked Lists', 'AVL Trees', 'Graph Traversal BFS/DFS', 'Hashing'],
    badge: 'VTU MUST WATCH',
    publishedDate: '2024',
    fileSize: '320 MB',
  },
  {
    id: 'vid-vtu-2',
    title: 'Database Management Systems (BCS501) — ER Models, Normalization & SQL Queries',
    subjectCode: 'BCS501',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    instructor: {
      name: 'Dr. Ananya Sharma',
      title: 'Professor & HOD, Database Systems',
      department: 'Dept. of CSE & ISE',
      institution: 'BMS College of Engineering (VTU)',
      verified: true,
      totalStudents: 38900,
    },
    duration: '54:15',
    durationSeconds: 3255,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&h=400&fit=crop',
    viewsCount: 36400,
    rating: 4.9,
    reviewsCount: 2810,
    quality: '1080p FHD',
    category: 'CSE 2022 Scheme',
    description: 'Master Relational Algebra, SQL joins, subqueries, 1NF to BCNF normalization algorithms, and ACID transaction concurrency control for VTU examinations.',
    topics: ['ER Diagrams', 'Relational Algebra', 'SQL Queries', '1NF-BCNF Normalization', 'ACID Transactions'],
    badge: 'TOP RATED',
    publishedDate: '2024',
    fileSize: '410 MB',
  },
  {
    id: 'vid-vtu-3',
    title: 'Operating Systems (BCS402) — Process Scheduling & Deadlock Bankers Algorithm',
    subjectCode: 'BCS402',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '2nd Year',
    semester: 4,
    university: 'VTU',
    instructor: {
      name: 'Prof. S. N. Murthy',
      title: 'Senior Faculty & Systems Lab In-Charge',
      department: 'Dept. of CSE',
      institution: 'PES Institute of Technology (VTU)',
      verified: true,
      totalStudents: 29400,
    },
    duration: '42:10',
    durationSeconds: 2530,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&h=400&fit=crop',
    viewsCount: 28900,
    rating: 4.8,
    reviewsCount: 1940,
    quality: '1080p FHD',
    category: 'Operating Systems & SysDesign',
    description: 'Step-by-step visual breakdown of FCFS, SJF, Round Robin, Priority CPU scheduling, Bankers Safety Algorithm, and Page Replacement Algorithms (FIFO, LRU).',
    topics: ['Process Synchronization', 'CPU Scheduling', 'Bankers Algorithm', 'Paging & Virtual Memory'],
    badge: 'CRASH COURSE',
    publishedDate: '2024',
    fileSize: '290 MB',
  },
  {
    id: 'vid-vtu-4',
    title: 'Machine Learning & AI (BAI502) — Neural Networks, Decision Trees & SVM Math',
    subjectCode: 'BAI502',
    scheme: '2022 Scheme',
    branch: 'AIML',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    instructor: {
      name: 'Dr. Priya Venkatesh',
      title: 'VTU Gold Medalist & Assoc. Professor AI',
      department: 'Dept. of AI & Machine Learning',
      institution: 'MSRIT Ramaiah Institute (VTU)',
      verified: true,
      totalStudents: 52100,
    },
    duration: '1:08:45',
    durationSeconds: 4125,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop',
    viewsCount: 51200,
    rating: 5.0,
    reviewsCount: 4620,
    quality: '4K UHD',
    category: 'AIML Masterclass',
    description: 'In-depth conceptual math and Python implementation of Heuristic Search (A*, AO*), Multi-Layer Perceptron backpropagation, ID3 Decision Trees, Support Vector Machines, and Naive Bayes.',
    topics: ['A* Search Algorithm', 'Neural Networks', 'Decision Trees ID3', 'SVM Kernels', 'Naive Bayes'],
    badge: 'TRENDING',
    publishedDate: '2024',
    fileSize: '650 MB',
  },
  {
    id: 'vid-vtu-5',
    title: 'Computer Networks Lab Demonstration (BCSL504) — Wireshark & Packet Tracer',
    subjectCode: 'BCSL504',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 5,
    university: 'VTU',
    instructor: {
      name: 'Prof. Karthik Rao',
      title: 'Networks Lab Coordinator',
      department: 'Dept. of CSE & ISE',
      institution: 'Siddaganga Institute of Technology (VTU)',
      verified: true,
      totalStudents: 21500,
    },
    duration: '35:20',
    durationSeconds: 2120,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    viewsCount: 22100,
    rating: 4.8,
    reviewsCount: 1450,
    quality: '1080p FHD',
    category: 'VTU Lab Demos',
    description: 'Complete hands-on demonstration of all VTU 2022 Scheme CN lab programs: Socket programming in C/Java, CRC error detection, Bellman-Ford routing, and Wireshark packet capture.',
    topics: ['CRC Error Check', 'Socket Programming', 'Bellman Ford', 'Wireshark Packet Analysis'],
    badge: 'LAB DEMO',
    publishedDate: '2024',
    fileSize: '240 MB',
  },
  {
    id: 'vid-vtu-6',
    title: 'Full Stack Development (BCS601) — React 19 & Node.js Mini Project Complete Build',
    subjectCode: 'BCS601',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 6,
    university: 'VTU',
    instructor: {
      name: 'Prof. Karthik Rao',
      title: 'Associate Professor & Full Stack Lead',
      department: 'Dept. of CSE',
      institution: 'Nitte Meenakshi Institute of Technology (VTU)',
      verified: true,
      totalStudents: 34100,
    },
    duration: '1:15:30',
    durationSeconds: 4530,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    viewsCount: 31800,
    rating: 4.9,
    reviewsCount: 2750,
    quality: '1080p FHD',
    category: 'Full-Stack Web Dev',
    description: 'Build an end-to-end full stack web application for your VTU mini-project using React 19, TypeScript, TailwindCSS, Express REST APIs, and MongoDB Atlas with user auth and deployment.',
    topics: ['React Components & Hooks', 'REST API Design', 'MongoDB Atlas', 'JWT Authentication', 'Vercel Deployment'],
    badge: 'NEW',
    publishedDate: '2024',
    fileSize: '780 MB',
  },
];
