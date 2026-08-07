import React, { useState, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { books, categories, featuredBooks, newArrivals, bestsellers, Book } from '../data/books';
import BookCard from '../components/BookCard';
import CategoryPill from '../components/CategoryPill';
import SectionHeader from '../components/SectionHeader';
import SpinningCardTransition from '../components/SpinningCardTransition';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showSpinTransition, setShowSpinTransition] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredBooks = activeCategory === 'All' ? books : books.filter((b: Book) => b.category === activeCategory);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleCardPress = useCallback((book: Book) => {
    setSelectedBook(book);
    setShowSpinTransition(true);
  }, []);

  const handleSpinComplete = useCallback(() => {
    setShowSpinTransition(false);
    if (selectedBook) {
      navigation.navigate('ProductDetail', { book: selectedBook });
    }
  }, [selectedBook, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <Text style={styles.stickyTitle}>BOOKSTORE</Text>
      </Animated.View>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={['rgba(26,10,0,0.8)', 'rgba(10,10,10,0.95)']} style={StyleSheet.absoluteFill} />
          <View style={[styles.glassBlock, { right: -20, top: 80, width: 140, height: 180, backgroundColor: `${colors.accent.blue}20`, transform: [{ rotate: '12deg' }] }]} />
          <View style={[styles.glassBlock, { right: 30, top: 200, width: 100, height: 140, backgroundColor: `${colors.accent.purple}18`, transform: [{ rotate: '-8deg' }] }]} />
          <View style={[styles.glassBlock, { right: 90, top: 120, width: 80, height: 100, backgroundColor: `${colors.accent.orange}22`, transform: [{ rotate: '5deg' }] }]} />
          <View style={styles.heroContent}>
            <View style={styles.heroOverline}>
              <Text style={styles.heroOverlineText}>CURATED COLLECTION</Text>
            </View>
            <Text style={styles.heroHeadline}>
              DISTRIBUTE{'\n'}
              <Text style={{ color: colors.accent.orange }}>KNOWLEDGE</Text>{'\n'}
              AT SCALE
            </Text>
            <Text style={styles.heroSub}>A curated marketplace for readers who decide to move forward.</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {categories.map((cat: string) => (
              <CategoryPill key={cat} label={cat} isActive={activeCategory === cat} onPress={() => setActiveCategory(cat)} />
            ))}
          </ScrollView>
        </View>

        {/* Featured */}
        <SectionHeader title="FEATURED" subtitle="Handpicked reads for you" accentColor={colors.accent.orange} onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {featuredBooks.map((book: Book) => (
            <BookCard key={book.id} book={book} variant="featured" onPress={handleCardPress} />
          ))}
        </ScrollView>

        {/* New Arrivals */}
        <SectionHeader title="NEW" subtitle="Fresh off the press" accentColor={colors.accent.blue} onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {newArrivals.map((book: Book) => (
            <BookCard key={book.id} book={book} onPress={handleCardPress} />
          ))}
        </ScrollView>

        {/* Bestsellers */}
        <SectionHeader title="BESTSELLERS" subtitle="What everyone is reading" accentColor={colors.accent.purple} onSeeAll={() => {}} />
        <View style={styles.verticalList}>
          {bestsellers.map((book: Book) => (
            <BookCard key={book.id} book={book} variant="horizontal" onPress={handleCardPress} />
          ))}
        </View>

        {/* All Books */}
        <SectionHeader title="ALL BOOKS" subtitle={`${filteredBooks.length} titles`} accentColor={colors.accent.teal} />
        <View style={styles.grid}>
          {filteredBooks.map((book: Book) => (
            <BookCard key={book.id} book={book} onPress={handleCardPress} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
      <SpinningCardTransition book={selectedBook} visible={showSpinTransition} onComplete={handleSpinComplete} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: 'rgba(10, 10, 10, 0.95)', paddingTop: 50, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  stickyTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  hero: { height: 400, paddingHorizontal: 24, paddingTop: 70, paddingBottom: 30, position: 'relative', overflow: 'hidden' },
  glassBlock: { position: 'absolute', borderRadius: 20, borderWidth: 1, borderColor: colors.glassBorder },
  heroContent: { position: 'relative', zIndex: 2 },
  heroOverline: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, backgroundColor: 'rgba(255, 107, 53, 0.12)', borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255, 107, 53, 0.25)', marginBottom: 20 },
  heroOverlineText: { color: colors.accent.orange, fontSize: 10, fontWeight: '800', letterSpacing: 2.5 },
  heroHeadline: { color: colors.text.primary, fontSize: 44, fontWeight: '900', letterSpacing: -2.5, lineHeight: 48, marginBottom: 20, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 20 },
  heroSub: { color: colors.text.secondary, fontSize: 14, lineHeight: 24, maxWidth: 260, fontWeight: '500' },
  categoriesContainer: { marginTop: 24, marginBottom: 8 },
  categoriesContent: { paddingHorizontal: 20, paddingVertical: 4 },
  horizontalScroll: { paddingHorizontal: 20, paddingBottom: 8 },
  verticalList: { paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 16, justifyContent: 'space-between' },
  bottomSpacer: { height: 100 },
});

export default HomeScreen;