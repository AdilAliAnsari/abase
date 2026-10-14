import express from "express";
import mongoose from "mongoose";
import Book from "../models/Book.js";
import { protectRoute } from "./auth.js";

const router = express.Router();

const initialBooks = [
  {
    _id: "660000000000000000000001",
    id: "1",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    price: 24.99,
    originalPrice: 32.00,
    rating: 4.8,
    reviews: 2847,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    category: "Design",
    description: "The ultimate guide to human-centered design. Learn how psychology shapes the objects we use every day.",
    pages: 368,
    publisher: "Basic Books",
    language: "English",
    badge: "BESTSELLER",
    accent: "orange",
  },
  {
    _id: "660000000000000000000002",
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    price: 19.99,
    rating: 4.9,
    reviews: 15234,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    category: "Self-Help",
    description: "Tiny changes, remarkable results. An easy & proven way to build good habits & break bad ones.",
    pages: 320,
    publisher: "Avery",
    language: "English",
    badge: "BESTSELLER",
    accent: "blue",
  },
  {
    _id: "660000000000000000000003",
    id: "3",
    title: "Dune",
    author: "Frank Herbert",
    price: 18.99,
    originalPrice: 25.99,
    rating: 4.7,
    reviews: 8932,
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
    category: "Sci-Fi",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.",
    pages: 688,
    publisher: "Ace",
    language: "English",
    accent: "purple",
  },
  {
    _id: "660000000000000000000004",
    id: "4",
    title: "Zero to One",
    author: "Peter Thiel",
    price: 22.99,
    rating: 4.6,
    reviews: 5671,
    coverImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop",
    category: "Business",
    description: "Notes on startups, or how to build the future. A must-read for entrepreneurs.",
    pages: 224,
    publisher: "Crown Business",
    language: "English",
    badge: "NEW",
    accent: "teal",
  },
  {
    _id: "660000000000000000000005",
    id: "5",
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: 21.99,
    rating: 4.9,
    reviews: 12345,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop",
    category: "Sci-Fi",
    description: "A lone astronaut must save the earth from disaster in this thrilling sci-fi adventure.",
    pages: 496,
    publisher: "Ballantine Books",
    language: "English",
    badge: "NEW",
    accent: "blue",
  },
  {
    _id: "660000000000000000000006",
    id: "6",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    price: 17.99,
    originalPrice: 29.99,
    rating: 4.5,
    reviews: 9876,
    coverImage: "https://images.unsplash.com/photo-1555116505-a1d6d352e65c?w=400&h=600&fit=crop",
    category: "Non-Fiction",
    description: "The two systems that drive the way we think. A groundbreaking tour of the mind.",
    pages: 499,
    publisher: "Farrar, Straus and Giroux",
    language: "English",
    accent: "orange",
  },
  {
    _id: "660000000000000000000007",
    id: "7",
    title: "The Lean Startup",
    author: "Eric Ries",
    price: 20.99,
    rating: 4.7,
    reviews: 7654,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    category: "Business",
    description: "How constant innovation creates radically successful businesses.",
    pages: 336,
    publisher: "Crown Business",
    language: "English",
    badge: "HOT",
    accent: "purple",
  },
  {
    _id: "660000000000000000000008",
    id: "8",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    price: 23.99,
    originalPrice: 28.99,
    rating: 4.8,
    reviews: 18765,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    category: "Non-Fiction",
    description: "A brief history of humankind. From the Stone Age to the Silicon Age.",
    pages: 443,
    publisher: "Harper",
    language: "English",
    badge: "BESTSELLER",
    accent: "teal",
  },
  {
    _id: "660000000000000000000009",
    id: "9",
    title: "C++: The Complete Reference",
    author: "Bjarne Stroustrup",
    price: 30.13,
    originalPrice: 56.99,
    rating: 4.8,
    reviews: 18765,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    category: "Technology",
    description: "The Definitive Guide.",
    pages: 1300,
    publisher: "Pearson",
    language: "English",
    badge: "NEW",
    accent: "orange",
  }
];

// Helper to seed DB if connected & empty
const maybeSeedBooks = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await Book.countDocuments();
      if (count === 0) {
        await Book.insertMany(initialBooks.map(b => {
          const { id, ...rest } = b;
          return rest;
        }));
        console.log("🌱 Automatically seeded initial books into MongoDB.");
      }
    } catch (err) {
      console.warn("Could not check/seed books in MongoDB:", err.message);
    }
  }
};

