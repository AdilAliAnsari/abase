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
  'Software Testing Lab',
  'VTU Lab Demos',
];

export const sampleInstructors = [
  'All Lecturers',
  'Dept. of CSE, RIT Hassan',
];

export const mockVideos: VideoItem[] = [
  {
    id: 'vid-tosca-8',
    title: 'TOSCA BISL657A Experiment 8 — Dept. of CSE, RIT Hassan',
    subjectCode: 'BISL657A',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 6,
    university: 'VTU',
    instructor: {
      name: 'Dept. of CSE, RIT Hassan',
      title: 'Senior Laboratory Faculty & Subject Expert',
      department: 'Dept. of Computer Science & Engineering',
      institution: 'Rajeev Institute of Technology, Hassan (VTU)',
      verified: true,
      totalStudents: 18500,
    },
    duration: '10:11',
    durationSeconds: 611,
    videoUrl: '/videos/tosca-bisl657a-experiment-8.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
    viewsCount: 15400,
    rating: 5.0,
    reviewsCount: 1280,
    quality: '720p HD',
    category: 'Software Testing Lab',
    description: 'TOSCA Automated Software Testing (BISL657A) Experiment 8 step-by-step practical laboratory demonstration by Dept. of CSE, Rajeev Institute of Technology, Hassan (VTU).',
    topics: ['TOSCA Test Automation', 'BISL657A Experiment 8', 'Test Case Design', 'Execution Lists', 'VTU Lab Practical'],
    badge: 'LAB DEMO',
    publishedDate: '2024',
    fileSize: '17 MB',
  },
  {
    id: 'vid-tosca-11',
    title: 'TOSCA BISL657A Experiment 11 — Dept. of CSE, RIT Hassan',
    subjectCode: 'BISL657A',
    scheme: '2022 Scheme',
    branch: 'CSE',
    year: '3rd Year',
    semester: 6,
    university: 'VTU',
    instructor: {
      name: 'Dept. of CSE, RIT Hassan',
      title: 'Senior Laboratory Faculty & Subject Expert',
      department: 'Dept. of Computer Science & Engineering',
      institution: 'Rajeev Institute of Technology, Hassan (VTU)',
      verified: true,
      totalStudents: 18500,
    },
    duration: '13:19',
    durationSeconds: 799,
    videoUrl: '/videos/tosca-bisl657a-experiment-11.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
    viewsCount: 18900,
    rating: 5.0,
    reviewsCount: 1560,
    quality: '1080p FHD',
    category: 'Software Testing Lab',
    description: 'TOSCA Automated Software Testing (BISL657A) Experiment 11 comprehensive hands-on lab demonstration by Dept. of CSE, Rajeev Institute of Technology, Hassan (VTU).',
    topics: ['TOSCA Test Automation', 'BISL657A Experiment 11', 'Module Scanning', 'Automated Verification', 'VTU Lab Practical'],
    badge: 'LAB DEMO',
    publishedDate: '2024',
    fileSize: '40 MB',
  },
];
