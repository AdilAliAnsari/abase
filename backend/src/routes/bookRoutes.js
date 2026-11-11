import express from "express";
import mongoose from "mongoose";
import Book from "../models/Book.js";
import { protectRoute } from "./auth.js";

const router = express.Router();

// Initial books catalog in Indian Rupees (₹), strictly <= ₹1000
const initialBooks = [
  {
    _id: "660000000000000000000001",
    id: "1",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    price: 399,
    originalPrice: 499,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 45,
    inStock: true,
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
    price: 449,
    originalPrice: 599,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 60,
    inStock: true,
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
    price: 499,
    originalPrice: 699,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 30,
    inStock: true,
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
    price: 349,
    originalPrice: 450,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 40,
    inStock: true,
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
    price: 599,
    originalPrice: 799,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 25,
    inStock: true,
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
    price: 480,
    originalPrice: 650,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 35,
    inStock: true,
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
    price: 399,
    originalPrice: 499,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 50,
    inStock: true,
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
    price: 549,
    originalPrice: 699,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 40,
    inStock: true,
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
    price: 899,
    originalPrice: 999,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 20,
    inStock: true,
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
  },
  {
    _id: "660000000000000000000010",
    id: "10",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 299,
    originalPrice: 399,
    currency: "INR",
    isPrime: true,
    deliveryTag: "FREE delivery Tomorrow",
    stockCount: 55,
    inStock: true,
    rating: 4.8,
    reviews: 14200,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    category: "Business",
    description: "Timeless lessons on wealth, greed, and happiness.",
    pages: 256,
    publisher: "Harriman House",
    language: "English",
    badge: "BESTSELLER",
    accent: "blue",
  }
];

// Helper to seed or update DB to Indian Rupees (₹) and max ₹1000
const maybeSeedBooks = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await Book.countDocuments();
      if (count === 0) {
        await Book.insertMany(initialBooks.map(b => {
          const { id, ...rest } = b;
          return rest;
        }));
        console.log("🌱 Automatically seeded books in INR (₹) into MongoDB.");
      } else {
        // Auto-migrate any legacy USD items or prices > 1000
        const legacyBooks = await Book.find({ $or: [{ price: { $lt: 100 } }, { price: { $gt: 1000 } }, { currency: { $ne: "INR" } }] });
        if (legacyBooks.length > 0) {
          for (const book of legacyBooks) {
            if (book.price < 100) {
              book.price = Math.min(1000, Math.round(book.price * 25));
              if (book.originalPrice) book.originalPrice = Math.min(1000, Math.round(book.originalPrice * 25));
            } else if (book.price > 1000) {
              book.price = 999;
              if (book.originalPrice) book.originalPrice = 1000;
            }
            book.currency = "INR";
            if (book.isPrime === undefined) book.isPrime = true;
            if (!book.deliveryTag) book.deliveryTag = "FREE delivery Tomorrow";
            if (!book.stockCount) book.stockCount = 40;
            await book.save();
          }
          console.log(`🇮🇳 Updated ${legacyBooks.length} books to Indian Rupees (₹) capped at max ₹1000.`);
        }
      }
    } catch (err) {
      console.warn("Could not check/seed books in MongoDB:", err.message);
    }
  }
};

// 1. GET /api/books - Get books with search, filter, pagination
router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, page = 1, limit = 50 } = req.query;

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
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Math.min(1000, Number(maxPrice));
      }

      let sort = { createdAt: -1 };
      if (sortBy === "priceLow") sort = { price: 1 };
      else if (sortBy === "priceHigh") sort = { price: -1 };
      else if (sortBy === "rating") sort = { rating: -1 };

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Book.countDocuments(filter);
      const dbBooks = await Book.find(filter).sort(sort).skip(skip).limit(Number(limit));

      const books = dbBooks.map(b => ({
        id: String(b._id),
        _id: String(b._id),
        title: b.title,
        author: b.author,
        price: Math.min(1000, b.price),
        originalPrice: b.originalPrice ? Math.min(1000, b.originalPrice) : undefined,
        currency: "INR",
        isPrime: b.isPrime !== false,
        deliveryTag: b.deliveryTag || "FREE delivery Tomorrow",
        stockCount: b.stockCount !== undefined ? b.stockCount : 50,
        inStock: b.inStock !== false,
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
      }));

      return res.status(200).json({
        success: true,
        books,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      });
    }

    // Dev / Memory fallback
    let results = [...initialBooks];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q));
    }
    if (category && category !== "All") {
      results = results.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) results = results.filter(b => b.price >= Number(minPrice));
    if (maxPrice) results = results.filter(b => b.price <= Math.min(1000, Number(maxPrice)));

    if (sortBy === "priceLow") results.sort((a, b) => a.price - b.price);
    else if (sortBy === "priceHigh") results.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") results.sort((a, b) => b.rating - a.rating);

    res.status(200).json({
      success: true,
      books: results,
      total: results.length,
      page: 1,
      totalPages: 1
    });

  } catch (error) {
    console.error("Error in GET /api/books:", error);
    res.status(500).json({ success: false, message: "Error fetching books" });
  }
});

