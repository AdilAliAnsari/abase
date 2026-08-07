export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  coverImage: string;
  category: string;
  description: string;
  pages: number;
  publisher: string;
  language: string;
  badge?: string;
  accent: 'orange' | 'blue' | 'purple' | 'teal';
}

export const categories = [
  'All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 
  'Business', 'Self-Help', 'Design', 'Technology'
];

export const books: Book[] = [
  {
    id: '1',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    price: 24.99,
    originalPrice: 32.00,
    rating: 4.8,
    reviews: 2847,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    category: 'Design',
    description: 'The ultimate guide to human-centered design. Learn how psychology shapes the objects we use every day.',
    pages: 368,
    publisher: 'Basic Books',
    language: 'English',
    badge: 'BESTSELLER',
    accent: 'orange',
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 19.99,
    rating: 4.9,
    reviews: 15234,
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    category: 'Self-Help',
    description: 'Tiny changes, remarkable results. An easy & proven way to build good habits & break bad ones.',
    pages: 320,
    publisher: 'Avery',
    language: 'English',
    badge: 'BESTSELLER',
    accent: 'blue',
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    price: 18.99,
    originalPrice: 25.99,
    rating: 4.7,
    reviews: 8932,
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
    category: 'Sci-Fi',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.',
    pages: 688,
    publisher: 'Ace',
    language: 'English',
    accent: 'purple',
  },
  {
    id: '4',
    title: 'Zero to One',
    author: 'Peter Thiel',
    price: 22.99,
    rating: 4.6,
    reviews: 5671,
    coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop',
    category: 'Business',
    description: 'Notes on startups, or how to build the future. A must-read for entrepreneurs.',
    pages: 224,
    publisher: 'Crown Business',
    language: 'English',
    badge: 'NEW',
    accent: 'teal',
  },
  {
    id: '5',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    price: 21.99,
    rating: 4.9,
    reviews: 12345,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
    category: 'Sci-Fi',
    description: 'A lone astronaut must save the earth from disaster in this thrilling sci-fi adventure.',
    pages: 496,
    publisher: 'Ballantine Books',
    language: 'English',
    badge: 'NEW',
    accent: 'blue',
  },
  {
    id: '6',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    price: 17.99,
    originalPrice: 29.99,
    rating: 4.5,
    reviews: 9876,
    coverImage: 'https://images.unsplash.com/photo-1555116505-a1d6d352e65c?w=400&h=600&fit=crop',
    category: 'Non-Fiction',
    description: 'The two systems that drive the way we think. A groundbreaking tour of the mind.',
    pages: 499,
    publisher: 'Farrar, Straus and Giroux',
    language: 'English',
    accent: 'orange',
  },
  {
    id: '7',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    price: 20.99,
    rating: 4.7,
    reviews: 7654,
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    category: 'Business',
    description: 'How constant innovation creates radically successful businesses.',
    pages: 336,
    publisher: 'Crown Business',
    language: 'English',
    badge: 'HOT',
    accent: 'purple',
  },
  {
    id: '8',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    price: 23.99,
    originalPrice: 28.99,
    rating: 4.8,
    reviews: 18765,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    category: 'Non-Fiction',
    description: 'A brief history of humankind. From the Stone Age to the Silicon Age.',
    pages: 443,
    publisher: 'Harper',
    language: 'English',
    badge: 'BESTSELLER',
    accent: 'teal',
  },
];

export const featuredBooks = books.slice(0, 3);
export const newArrivals = books.filter(b => b.badge === 'NEW');
export const bestsellers = books.filter(b => b.badge === 'BESTSELLER');