import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ShieldAlert,
  Tag,
  Users,
  Check,
  Zap,
  Truck,
  ArrowLeft,
  Search,
  PlusCircle,
  RefreshCw,
  UserCheck,
  UserX,
  BadgeIndianRupee,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/LanguageContext';
import bookService from '../services/bookService';
import authService, { UserProfile } from '../services/authService';
import { Book } from '../data/books';

export default function DistributorScreen() {
  const navigation = useNavigation<any>();
  const { user, setRole } = useAuth();
  const { t } = useTranslation();

  const isDistributor = user?.role === 'distributor';

  const [activeTab, setActiveTab] = useState<'books' | 'database'>('books');
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Books State
  const [books, setBooks] = useState<Book[]>([]);
  const [bookSearch, setBookSearch] = useState<string>('');
  const [editedBooks, setEditedBooks] = useState<Record<string, Partial<Book>>>({});

  // Database State
  const [dbData, setDbData] = useState<{
    total: number;
    consumersCount: number;
    distributorsCount: number;
    consumers: any[];
    distributors: any[];
    allUsers: any[];
  }>({
    total: 0,
    consumersCount: 0,
    distributorsCount: 0,
    consumers: [],
    distributors: [],
    allUsers: [],
  });
  const [dbFilter, setDbFilter] = useState<'all' | 'consumers' | 'distributors'>('all');
  const [dbSearch, setDbSearch] = useState<string>('');

  // Add Book Modal State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newPrice, setNewPrice] = useState('499');
  const [newCategory, setNewCategory] = useState('Programming');
  const [newDeliveryTag, setNewDeliveryTag] = useState('FREE delivery Tomorrow');
  const [newIsPrime, setNewIsPrime] = useState(true);
  const [addError, setAddError] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const booksRes = await bookService.getBooks();
      if (booksRes && booksRes.books) {
        setBooks(booksRes.books);
      }

      const dbRes = await authService.getDistributorDatabase();
      if (dbRes) {
        setDbData(dbRes);
      }
    } catch (err: any) {
      console.warn('Error fetching distributor portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  // Handle editing book fields locally before saving
  const handleFieldChange = (bookId: string, field: keyof Book, value: any) => {
    setEditedBooks(prev => {
      const currentBook = books.find(b => b.id === bookId);
      const existingEdits = prev[bookId] || {};
      return {
        ...prev,
        [bookId]: {
          ...currentBook,
          ...existingEdits,
          [field]: value,
        },
      };
    });
  };

  // Save Book Updates to Backend
  const handleSaveBook = async (bookId: string) => {
    const edits = editedBooks[bookId];
    if (!edits) return;

    // Strict validation: Price cannot exceed 1000
    if (edits.price !== undefined) {
      const numericPrice = Number(edits.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        Alert.alert('Invalid Price', 'Price must be a valid positive number in ₹.');
        return;
      }
      if (numericPrice > 1000) {
        Alert.alert(
          'Price Exceeds Limit',
          'Book price cannot exceed ₹1000 under distributor policy. Please adjust to ₹1000 or below.'
        );
        return;
      }
    }

    setSavingId(bookId);
    try {
      const updated = await bookService.updateBook(bookId, edits);
      // Update local books array
      setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, ...edits, ...updated } : b)));
      // Clear edited state for this book
      setEditedBooks(prev => {
        const copy = { ...prev };
        delete copy[bookId];
        return copy;
      });
      showToast(`Updated "${edits.title || 'Book'}" tags & price successfully!`);
    } catch (err: any) {
      Alert.alert('Error Updating Book', err.message || 'Could not save updates.');
    } finally {
      setSavingId(null);
    }
  };

  // Handle Add New Book
  const handleCreateBook = async () => {
    setAddError(null);
    const numericPrice = Number(newPrice);
    if (!newTitle.trim()) {
      setAddError('Book title is required');
      return;
    }
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setAddError('Please enter a valid price in ₹');
      return;
    }
    if (numericPrice > 1000) {
      setAddError('Maximum allowed price is ₹1000');
      return;
    }

    try {
      const created = await bookService.createBook({
        title: newTitle.trim(),
        author: newAuthor.trim() || 'Distributor Edition',
        price: numericPrice,
        currency: 'INR',
        category: newCategory,
        isPrime: newIsPrime,
        deliveryTag: newDeliveryTag.trim() || 'FREE delivery Tomorrow',
        inStock: true,
        stockCount: 50,
      });

      if (created) {
        setBooks(prev => [created, ...prev]);
        setShowAddForm(false);
        setNewTitle('');
        setNewAuthor('');
        setNewPrice('499');
        showToast(`Created new listing "${created.title}" at ₹${created.price}`);
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to create book listing');
    }
  };

  // Filtered books
  const filteredBooks = books.filter(b => {
    if (!bookSearch.trim()) return true;
    const q = bookSearch.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  // Filtered Users for Database Tab
  const allUserList = [
    ...(dbData.distributors || []).map(u => ({ ...u, role: 'distributor' })),
    ...(dbData.consumers || []).map(u => ({ ...u, role: 'consumer' })),
  ];

  const filteredUsers = allUserList.filter(u => {
    if (dbFilter === 'consumers' && u.role !== 'consumer') return false;
    if (dbFilter === 'distributors' && u.role !== 'distributor') return false;
    if (dbSearch.trim()) {
      const q = dbSearch.toLowerCase();
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return name.includes(q) || email.includes(q) || username.includes(q);
    }
    return true;
  });

  // If user is not yet marked as distributor, show clear activation access
  if (!isDistributor) {
    return (
      <View style={styles.accessContainer}>
        <View style={styles.accessCard}>
          <ShieldAlert size={56} color="#FF9900" style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={styles.accessTitle}>{t.distributorPortal || 'Distributor Portal'}</Text>
          <Text style={styles.accessSubtitle}>
            This portal is restricted to authorized distributors. It allows updating Prime tags,
            delivery promises, prices (up to ₹1000), and viewing the customer & distributor database.
          </Text>

          <View style={styles.currentIdBox}>
            <Text style={styles.currentIdLabel}>Currently Logged In ID:</Text>
            <Text style={styles.currentIdValue}>{user?.email || user?.username || 'Guest / Not Logged In'}</Text>
            <Text style={styles.currentIdRole}>Active Role: {user?.role || 'consumer'}</Text>
          </View>

          <TouchableOpacity
            style={styles.activateDistributorBtn}
            onPress={async () => {
              try {
                await setRole('distributor');
                showToast('Authorized! You are now acting as Distributor.');
                fetchData();
              } catch (e: any) {
                Alert.alert('Error', e.message || 'Could not switch role.');
              }
            }}
          >
            <Zap size={20} color="#061A02" />
            <Text style={styles.activateDistributorBtnText}>
              {t.actAsDistributor || 'Act as Distributor for this ID'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
          >
            <ArrowLeft size={18} color="#FFFFFF" />
            <Text style={styles.backHomeBtnText}>Back to Consumer Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{t.distributorPortal || 'Distributor Portal'}</Text>
          <View style={styles.headerBadge}>
            <View style={styles.headerBadgeDot} />
            <Text style={styles.headerBadgeText}>DISTRIBUTOR ID ACTIVE</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.roleTogglePill}
          onPress={async () => {
            await setRole('consumer');
            navigation.navigate('MainTabs', { screen: 'HomeTab' });
          }}
        >
          <Text style={styles.roleTogglePillText}>{t.actAsConsumer || 'Switch to Consumer'}</Text>
        </TouchableOpacity>
      </View>

      {/* TOAST MESSAGE */}
      {successMessage && (
        <View style={styles.toast}>
          <Check size={18} color="#061A02" />
          <Text style={styles.toastText}>{successMessage}</Text>
        </View>
      )}

      {/* TABS NAVIGATION */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'books' && styles.tabButtonActive]}
          onPress={() => setActiveTab('books')}
        >
          <Tag size={18} color={activeTab === 'books' ? '#7BEA12' : '#8D8D94'} />
          <Text style={[styles.tabButtonText, activeTab === 'books' && styles.tabButtonTextActive]}>
            {t.tagEditor || 'Tag & Price Manager'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'database' && styles.tabButtonActive]}
          onPress={() => setActiveTab('database')}
        >
          <Users size={18} color={activeTab === 'database' ? '#7BEA12' : '#8D8D94'} />
          <Text style={[styles.tabButtonText, activeTab === 'database' && styles.tabButtonTextActive]}>
            {t.database || 'User Database'} ({dbData.total || allUserList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: TAG & PRICE MANAGER */}
      {activeTab === 'books' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* RULE BANNER */}
          <View style={styles.ruleBanner}>
            <BadgeIndianRupee size={22} color="#7BEA12" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.ruleBannerTitle}>Distributor Pricing & Tag Guidelines</Text>
              <Text style={styles.ruleBannerDesc}>
                1. Maximum price per book is strictly <Text style={{ color: '#7BEA12', fontWeight: '800' }}>₹1000</Text>.
                {'\n'}2. Toggle Prime delivery tag and customize delivery promises live for all consumers.
              </Text>
            </View>
          </View>

          {/* ACTIONS ROW: SEARCH & ADD BOOK */}
          <View style={styles.toolbarRow}>
            <View style={styles.searchBox}>
              <Search size={18} color="#8D8D94" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search catalog by title, author..."
                placeholderTextColor="#666"
                value={bookSearch}
                onChangeText={setBookSearch}
              />
            </View>

            <TouchableOpacity
              style={styles.addBookBtn}
              onPress={() => setShowAddForm(!showAddForm)}
            >
              <PlusCircle size={18} color="#061A02" />
              <Text style={styles.addBookBtnText}>Add Book</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
              <RefreshCw size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* ADD BOOK COLLAPSIBLE FORM */}
          {showAddForm && (
            <View style={styles.addFormCard}>
              <Text style={styles.addFormTitle}>Add New Book Listing (Max ₹1000)</Text>

              {addError && <Text style={styles.errorText}>{addError}</Text>}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Book Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Master Clean Code & Microservices"
                  placeholderTextColor="#666"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Author</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Robert C. Martin"
                  placeholderTextColor="#666"
                  value={newAuthor}
                  onChangeText={setNewAuthor}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Price in INR (₹) * [Max ₹1000]</Text>
                  <View style={styles.currencyInputWrap}>
                    <Text style={styles.rupeePrefix}>₹</Text>
                    <TextInput
                      style={styles.currencyTextInput}
                      placeholder="499"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={newPrice}
                      onChangeText={val => {
                        const num = Number(val);
                        if (num > 1000) {
                          setNewPrice('1000');
                        } else {
                          setNewPrice(val);
                        }
                      }}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Programming / AI / Science"
                    placeholderTextColor="#666"
                    value={newCategory}
                    onChangeText={setNewCategory}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Tag Text</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. FREE delivery Tomorrow"
                  placeholderTextColor="#666"
                  value={newDeliveryTag}
                  onChangeText={setNewDeliveryTag}
                />
              </View>

              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setNewIsPrime(!newIsPrime)}
              >
                <View style={[styles.checkbox, newIsPrime && styles.checkboxActive]}>
                  {newIsPrime && <Check size={14} color="#061A02" />}
                </View>
                <Text style={styles.toggleLabel}>
                  Enable <Text style={{ color: '#00A8E1', fontWeight: '800' }}>prime</Text> Delivery Badge
                </Text>
              </TouchableOpacity>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.formCancelBtn}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.formCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.formSubmitBtn} onPress={handleCreateBook}>
                  <Text style={styles.formSubmitText}>Create Listing (&le; ₹1000)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* BOOK LIST */}
          {loading ? (
            <ActivityIndicator size="large" color="#7BEA12" style={{ marginVertical: 40 }} />
          ) : filteredBooks.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No books found matching "{bookSearch}"</Text>
            </View>
          ) : (
            filteredBooks.map(book => {
              const edits = editedBooks[book.id] || {};
              const currentPrice = edits.price !== undefined ? edits.price : book.price;
              const currentDeliveryTag =
                edits.deliveryTag !== undefined ? edits.deliveryTag : (book.deliveryTag || 'FREE delivery Tomorrow');
              const currentIsPrime =
                edits.isPrime !== undefined ? edits.isPrime : (book.isPrime ?? true);
              const isDirty = editedBooks[book.id] !== undefined;

              return (
                <View key={book.id} style={styles.bookCard}>
                  {/* LEFT: COVER & BASIC INFO */}
                  <View style={styles.bookTopRow}>
                    <Image
                      source={{ uri: book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c' }}
                      style={styles.bookCover}
                    />
                    <View style={styles.bookInfo}>
                      <Text style={styles.bookTitle} numberOfLines={2}>
                        {book.title}
                      </Text>
                      <Text style={styles.bookAuthor}>By {book.author}</Text>
                      <View style={styles.bookMetaRow}>
                        <Text style={styles.categoryBadge}>{book.category}</Text>
                        <Text style={styles.idBadge}>ID: {book.id.slice(0, 10)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* EDITABLE FIELDS */}
                  <View style={styles.editableFieldsGrid}>
                    {/* PRICE FIELD (INR <= 1000) */}
                    <View style={styles.fieldItem}>
                      <Text style={styles.fieldLabel}>Price in INR (₹) [Max ₹1000]</Text>
                      <View style={styles.fieldRupeeInputWrap}>
                        <Text style={styles.fieldRupeePrefix}>₹</Text>
                        <TextInput
                          style={styles.fieldRupeeInput}
                          keyboardType="numeric"
                          value={String(currentPrice)}
                          onChangeText={val => {
                            const num = Number(val);
                            if (num > 1000) {
                              Alert.alert('Price Limit', 'Book price cannot exceed ₹1000.');
                              handleFieldChange(book.id, 'price', 1000);
                            } else {
                              handleFieldChange(book.id, 'price', num || 0);
                            }
                          }}
                        />
                      </View>
                      {currentPrice > 1000 && (
                        <Text style={styles.limitError}>* Exceeds ₹1000 limit</Text>
                      )}
                    </View>

                    {/* PRIME TOGGLE */}
                    <View style={styles.fieldItem}>
                      <Text style={styles.fieldLabel}>Prime Badge</Text>
                      <TouchableOpacity
                        style={[styles.primeToggleBtn, currentIsPrime && styles.primeToggleActive]}
                        onPress={() => handleFieldChange(book.id, 'isPrime', !currentIsPrime)}
                      >
                        <Zap size={16} color={currentIsPrime ? '#00A8E1' : '#666'} />
                        <Text
                          style={[
                            styles.primeToggleText,
                            currentIsPrime ? { color: '#00A8E1', fontWeight: '800' } : { color: '#888' },
                          ]}
                        >
                          {currentIsPrime ? 'Prime Enabled' : 'Prime Disabled'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* DELIVERY TAG */}
                    <View style={[styles.fieldItem, { flex: 2 }]}>
                      <Text style={styles.fieldLabel}>Delivery Promise Tag</Text>
                      <View style={styles.deliveryInputWrap}>
                        <Truck size={16} color="#8D8D94" />
                        <TextInput
                          style={styles.deliveryTextInput}
                          value={currentDeliveryTag}
                          onChangeText={val => handleFieldChange(book.id, 'deliveryTag', val)}
                          placeholder="e.g. FREE delivery Tomorrow"
                          placeholderTextColor="#666"
                        />
                      </View>
                    </View>
                  </View>

                  {/* PREVIEW OF CONSUMER VIEW */}
                  <View style={styles.consumerPreviewBox}>
                    <Text style={styles.previewLabel}>Consumer View Preview:</Text>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewPrice}>₹{currentPrice}</Text>
                      {currentIsPrime && (
                        <View style={styles.previewPrimeBadge}>
                          <Text style={styles.previewPrimeText}>prime</Text>
                        </View>
                      )}
                      <Text style={styles.previewDeliveryText}>{currentDeliveryTag}</Text>
                    </View>
                  </View>

                  {/* SAVE BUTTON */}
                  <View style={styles.cardBottomRow}>
                    {isDirty && (
                      <Text style={styles.unsavedNotice}>• Unsaved changes pending</Text>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.saveBtn,
                        !isDirty && styles.saveBtnDisabled,
                        savingId === book.id && styles.saveBtnLoading,
                      ]}
                      disabled={!isDirty || savingId === book.id}
                      onPress={() => handleSaveBook(book.id)}
                    >
                      {savingId === book.id ? (
                        <ActivityIndicator size="small" color="#061A02" />
                      ) : (
                        <>
                          <Check size={16} color="#061A02" />
                          <Text style={styles.saveBtnText}>Save & Publish Tag</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* TAB 2: CONSUMER & DISTRIBUTOR DATABASE */}
      {activeTab === 'database' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* DATABASE STATS CARDS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{dbData.total || allUserList.length}</Text>
              <Text style={styles.statLabel}>Total Registered</Text>
            </View>
            <View style={[styles.statCard, { borderColor: 'rgba(0, 183, 255, 0.4)' }]}>
              <Text style={[styles.statNum, { color: '#00B7FF' }]}>
                {dbData.consumersCount || dbData.consumers?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Consumers</Text>
            </View>
            <View style={[styles.statCard, { borderColor: 'rgba(123, 234, 18, 0.4)' }]}>
              <Text style={[styles.statNum, { color: '#7BEA12' }]}>
                {dbData.distributorsCount || dbData.distributors?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Distributors</Text>
            </View>
          </View>

          {/* FILTER AND SEARCH */}
          <View style={styles.filterToolbar}>
            <View style={styles.dbFilterPills}>
              <TouchableOpacity
                style={[styles.filterPill, dbFilter === 'all' && styles.filterPillActive]}
                onPress={() => setDbFilter('all')}
              >
                <Text style={[styles.filterPillText, dbFilter === 'all' && styles.filterPillTextActive]}>
                  All Users
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, dbFilter === 'consumers' && styles.filterPillActive]}
                onPress={() => setDbFilter('consumers')}
              >
                <Text style={[styles.filterPillText, dbFilter === 'consumers' && styles.filterPillTextActive]}>
                  Consumers ({dbData.consumersCount || dbData.consumers?.length || 0})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, dbFilter === 'distributors' && styles.filterPillActive]}
                onPress={() => setDbFilter('distributors')}
              >
                <Text style={[styles.filterPillText, dbFilter === 'distributors' && styles.filterPillTextActive]}>
                  Distributors ({dbData.distributorsCount || dbData.distributors?.length || 0})
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dbSearchBox}>
              <Search size={16} color="#8D8D94" />
              <TextInput
                style={styles.dbSearchInput}
                placeholder="Search user name, email, ID..."
                placeholderTextColor="#666"
                value={dbSearch}
                onChangeText={setDbSearch}
              />
            </View>
          </View>

          {/* USER DATABASE TABLE / LIST */}
          <View style={styles.dbList}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No user records matching criteria.</Text>
              </View>
            ) : (
              filteredUsers.map((item, idx) => {
                const isItemDistributor = item.role === 'distributor';
                return (
                  <View key={item._id || item.id || idx} style={styles.userCard}>
                    <View style={styles.userCardHeader}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                          {(item.name || item.username || item.email || 'U').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userInfoCol}>
                        <View style={styles.userNameRow}>
                          <Text style={styles.userName}>{item.name || item.username || 'User'}</Text>
                          <View
                            style={[
                              styles.userRoleBadge,
                              isItemDistributor ? styles.roleDistributorBadge : styles.roleConsumerBadge,
                            ]}
                          >
                            <Text
                              style={[
                                styles.userRoleBadgeText,
                                isItemDistributor ? { color: '#7BEA12' } : { color: '#00B7FF' },
                              ]}
                            >
                              {item.role ? item.role.toUpperCase() : 'CONSUMER'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <Text style={styles.userIdMeta}>
                          ID: {item._id || item.id || 'N/A'} • Provider: {item.provider || 'local'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userCardFooter}>
                      <Text style={styles.userDateMeta}>
                        Joined: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active Member'}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.roleActionBtn,
                          isItemDistributor ? styles.demoteBtn : styles.promoteBtn,
                        ]}
                        onPress={async () => {
                          const targetRole = isItemDistributor ? 'consumer' : 'distributor';
                          try {
                            await authService.setRole(targetRole);
                            showToast(`Updated role for ${item.email} to ${targetRole}`);
                            fetchData();
                          } catch (e: any) {
                            Alert.alert('Error updating user', e.message);
                          }
                        }}
                      >
                        {isItemDistributor ? (
                          <>
                            <UserX size={14} color="#FF9900" />
                            <Text style={[styles.roleActionBtnText, { color: '#FF9900' }]}>
                              Change to Consumer
                            </Text>
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} color="#7BEA12" />
                            <Text style={[styles.roleActionBtnText, { color: '#7BEA12' }]}>
                              Promote to Distributor
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  accessContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#121218',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.3)',
    padding: 28,
  },
  accessTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  accessSubtitle: {
    color: '#8D8D94',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  currentIdBox: {
    backgroundColor: '#1B1B29',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  currentIdLabel: {
    color: '#8D8D94',
    fontSize: 11,
    fontWeight: '600',
  },
  currentIdValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  currentIdRole: {
    color: '#00B7FF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  activateDistributorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7BEA12',
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
  },
  activateDistributorBtnText: {
    color: '#061A02',
    fontSize: 14,
    fontWeight: '800',
  },
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#08080C',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#171722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  headerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7BEA12',
  },
  headerBadgeText: {
    color: '#7BEA12',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleTogglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 183, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 183, 255, 0.4)',
  },
  roleTogglePillText: {
    color: '#00B7FF',
    fontSize: 11,
    fontWeight: '700',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7BEA12',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  toastText: {
    color: '#061A02',
    fontSize: 13,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0D0D14',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#7BEA12',
    backgroundColor: 'rgba(123, 234, 18, 0.05)',
  },
  tabButtonText: {
    color: '#8D8D94',
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#7BEA12',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  ruleBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(123, 234, 18, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.3)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  ruleBannerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  ruleBannerDesc: {
    color: '#B8B8C2',
    fontSize: 12,
    lineHeight: 18,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121218',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  addBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7BEA12',
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addBookBtnText: {
    color: '#061A02',
    fontSize: 13,
    fontWeight: '800',
  },
  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#171722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFormCard: {
    backgroundColor: '#121218',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7BEA12',
    padding: 16,
    marginBottom: 18,
  },
  addFormTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 12,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    color: '#8D8D94',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#1B1B29',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: 13,
    paddingHorizontal: 12,
    height: 40,
  },
  currencyInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B1B29',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.4)',
    paddingHorizontal: 10,
    height: 40,
  },
  rupeePrefix: {
    color: '#7BEA12',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 6,
  },
  currencyTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#7BEA12',
    borderColor: '#7BEA12',
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  formCancelBtn: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCancelText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  formSubmitBtn: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#7BEA12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSubmitText: {
    color: '#061A02',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyWrap: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8D8D94',
    fontSize: 14,
  },
  bookCard: {
    backgroundColor: '#121218',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    marginBottom: 16,
  },
  bookTopRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  bookCover: {
    width: 64,
    height: 84,
    borderRadius: 8,
    backgroundColor: '#1B1B29',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  bookAuthor: {
    color: '#8D8D94',
    fontSize: 12,
    marginTop: 3,
  },
  bookMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#B8B8C2',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadge: {
    color: '#666',
    fontSize: 11,
    paddingVertical: 2,
  },
  editableFieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#181824',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  fieldItem: {
    flex: 1,
    minWidth: 140,
  },
  fieldLabel: {
    color: '#8D8D94',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  fieldRupeeInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121218',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.4)',
    paddingHorizontal: 8,
    height: 38,
  },
  fieldRupeePrefix: {
    color: '#7BEA12',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 4,
  },
  fieldRupeeInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  limitError: {
    color: '#FF453A',
    fontSize: 10,
    marginTop: 2,
  },
  primeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#121218',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
  },
  primeToggleActive: {
    borderColor: 'rgba(0, 168, 225, 0.5)',
    backgroundColor: 'rgba(0, 168, 225, 0.1)',
  },
  primeToggleText: {
    fontSize: 12,
  },
  deliveryInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#121218',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    height: 38,
  },
  deliveryTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
  },
  consumerPreviewBox: {
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 12,
  },
  previewLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  previewPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  previewPrimeBadge: {
    backgroundColor: '#00A8E1',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  previewPrimeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  previewDeliveryText: {
    color: '#8D8D94',
    fontSize: 11,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  unsavedNotice: {
    color: '#FF9900',
    fontSize: 11,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7BEA12',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnLoading: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#061A02',
    fontSize: 13,
    fontWeight: '800',
  },

  // DATABASE STYLES
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#121218',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    alignItems: 'center',
  },
  statNum: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: '#8D8D94',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  filterToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dbFilterPills: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#121218',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(123, 234, 18, 0.15)',
    borderColor: '#7BEA12',
  },
  filterPillText: {
    color: '#8D8D94',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#7BEA12',
    fontWeight: '700',
  },
  dbSearchBox: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121218',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    height: 38,
  },
  dbSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
  },
  dbList: {
    gap: 10,
  },
  userCard: {
    backgroundColor: '#121218',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
  },
  userCardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B1B29',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  userInfoCol: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleDistributorBadge: {
    backgroundColor: 'rgba(123, 234, 18, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.4)',
  },
  roleConsumerBadge: {
    backgroundColor: 'rgba(0, 183, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 183, 255, 0.4)',
  },
  userRoleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userEmail: {
    color: '#8D8D94',
    fontSize: 12,
    marginTop: 2,
  },
  userIdMeta: {
    color: '#555',
    fontSize: 10,
    marginTop: 3,
  },
  userCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  userDateMeta: {
    color: '#666',
    fontSize: 11,
  },
  roleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  promoteBtn: {
    backgroundColor: 'rgba(123, 234, 18, 0.1)',
    borderColor: 'rgba(123, 234, 18, 0.4)',
  },
  demoteBtn: {
    backgroundColor: 'rgba(255, 153, 0, 0.1)',
    borderColor: 'rgba(255, 153, 0, 0.4)',
  },
  roleActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