// 2. GET /api/books/:id - Get single book by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      let book = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        book = await Book.findById(id);
      }
      if (!book) {
        book = await Book.findOne({ _id: id });
      }
      if (book) {
        return res.status(200).json({
          success: true,
          book: {
            id: String(book._id),
            _id: String(book._id),
            title: book.title,
            author: book.author,
            price: Math.min(1000, book.price),
            originalPrice: book.originalPrice ? Math.min(1000, book.originalPrice) : undefined,
            currency: "INR",
            isPrime: book.isPrime !== false,
            deliveryTag: book.deliveryTag || "FREE delivery Tomorrow",
            stockCount: book.stockCount !== undefined ? book.stockCount : 50,
            inStock: book.inStock !== false,
            rating: book.rating,
            reviews: book.reviews,
            coverImage: book.coverImage,
            category: book.category,
            description: book.description,
            pages: book.pages,
            publisher: book.publisher,
            language: book.language,
            badge: book.badge,
            accent: book.accent || "blue"
          }
        });
      }
    }

    const found = initialBooks.find(b => b.id === id || b._id === id);
    if (found) return res.status(200).json({ success: true, book: found });
    res.status(404).json({ success: false, message: "Book not found" });
  } catch (error) {
    console.error("Error in GET /api/books/:id:", error);
    res.status(500).json({ success: false, message: "Error fetching book" });
  }
});

// 3. POST /api/books - Create new book (price capped at ₹1000)
router.post("/", async (req, res) => {
  try {
    const {
      title,
      author,
      price,
      originalPrice,
      coverImage,
      category,
      description,
      pages,
      publisher,
      language,
      badge,
      accent,
      isPrime,
      deliveryTag,
      stockCount
    } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ success: false, message: "Title and price are required" });
    }

    const numPrice = parseFloat(price);
    if (numPrice > 1000) {
      return res.status(400).json({
        success: false,
        message: "Book price cannot be more than ₹1000 (Indian Rupees limit)"
      });
    }

    const clampedOrigPrice = originalPrice ? Math.min(1000, parseFloat(originalPrice)) : undefined;

    if (mongoose.connection.readyState === 1) {
      const newBook = new Book({
        title,
        author: author || "Unknown",
        price: numPrice,
        originalPrice: clampedOrigPrice,
        currency: "INR",
        isPrime: isPrime !== undefined ? Boolean(isPrime) : true,
        deliveryTag: deliveryTag || "FREE delivery Tomorrow",
        stockCount: stockCount ? parseInt(stockCount, 10) : 50,
        inStock: true,
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
      price: numPrice,
      originalPrice: clampedOrigPrice,
      currency: "INR",
      isPrime: isPrime !== undefined ? Boolean(isPrime) : true,
      deliveryTag: deliveryTag || "FREE delivery Tomorrow",
      stockCount: stockCount ? parseInt(stockCount, 10) : 50,
      inStock: true,
      coverImage: coverImage || "",
      category: category || "General",
      description: description || "",
      pages: pages || 100,
      publisher: publisher || "Independent",
      language: language || "English",
      badge: badge || "",
      accent: accent || "blue"
    };
    initialBooks.unshift(mockBook);
    res.status(201).json({ success: true, book: mockBook });

  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create book" });
  }
});

// 4. PUT /api/books/:id - Distributor updates book details, tags, and price (max ₹1000)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      price,
      originalPrice,
      isPrime,
      deliveryTag,
      stockCount,
      inStock,
      category,
      badge,
      coverImage
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (author !== undefined) updates.author = author;
    if (category !== undefined) updates.category = category;
    if (badge !== undefined) updates.badge = badge;
    if (coverImage !== undefined) updates.coverImage = coverImage;

    // Enforce Price Cap <= ₹1000
    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (numPrice > 1000) {
        return res.status(400).json({
          success: false,
          message: "Book price cannot be more than ₹1000 (Indian Rupees limit)"
        });
      }
      updates.price = Math.max(0, numPrice);
    }

    if (originalPrice !== undefined) {
      updates.originalPrice = Math.min(1000, Math.max(0, parseFloat(originalPrice)));
    }

    // Distributor tags
    if (isPrime !== undefined) updates.isPrime = Boolean(isPrime);
    if (deliveryTag !== undefined) updates.deliveryTag = String(deliveryTag).trim();
    if (stockCount !== undefined) updates.stockCount = Math.max(0, parseInt(stockCount, 10));
    if (inStock !== undefined) updates.inStock = Boolean(inStock);
    updates.currency = "INR";

    if (mongoose.connection.readyState === 1) {
      let book = await Book.findByIdAndUpdate(id, { $set: updates }, { new: true });
      if (!book) {
        book = await Book.findOneAndUpdate({ _id: id }, { $set: updates }, { new: true });
      }

      if (!book) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      console.log(`📦 [DISTRIBUTOR] Updated Book "${book.title}": Price=₹${book.price}, Prime=${book.isPrime}, Tag="${book.deliveryTag}"`);

      return res.status(200).json({
        success: true,
        message: "Book and tags updated successfully by Distributor",
        book: {
          id: String(book._id),
          _id: String(book._id),
          title: book.title,
          author: book.author,
          price: book.price,
          originalPrice: book.originalPrice,
          currency: "INR",
          isPrime: book.isPrime,
          deliveryTag: book.deliveryTag,
          stockCount: book.stockCount,
          inStock: book.inStock,
          rating: book.rating,
          reviews: book.reviews,
          coverImage: book.coverImage,
          category: book.category,
          badge: book.badge,
          accent: book.accent
        }
      });
    }

    // Memory update
    const idx = initialBooks.findIndex(b => b.id === id || b._id === id);
    if (idx !== -1) {
      initialBooks[idx] = { ...initialBooks[idx], ...updates };
      return res.status(200).json({
        success: true,
        message: "Book updated in memory by Distributor",
        book: initialBooks[idx]
      });
    }

    res.status(404).json({ success: false, message: "Book not found" });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update book" });
  }
});

export default router;