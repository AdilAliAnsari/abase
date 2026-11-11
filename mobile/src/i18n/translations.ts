export type LanguageCode = 'en' | 'hi' | 'kn';

export interface Translations {
  // Navigation & Tabs
  home: string;
  pdfLibrary: string;
  videoLectures: string;
  aiAssistant: string;
  cart: string;
  myCart: string;
  mainMenu: string;
  statistics: string;
  myCards: string;
  history: string;
  language: string;
  languageAndRegion: string;
  accountData: string;
  changePassword: string;
  signOut: string;
  signIn: string;
  switchId: string;

  // Header & Search
  searchPlaceholder: string;
  searchBooks: string;
  clear: string;

  // Categories
  catAll: string;
  catFiction: string;
  catNonFiction: string;
  catSciFi: string;
  catBusiness: string;
  catSelfHelp: string;
  catDesign: string;
  catTechnology: string;

  // Book Card & Details
  byAuthor: string;
  ratings: string;
  reviews: string;
  prime: string;
  freeDeliveryTomorrow: string;
  deliveryMsg: string;
  addToCart: string;
  inCart: string;
  added: string;
  bestseller: string;
  newBadge: string;
  hotBadge: string;
  off: string;
  mrp: string;
  save: string;
  currency: string;
  maxPriceNote: string;

  // Product Detail
  productDetails: string;
  description: string;
  pages: string;
  publisher: string;
  bookLanguage: string;
  buyNow: string;
  inStock: string;
  outOfStock: string;

  // Cart Screen
  shoppingCart: string;
  itemsInCart: string;
  emptyCart: string;
  emptyCartSubtitle: string;
  exploreBooks: string;
  orderSummary: string;
  subtotal: string;
  discount: string;
  delivery: string;
  free: string;
  total: string;
  proceedToCheckout: string;
  clearCart: string;

  // Distributor Section
  distributorHub: string;
  distributorPortal: string;
  consumerDistributorDb: string;
  distributorMode: string;
  consumerMode: string;
  actAsDistributor: string;
  actAsConsumer: string;
  manageCatalog: string;
  updatePrice: string;
  maxPriceError: string;
  primeTag: string;
  deliveryTag: string;
  stock: string;
  saveChanges: string;
  addNewBook: string;
  consumersList: string;
  distributorsList: string;
  allUsers: string;
  role: string;
  status: string;
  action: string;
  updateSuccess: string;

  // General
  back: string;
  loading: string;
  success: string;
  error: string;
  confirm: string;
  cancel: string;
  [key: string]: any;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    home: 'Home',
    pdfLibrary: 'PDF Library',
    videoLectures: 'Video',
    aiAssistant: 'AI',
    cart: 'Cart',
    myCart: 'My Cart',
    mainMenu: 'Main Menu',
    statistics: 'Statistics',
    myCards: 'My Cards',
    history: 'History',
    language: 'Language',
    languageAndRegion: 'Language & Region',
    accountData: 'Update Account Data',
    changePassword: 'Change Password',
    signOut: 'Sign Out',
    signIn: 'Sign In / Choose ID',
    switchId: 'Switch ID',

    searchPlaceholder: 'Search books by title, author, or category...',
    searchBooks: 'Search Books',
    clear: 'Clear',

    catAll: 'All',
    catFiction: 'Fiction',
    catNonFiction: 'Non-Fiction',
    catSciFi: 'Sci-Fi',
    catBusiness: 'Business',
    catSelfHelp: 'Self-Help',
    catDesign: 'Design',
    catTechnology: 'Technology',

    byAuthor: 'by',
    ratings: 'ratings',
    reviews: 'reviews',
    prime: 'prime',
    freeDeliveryTomorrow: 'FREE delivery Tomorrow',
    deliveryMsg: 'FREE delivery Tomorrow',
    addToCart: 'Add to Cart',
    inCart: '✓ In Cart',
    added: '✓ Added',
    bestseller: 'BESTSELLER',
    newBadge: 'NEW',
    hotBadge: 'HOT',
    off: 'off',
    mrp: 'M.R.P.:',
    save: 'Save',
    currency: '₹',
    maxPriceNote: 'Price capped at max ₹1,000',