// 1. GET /api/books - Get books with search, filter, pagination
router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState === 1) {
      await maybeSeedBooks();

      const filter = {};
      if (search) {
        const regex = new RegExp(search, "i");
        filter.$or = [{ title: regex }, { author: regex }, { category: regex }, { description: regex }];
      }
      if (category && category !== "All") {
        filter.category = new RegExp(`^${category}$`, "i");
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      const sortOptions = {};
      if (sortBy === "priceLow") sortOptions.price = 1;
      else if (sortBy === "priceHigh") sortOptions.price = -1;
      else if (sortBy === "rating") sortOptions.rating = -1;
      else sortOptions.createdAt = -1;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [books, total] = await Promise.all([
        Book.find(filter).sort(sortOptions).skip(skip).limit(parseInt(limit)),
        Book.countDocuments(filter)
      ]);

      if (books.length > 0) {
        return res.status(200).json({
          success: true,
          books: books.map(b => ({
            id: b._id.toString(),
            _id: b._id.toString(),
            title: b.title,
            author: b.author,
            price: b.price,
            originalPrice: b.originalPrice,
            rating: b.rating,
            reviews: b.reviews,
            coverImage: b.coverImage,
            category: b.category,
            description: b.description,
            pages: b.pages,
            publisher: b.publisher,
            language: b.language,
            badge: b.badge,
            accent: b.accent || "blue"
          })),
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit))
        });
      }
    }

    // Fallback in-memory catalog
    let filtered = [...initialBooks];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    }
    if (category && category !== "All") {
      filtered = filtered.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) filtered = filtered.filter(b => b.price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter(b => b.price <= parseFloat(maxPrice));

    if (sortBy === "priceLow") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "priceHigh") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);

    res.status(200).json({
      success: true,
      books: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1
    });

  } catch (error) {
    console.error("Error in GET /api/books:", error);
    res.status(200).json({
      success: true,
      books: initialBooks,
      total: initialBooks.length,
      page: 1,
      totalPages: 1
    });
  }
});

// 2. GET /api/books/:id - Get single book by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const book = await Book.findById(id);
        if (book) {
          return res.status(200).json({
            success: true,
            book: {
              id: book._id.toString(),
              _id: book._id.toString(),
              title: book.title,
              author: book.author,
              price: book.price,
              originalPrice: book.originalPrice,
              rating: book.rating,
              reviews: book.reviews,
              coverImage: book.coverImage,
              category: book.category,
              description: book.description,
              pages: book.pages,
              publisher: book.publisher,
              language: book.language,
              badge: book.badge,
              accent: book.accent
            }
          });
        }
      }
    }

    // Fallback search
    const found = initialBooks.find(b => b.id === id || b._id === id);
    if (found) {
      return res.status(200).json({ success: true, book: found });
    }

    res.status(404).json({ success: false, message: "Book not found" });
  } catch (error) {
    console.error("Error in GET /api/books/:id:", error);
    const found = initialBooks.find(b => b.id === req.params.id);
    if (found) return res.status(200).json({ success: true, book: found });
    res.status(500).json({ success: false, message: "Error fetching book" });
  }
});

// 3. POST /api/books - Create new book
router.post("/", async (req, res) => {
  try {
    const { title, author, price, coverImage, category, description, pages, publisher, language, badge, accent } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ success: false, message: "Title and price are required" });
    }

    if (mongoose.connection.readyState === 1) {
      const newBook = new Book({
        title,
        author: author || "Unknown",
        price: parseFloat(price),
        coverImage: coverImage || "",
        category: category || "General",
        description: description || "",
        pages: pages || 100,
        publisher: publisher || "Independent",
        language: language || "English",
        badge: badge || "",
        accent: accent || "blue"
      });
      await newBook.save();
      return res.status(201).json({ success: true, book: newBook });
    }

    // Mock create
    const mockBook = {
      id: String(Date.now()),
      _id: String(Date.now()),
      title,
      author: author || "Unknown",
      price: parseFloat(price),
      coverImage: coverImage || "",
      category: category || "General",
      description: description || "",
      pages: pages || 100,
      publisher: publisher || "Independent",
      language: language || "English",
      badge: badge || "",
      accent: accent || "blue"
    };
    initialBooks.push(mockBook);
    res.status(201).json({ success: true, book: mockBook });

  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create book" });
  }
});

export default router;