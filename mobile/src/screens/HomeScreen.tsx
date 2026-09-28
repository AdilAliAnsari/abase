import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { books, Book } from '../data/books';
import BookCard from '../components/BookCard';
import Header from '../components/Header';
import DarkGradientBg from '../components/DarkGradientBg';
import { SlidersHorizontal, ArrowUpDown, LayoutGrid, LayoutList, X, Star } from 'lucide-react-native';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Layout state
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  // Filter Drawer state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempCategory, setTempCategory] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');

  // Price range filters
  const [tempPriceFilter, setTempPriceFilter] = useState<'all' | 'under20' | '20to25' | 'over25' | 'custom'>('all');
  const [activePriceFilter, setActivePriceFilter] = useState<'all' | 'under20' | '20to25' | 'over25' | 'custom'>('all');
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');
  const [activeMinPrice, setActiveMinPrice] = useState('');
  const [activeMaxPrice, setActiveMaxPrice] = useState('');

  // Rating filters
  const [tempRatingFilter, setTempRatingFilter] = useState<number>(0);
  const [activeRatingFilter, setActiveRatingFilter] = useState<number>(0);

  // Badge/Deal filter
  const [tempBadgeFilter, setTempBadgeFilter] = useState<'all' | 'bestseller' | 'new'>('all');
  const [activeBadgeFilter, setActiveBadgeFilter] = useState<'all' | 'bestseller' | 'new'>('all');

  // Sorting state
  const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'rating'>('featured');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // Web body background control
  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleEl = document.getElementById('amazon-body-style');
      if (!styleEl) {
        const style = document.createElement('style');
        style.id = 'amazon-body-style';
        style.innerHTML = `
          body { 
            background-color: #000000 !important; 
            margin: 0;
            padding: 0;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  // Sync temporary filter states when modal opens
  const openFilterModal = () => {
    setTempCategory(activeCategory);
    setTempPriceFilter(activePriceFilter);
    setTempMinPrice(activeMinPrice);
    setTempMaxPrice(activeMaxPrice);
    setTempRatingFilter(activeRatingFilter);
    setTempBadgeFilter(activeBadgeFilter);
    setIsFilterModalOpen(true);
  };

  const applyFilters = () => {
    setActiveCategory(tempCategory);
    setActivePriceFilter(tempPriceFilter);
    setActiveMinPrice(tempMinPrice);
    setActiveMaxPrice(tempMaxPrice);
    setActiveRatingFilter(tempRatingFilter);
    setActiveBadgeFilter(tempBadgeFilter);
    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setTempCategory('All');
    setTempPriceFilter('all');
    setTempMinPrice('');
    setTempMaxPrice('');
    setTempRatingFilter(0);
    setTempBadgeFilter('all');
  };

  const resetAllAppliedFilters = () => {
    setActiveCategory('All');
    setActivePriceFilter('all');
    setActiveMinPrice('');
    setActiveMaxPrice('');
    setActiveRatingFilter(0);
    setActiveBadgeFilter('all');
    setSearchQuery('');
  };

  // Active filters count for displaying badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== 'All') count++;
    if (activePriceFilter !== 'all') count++;
    if (activeRatingFilter > 0) count++;
    if (activeBadgeFilter !== 'all') count++;
    return count;
  }, [activeCategory, activePriceFilter, activeRatingFilter, activeBadgeFilter]);

  // Compute results matching the CURRENT filters
  const filteredAndSortedBooks = useMemo(() => {
    let result = books.filter((book: Book) => {
      // 1. Search Query
      const matchesSearch =
        searchQuery.trim() === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category
      const matchesCategory =
        activeCategory === 'All' || book.category === activeCategory;

      // 3. Price
      let matchesPrice = true;
      if (activePriceFilter === 'under20') {
        matchesPrice = book.price < 20;
      } else if (activePriceFilter === '20to25') {
        matchesPrice = book.price >= 20 && book.price <= 25;
      } else if (activePriceFilter === 'over25') {
        matchesPrice = book.price > 25;
      } else if (activePriceFilter === 'custom') {
        const min = activeMinPrice ? parseFloat(activeMinPrice) : 0;
        const max = activeMaxPrice ? parseFloat(activeMaxPrice) : Infinity;
        matchesPrice = book.price >= min && book.price <= max;
      }

      // 4. Ratings
      const matchesRating = book.rating >= activeRatingFilter;

      // 5. Badge format
      let matchesBadge = true;
      if (activeBadgeFilter === 'bestseller') {
        matchesBadge = book.badge === 'BESTSELLER';
      } else if (activeBadgeFilter === 'new') {
        matchesBadge = book.badge === 'NEW';
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesBadge;
    });

    // Sort operations
    if (sortBy === 'priceLow') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    searchQuery,
    activeCategory,
    activePriceFilter,
    activeMinPrice,
    activeMaxPrice,
    activeRatingFilter,
    activeBadgeFilter,
    sortBy,
  ]);

  // Compute results matching the TEMPORARY filters (inside modal)
  const tempFilteredCount = useMemo(() => {
    return books.filter((book: Book) => {
      // 1. Search Query
      const matchesSearch =
        searchQuery.trim() === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category
      const matchesCategory =
        tempCategory === 'All' || book.category === tempCategory;

      // 3. Price
      let matchesPrice = true;
      if (tempPriceFilter === 'under20') {
        matchesPrice = book.price < 20;
      } else if (tempPriceFilter === '20to25') {
        matchesPrice = book.price >= 20 && book.price <= 25;
      } else if (tempPriceFilter === 'over25') {
        matchesPrice = book.price > 25;
      } else if (tempPriceFilter === 'custom') {
        const min = tempMinPrice ? parseFloat(tempMinPrice) : 0;
        const max = tempMaxPrice ? parseFloat(tempMaxPrice) : Infinity;
        matchesPrice = book.price >= min && book.price <= max;
      }

      // 4. Ratings
      const matchesRating = book.rating >= tempRatingFilter;

      // 5. Badge format
      let matchesBadge = true;
      if (tempBadgeFilter === 'bestseller') {
        matchesBadge = book.badge === 'BESTSELLER';
      } else if (tempBadgeFilter === 'new') {
        matchesBadge = book.badge === 'NEW';
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesBadge;
    }).length;
  }, [
    searchQuery,
    tempCategory,
    tempPriceFilter,
    tempMinPrice,
    tempMaxPrice,
    tempRatingFilter,
    tempBadgeFilter,
  ]);

  const handleCardPress = useCallback((book: Book) => {
    navigation.navigate('ProductDetail', { book });
  }, [navigation]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'featured': return 'Sort: Featured';
      case 'priceLow': return 'Sort: Price: Low to High';
      case 'priceHigh': return 'Sort: Price: High to Low';
      case 'rating': return 'Sort: Avg. Review';
      default: return 'Sort';
    }
  };

  const isGrid = layout === 'grid';

  return (
    <DarkGradientBg>
      <View style={styles.screenBg}>
        <SafeAreaView style={styles.container}>
          {/* Amazon Header */}
          <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Filter and Sort Sub-Bar */}
        <View style={styles.controlsBar}>
          {/* Advanced Filter Trigger */}
          <TouchableOpacity style={styles.controlBtn} onPress={openFilterModal}>
            <SlidersHorizontal size={16} color="#FFFFFF" />
            <Text style={styles.controlBtnText}>Filters</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Sort Selection Trigger */}
          <TouchableOpacity style={styles.controlBtn} onPress={() => setIsSortModalOpen(true)}>
            <ArrowUpDown size={16} color="#FFFFFF" />
            <Text style={styles.controlBtnText}>{getSortLabel()}</Text>
          </TouchableOpacity>

          {/* Layout Toggle */}
          <TouchableOpacity style={styles.layoutToggleBtn} onPress={() => setLayout(isGrid ? 'list' : 'grid')}>
            {isGrid ? (
              <LayoutList size={20} color="#FFFFFF" />
            ) : (
              <LayoutGrid size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search status bar */}
        {searchQuery.trim() !== '' && (
          <View style={styles.searchStatus}>
            <Text style={styles.searchStatusText}>
              Results for <Text style={styles.searchQueryHighlight}>"{searchQuery}"</Text>
            </Text>
          </View>
        )}

        {/* Scrollable Books View */}
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredAndSortedBooks.length === 0 ? (
            <View style={styles.noResultsCard}>
              <Text style={styles.noResultsTitle}>No results found.</Text>
              <Text style={styles.noResultsText}>Try checking your filters or search terms for any spelling mistakes.</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={resetAllAppliedFilters}>
                <Text style={styles.resetBtnText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={isGrid ? styles.gridContainer : styles.listContainer}>
              {filteredAndSortedBooks.map((book: Book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  layout={layout}
                  onPress={handleCardPress}
                />
              ))}
            </View>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Advanced Filters Modal (Drawer) */}
        <Modal
          visible={isFilterModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsFilterModalOpen(false)}
        >
          <View style={styles.filterModalContainer}>
            <View style={styles.filterDrawerHeader}>
              <Text style={styles.filterDrawerTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={styles.closeModalBtn}>
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterDrawerContent} showsVerticalScrollIndicator={false}>
              {/* Category Filter */}
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterOptionsGrid}>
                {['All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Business', 'Self-Help', 'Design', 'Technology'].map((cat) => {
                  const selected = tempCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.filterPill, selected && styles.filterPillSelected]}
                      onPress={() => setTempCategory(cat)}
                    >
                      <Text style={[styles.filterPillText, selected && styles.filterPillTextSelected]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.sectionDivider} />

              {/* Price Filter */}
              <Text style={styles.filterSectionTitle}>Price</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity style={styles.radioRow} onPress={() => setTempPriceFilter('all')}>
                  <View style={[styles.radioButton, tempPriceFilter === 'all' && styles.radioButtonSelected]} />
                  <Text style={styles.radioLabel}>All Prices</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioRow} onPress={() => setTempPriceFilter('under20')}>
                  <View style={[styles.radioButton, tempPriceFilter === 'under20' && styles.radioButtonSelected]} />
                  <Text style={styles.radioLabel}>Under $20</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioRow} onPress={() => setTempPriceFilter('20to25')}>
                  <View style={[styles.radioButton, tempPriceFilter === '20to25' && styles.radioButtonSelected]} />
                  <Text style={styles.radioLabel}>$20 to $25</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioRow} onPress={() => setTempPriceFilter('over25')}>
                  <View style={[styles.radioButton, tempPriceFilter === 'over25' && styles.radioButtonSelected]} />
                  <Text style={styles.radioLabel}>Over $25</Text>
                </TouchableOpacity>
                
                {/* Custom price inputs */}
                <TouchableOpacity style={styles.radioRow} onPress={() => setTempPriceFilter('custom')}>
                  <View style={[styles.radioButton, tempPriceFilter === 'custom' && styles.radioButtonSelected]} />
                  <Text style={styles.radioLabel}>Custom Price Range</Text>
                </TouchableOpacity>
                
                {tempPriceFilter === 'custom' && (
                  <View style={styles.customPriceInputs}>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Min"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={tempMinPrice}
                      onChangeText={setTempMinPrice}
                    />
                    <Text style={styles.priceRangeSeparator}>to</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Max"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={tempMaxPrice}
                      onChangeText={setTempMaxPrice}
                    />
                  </View>
                )}
              </View>

              <View style={styles.sectionDivider} />

              {/* Rating Filter */}
              <Text style={styles.filterSectionTitle}>Avg. Customer Review</Text>
              <View style={styles.radioGroup}>
                {[0, 4, 3, 2].map((minRating) => {
                  const selected = tempRatingFilter === minRating;
                  return (
                    <TouchableOpacity
                      key={minRating}
                      style={styles.radioRow}
                      onPress={() => setTempRatingFilter(minRating)}
                    >
                      <View style={[styles.radioButton, selected && styles.radioButtonSelected]} />
                      {minRating === 0 ? (
                        <Text style={styles.radioLabel}>Any Rating</Text>
                      ) : (
                        <View style={styles.starsLabelRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={15}
                              color="#FF9900"
                              fill={star <= minRating ? '#FF9900' : 'transparent'}
                              style={{ marginRight: 2 }}
                            />
                          ))}
                          <Text style={styles.radioLabelStars}>& Up</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.sectionDivider} />

              {/* Format Filter */}
              <Text style={styles.filterSectionTitle}>Badge & Format</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity style={styles.radioRow} onPress={() => setTempBadgeFilter('all')}>
                  <View style={[styles.radioButton, tempBadgeFilter === 'all' && styles.radioButtonSelected]} />
                  <Text style={styles.radioLabel}>All Formats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioRow} onPress={() => setTempBadgeFilter('bestseller')}>
                  <View style={[styles.radioButton, tempBadgeFilter === 'bestseller' && styles.radioButtonSelected]} />
                  <Text style={styles.radioLabel}>Bestsellers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioRow} onPress={() => setTempBadgeFilter('new')}>
                  <View style={[styles.radioButton, tempBadgeFilter === 'new' && styles.radioButtonSelected]} />
                  <Text style={styles.radioLabel}>New Releases</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 60 }} />
            </ScrollView>

            {/* Sticky bottom modal action buttons */}
            <View style={styles.filterDrawerFooter}>
              <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFiltersBtn} onPress={applyFilters}>
                <Text style={styles.applyFiltersBtnText}>Show {tempFilteredCount} Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Sort Modal */}
        <Modal
          visible={isSortModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsSortModalOpen(false)}
        >
          <TouchableOpacity
            style={styles.sortOverlay}
            activeOpacity={1}
            onPress={() => setIsSortModalOpen(false)}
          >
            <View style={styles.sortOptionsCard}>
              <Text style={styles.sortTitle}>Sort By</Text>
              {[
                { key: 'featured', label: 'Featured' },
                { key: 'priceLow', label: 'Price: Low to High' },
                { key: 'priceHigh', label: 'Price: High to Low' },
                { key: 'rating', label: 'Avg. Customer Review' },
              ].map((opt) => {
                const selected = sortBy === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.sortOptionRow, selected && styles.sortOptionRowSelected]}
                    onPress={() => {
                      setSortBy(opt.key as any);
                      setIsSortModalOpen(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, selected && styles.sortOptionTextSelected]}>
                      {opt.label}
                    </Text>
                    {selected && <Text style={styles.sortTick}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>

        </SafeAreaView>
      </View>
    </DarkGradientBg>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  controlsBar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.controlBackground,
    gap: 6,
  },
  controlBtnText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: '500',
  },
  badgeCount: {
    backgroundColor: '#C45500',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeCountText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  layoutToggleBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.controlBackground,
  },
  searchStatus: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  searchStatusText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  searchQueryHighlight: {
    fontWeight: '700',
    color: colors.primaryText,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  listContainer: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  noResultsCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: colors.buttonBackground,
    borderColor: colors.accentGreenDark,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  resetBtnText: {
    color: colors.buttonText,
    fontWeight: '600',
    fontSize: 13,
  },
  bottomSpacer: {
    height: 90,
  },
  
  // Filter Drawer Styles
  filterModalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  filterDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterDrawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
  },
  closeModalBtn: {
    padding: 4,
  },
  filterDrawerContent: {
    flex: 1,
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    backgroundColor: colors.controlBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterPillSelected: {
    backgroundColor: colors.accentGreen,
    borderColor: colors.accentGreenDark,
  },
  filterPillText: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '500',
  },
  filterPillTextSelected: {
    color: colors.buttonText,
    fontWeight: '600',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  radioGroup: {
    flexDirection: 'column',
    gap: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.mutedText,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.accentGreen,
    backgroundColor: colors.accentGreen,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '500',
  },
  customPriceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 30,
    marginTop: 4,
  },
  priceInput: {
    width: 80,
    height: 34,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 14,
    color: colors.primaryText,
    backgroundColor: colors.controlBackground,
  },
  priceRangeSeparator: {
    marginHorizontal: 8,
    color: colors.secondaryText,
  },
  starsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabelStars: {
    fontSize: 13,
    color: colors.secondaryText,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterDrawerFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 12,
  },
  clearFiltersBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFiltersBtnText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  applyFiltersBtn: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.buttonBackground,
    borderColor: colors.accentGreenDark,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFiltersBtnText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Sort Overlay Styles
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortOptionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: Dimensions.get('window').width * 0.85,
    maxWidth: 340,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionRowSelected: {
    backgroundColor: colors.controlBackground,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  sortOptionTextSelected: {
    fontWeight: '600',
    color: colors.primaryText,
  },
  sortTick: {
    color: colors.accentGreen,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default HomeScreen;