    productDetails: 'Product Details',
    description: 'Description',
    pages: 'Pages',
    publisher: 'Publisher',
    bookLanguage: 'Language',
    buyNow: 'Buy Now',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',

    shoppingCart: 'Shopping Cart',
    itemsInCart: 'items in your cart',
    emptyCart: 'Your cart is empty',
    emptyCartSubtitle: 'Discover best-selling books under ₹1,000 and add them to your collection.',
    exploreBooks: 'Explore Books',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    discount: 'Discount',
    delivery: 'Delivery',
    free: 'FREE',
    total: 'Total Amount',
    proceedToCheckout: 'Proceed to Buy',
    clearCart: 'Clear Cart',

    distributorHub: 'Distributor Hub',
    distributorPortal: 'Distributor Portal',
    consumerDistributorDb: 'Consumer & Distributor Database',
    distributorMode: 'Distributor Mode',
    consumerMode: 'Consumer Mode',
    actAsDistributor: 'Act as Distributor',
    actAsConsumer: 'Act as Consumer',
    manageCatalog: 'Manage Books & Tags',
    updatePrice: 'Price (Max ₹1,000)',
    maxPriceError: 'Book price cannot exceed ₹1,000',
    primeTag: 'Prime Tag',
    deliveryTag: 'Delivery Tag',
    stock: 'Stock',
    saveChanges: 'Save Changes',
    addNewBook: 'Add New Book',
    consumersList: 'Consumers',
    distributorsList: 'Distributors',
    allUsers: 'All Accounts',
    role: 'Role',
    status: 'Status',
    action: 'Action',
    updateSuccess: 'Updated successfully by Distributor!',

    back: 'Back',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    confirm: 'Confirm',
    cancel: 'Cancel',

    tagEditor: 'Tag & Price Manager',
    database: 'User Database',
    store: 'Store',
    messages: 'Messages',
    inbox: 'Inbox',
    notifications: 'Notifications',
    accountAndSecurity: 'Account and Security',
    updateAccountData: 'Update Account Data',
    items: 'items',
    grandTotal: 'Grand Total',
    price: 'Price',
    allPrices: 'All Prices',
    under300: 'Under ₹300',
    price300to600: '₹300 to ₹600',
    over600: '₹600 to ₹1000',
    category: 'Category',
    filters: 'Filters',
    remove: 'Remove',
    selected: 'selected',
    showResults: 'Show Results',
    clearAll: 'Clear All',
  },

  hi: {
    home: 'होम',
    pdfLibrary: 'पीडीएफ लाइब्रेरी',
    videoLectures: 'वीडियो',
    aiAssistant: 'एआई सहायक',
    cart: 'कार्ट',
    myCart: 'मेरी कार्ट',
    mainMenu: 'मुख्य मेन्यू',
    statistics: 'आंकड़े',
    myCards: 'मेरे कार्ड',
    history: 'इतिहास',
    language: 'भाषा',
    languageAndRegion: 'भाषा और क्षेत्र',
    accountData: 'खाता अपडेट करें',
    changePassword: 'पासवर्ड बदलें',
    signOut: 'साइन आउट',
    signIn: 'साइन इन / आईडी चुनें',
    switchId: 'आईडी बदलें',

    searchPlaceholder: 'शीर्षक, लेखक या श्रेणी द्वारा पुस्तकें खोजें...',
    searchBooks: 'पुस्तकें खोजें',
    clear: 'साफ़ करें',

    catAll: 'सभी',
    catFiction: 'काल्पनिक',
    catNonFiction: 'गैर-काल्पनिक',
    catSciFi: 'साइंस फिक्शन',
    catBusiness: 'व्यापार',
    catSelfHelp: 'आत्म-सुधार',
    catDesign: 'डिज़ाइन',
    catTechnology: 'प्रौद्योगिकी',

    byAuthor: 'द्वारा',
    ratings: 'रेटिंग',
    reviews: 'समीक्षाएं',
    prime: 'प्राइम',
    freeDeliveryTomorrow: 'कल मुफ़्त डिलीवरी',
    deliveryMsg: 'कल मुफ़्त डिलीवरी',
    addToCart: 'कार्ट में जोड़ें',
    inCart: '✓ कार्ट में है',
    added: '✓ जोड़ दिया गया',
    bestseller: 'बेस्टसेलर',
    newBadge: 'नया',
    hotBadge: 'हॉट',
    off: 'छूट',
    mrp: 'एम.आर.पी.:',
    save: 'बचत',
    currency: '₹',
    maxPriceNote: 'कीमत अधिकतम ₹1,000 तक सीमित',

    productDetails: 'उत्पाद विवरण',
    description: 'विवरण',
    pages: 'पृष्ठ',
    publisher: 'प्रकाशक',
    bookLanguage: 'भाषा',
    buyNow: 'अभी खरीदें',
    inStock: 'उपलब्ध है',
    outOfStock: 'स्टॉक में नहीं है',

    shoppingCart: 'शॉपिंग कार्ट',
    itemsInCart: 'आपकी कार्ट में आइटम',
    emptyCart: 'आपकी कार्ट खाली है',
    emptyCartSubtitle: '₹1,000 से कम की सबसे अधिक बिकने वाली पुस्तकें खोजें।',
    exploreBooks: 'पुस्तकें देखें',
    orderSummary: 'ऑर्डर सारांश',
    subtotal: 'उप-योग',
    discount: 'छूट',
    delivery: 'डिलीवरी',
    free: 'मुफ़्त',
    total: 'कुल राशि',
    proceedToCheckout: 'खरीदने के लिए आगे बढ़ें',
    clearCart: 'कार्ट खाली करें',

    distributorHub: 'वितरक हब (Distributor)',
    distributorPortal: 'वितरक पोर्टल',
    consumerDistributorDb: 'उपभोक्ता और वितरक डेटाबेस',
    distributorMode: 'वितरक मोड',
    consumerMode: 'उपभोक्ता मोड',
    actAsDistributor: 'वितरक के रूप में कार्य करें',
    actAsConsumer: 'उपभोक्ता के रूप में कार्य करें',
    manageCatalog: 'पुस्तकें और टैग प्रबंधित करें',
    updatePrice: 'कीमत (अधिकतम ₹1,000)',
    maxPriceError: 'पुस्तक की कीमत ₹1,000 से अधिक नहीं हो सकती',
    primeTag: 'प्राइम टैग',
    deliveryTag: 'डिलीवरी टैग',
    stock: 'स्टॉक',
    saveChanges: 'परिवर्तन सहेजें',
    addNewBook: 'नई पुस्तक जोड़ें',
    consumersList: 'उपभोक्ता',
    distributorsList: 'वितरक',
    allUsers: 'सभी खाते',
    role: 'भूमिका',
    status: 'स्थिति',
    action: 'कार्रवाई',
    updateSuccess: 'वितरक द्वारा सफलतापूर्वक अपडेट किया गया!',

    back: 'वापस',
    loading: 'लोड हो रहा है...',
    success: 'सफलता',
    error: 'त्रुटि',
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',

    tagEditor: 'टैग और मूल्य प्रबंधक',
    database: 'उपयोगकर्ता डेटाबेस',
    store: 'स्टोर',
    messages: 'संदेश',
    inbox: 'इनबॉक्स',
    notifications: 'सूचनाएं',
    accountAndSecurity: 'खाता और सुरक्षा',
    updateAccountData: 'खाता डेटा अपडेट करें',
    items: 'आइटम',
    grandTotal: 'कुल योग',
    price: 'मूल्य',
    allPrices: 'सभी मूल्य',
    under300: '₹300 से कम',
    price300to600: '₹300 से ₹600',
    over600: '₹600 से ₹1000',
    category: 'श्रेणी',
    filters: 'फ़िल्टर',
    remove: 'हटाएं',
    selected: 'चयनित',
    showResults: 'परिणाम दिखाएं',
    clearAll: 'सभी हटाएं',
  },

  kn: {
    home: 'ಮುಖಪುಟ',
    pdfLibrary: 'ಪಿಡಿಎಫ್ ಲೈಬ್ರರಿ',
    videoLectures: 'ವೀಡಿಯೊ',
    aiAssistant: 'ಎಐ ಸಹಾಯಕ',
    cart: 'ಕಾರ್ಟ್',
    myCart: 'ನನ್ನ ಕಾರ್ಟ್',
    mainMenu: 'ಮುಖ್ಯ ಮೆನು',
    statistics: 'ಅಂಕಿಅಂಶಗಳು',
    myCards: 'ನನ್ನ ಕಾರ್ಡ್‌ಗಳು',
    history: 'ಇತಿಹಾಸ',
    language: 'ಭಾಷೆ',
    languageAndRegion: 'ಭಾಷೆ ಮತ್ತು ಪ್ರದೇಶ',
    accountData: 'ಖಾತೆ ಮಾಹಿತಿ ನವೀಕರಿಸಿ',
    changePassword: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ',
    signOut: 'ಸೈನ್ ಔಟ್',
    signIn: 'ಸೈನ್ ಇನ್ / ಐಡಿ ಆಯ್ಕೆಮಾಡಿ',
    switchId: 'ಐಡಿ ಬದಲಾಯಿಸಿ',

    searchPlaceholder: 'ಶೀರ್ಷಿಕೆ, ಲೇಖಕ ಅಥವಾ ವರ್ಗದ ಮೂಲಕ ಪುಸ್ತಕಗಳನ್ನು ಹುಡುಕಿ...',
    searchBooks: 'ಪುಸ್ತಕಗಳನ್ನು ಹುಡುಕಿ',
    clear: 'ತೆರವುಗೊಳಿಸಿ',

    catAll: 'ಎಲ್ಲವೂ',
    catFiction: 'ಕಾಲ್ಪನಿಕ',
    catNonFiction: 'ನೈಜ ಕಥೆಗಳು',
    catSciFi: 'ವೈಜ್ಞಾನಿಕ ಕಾಲ್ಪನಿಕ',
    catBusiness: 'ವ್ಯಾಪಾರ',
    catSelfHelp: 'ಸ್ವಯಂ ಸುಧಾರಣೆ',
    catDesign: 'ವಿನ್ಯಾಸ',
    catTechnology: 'ತಂತ್ರಜ್ಞಾನ',

    byAuthor: 'ಲೇಖಕರು',
    ratings: 'ರೇಟಿಂಗ್ಸ್',
    reviews: 'ವಿಮರ್ಶೆಗಳು',
    prime: 'ಪ್ರೈಮ್',
    freeDeliveryTomorrow: 'ನಾಳೆ ಉಚಿತ ವಿತರಣೆ',
    deliveryMsg: 'ನಾಳೆ ಉಚಿತ ವಿತರಣೆ',
    addToCart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
    inCart: '✓ ಕಾರ್ಟ್‌ನಲ್ಲಿದೆ',
    added: '✓ ಸೇರಿಸಲಾಗಿದೆ',
    bestseller: 'ಬೆಸ್ಟ್‌ಸೆಲ್ಲರ್',
    newBadge: 'ಹೊಸದು',
    hotBadge: 'ಹಾಟ್',
    off: 'ರಿಯಾಯಿತಿ',
    mrp: 'ಎಂ.ಆರ್.ಪಿ.:',
    save: 'ಉಳಿತಾಯ',
    currency: '₹',
    maxPriceNote: 'ಬೆಲೆ ಗರಿಷ್ಠ ₹1,000 ಕ್ಕೆ ಸೀಮಿತವಾಗಿದೆ',

    productDetails: 'ಉತ್ಪನ್ನದ ವಿವರಗಳು',
    description: 'ವಿವರಣೆ',
    pages: 'ಪುಟಗಳು',
    publisher: 'ಪ್ರಕಾಶಕರು',
    bookLanguage: 'ಭಾಷೆ',
    buyNow: 'ಈಗಲೇ ಖರೀದಿಸಿ',
    inStock: 'ಲಭ್ಯವಿದೆ',
    outOfStock: 'ಲಭ್ಯವಿಲ್ಲ',

    shoppingCart: 'ಶಾಪಿಂಗ್ ಕಾರ್ಟ್',
    itemsInCart: 'ನಿಮ್ಮ ಕಾರ್ಟ್‌ನಲ್ಲಿರುವ ವಸ್ತುಗಳು',
    emptyCart: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ',
    emptyCartSubtitle: '₹1,000 ಕ್ಕಿಂತ ಕಡಿಮೆ ಬೆಲೆಯ ಅತ್ಯುತ್ತಮ ಪುಸ್ತಕಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
    exploreBooks: 'ಪುಸ್ತಕಗಳನ್ನು ನೋಡಿ',
    orderSummary: 'ಆರ್ಡರ್ ಸಾರಾಂಶ',
    subtotal: 'ಉಪಮೊತ್ತ',
    discount: 'ರಿಯಾಯಿತಿ',
    delivery: 'ವಿತರಣೆ',
    free: 'ಉಚಿತ',
    total: 'ಒಟ್ಟು ಮೊತ್ತ',
    proceedToCheckout: 'ಖರೀದಿಗೆ ಮುಂದುವರಿಯಿರಿ',
    clearCart: 'ಕಾರ್ಟ್ ತೆರವುಗೊಳಿಸಿ',

    distributorHub: 'ವಿತರಕರ ಹಬ್ (Distributor)',
    distributorPortal: 'ವಿತರಕರ ಪೋರ್ಟಲ್',
    consumerDistributorDb: 'ಗ್ರಾಹಕರು ಮತ್ತು ವಿತರಕರ ಡೇಟಾಬೇಸ್',
    distributorMode: 'ವಿತರಕ ಮೋಡ್',
    consumerMode: 'ಗ್ರಾಹಕ ಮೋಡ್',
    actAsDistributor: 'ವಿತರಕರಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿ',
    actAsConsumer: 'ಗ್ರಾಹಕರಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿ',
    manageCatalog: 'ಪುಸ್ತಕಗಳು ಮತ್ತು ಟ್ಯಾಗ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
    updatePrice: 'ಬೆಲೆ (ಗರಿಷ್ಠ ₹1,000)',
    maxPriceError: 'ಪುಸ್ತಕದ ಬೆಲೆ ₹1,000 ಮೀರಬಾರದು',
    primeTag: 'ಪ್ರೈಮ್ ಟ್ಯಾಗ್',
    deliveryTag: 'ವಿತರಣೆ ಟ್ಯಾಗ್',
    stock: 'ಸ್ಟಾಕ್',
    saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    addNewBook: 'ಹೊಸ ಪುಸ್ತಕ ಸೇರಿಸಿ',
    consumersList: 'ಗ್ರಾಹಕರು',
    distributorsList: 'ವಿತರಕರು',
    allUsers: 'ಎಲ್ಲಾ ಖಾತೆಗಳು',
    role: 'ಪಾತ್ರ',
    status: 'ಸ್ಥಿತಿ',
    action: 'ಕ್ರಮ',
    updateSuccess: 'ವಿತರಕರಿಂದ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!',

    back: 'ಹಿಂದೆ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    success: 'ಯಶಸ್ವಿಯಾಗಿದೆ',
    error: 'ದೋಷ',
    confirm: 'ದೃಢೀಕರಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',

    tagEditor: 'ಟ್ಯಾಗ್ ಮತ್ತು ಬೆಲೆ ನಿರ್ವಾಹಕ',
    database: 'ಬಳಕೆದಾರರ ಡೇಟಾಬೇಸ್',
    store: 'ಅಂಗಡಿ',
    messages: 'ಸಂದೇಶಗಳು',
    inbox: 'ಇನ್‌ಬಾಕ್ಸ್',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    accountAndSecurity: 'ಖಾತೆ ಮತ್ತು ಭದ್ರತೆ',
    updateAccountData: 'ಖಾತೆ ಡೇಟಾವನ್ನು ನವೀಕರಿಸಿ',
    items: 'ಐಟಂಗಳು',
    grandTotal: 'ಒಟ್ಟು ಮೊತ್ತ',
    price: 'ಬೆಲೆ',
    allPrices: 'ಎಲ್ಲಾ ಬೆಲೆಗಳು',
    under300: '₹300 ಕ್ಕಿಂತ ಕಡಿಮೆ',
    price300to600: '₹300 ರಿಂದ ₹600',
    over600: '₹600 ರಿಂದ ₹1000',
    category: 'ವರ್ಗ',
    filters: 'ಫಿಲ್ಟರ್‌ಗಳು',
    remove: 'ತೆಗೆದುಹಾಕಿ',
    selected: 'ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ',
    showResults: 'ಫಲಿತಾಂಶಗಳನ್ನು ತೋರಿಸಿ',
    clearAll: 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ',
  },
};
