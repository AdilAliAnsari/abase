import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Star, ShoppingCart } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { Book } from '../data/books';

const { width } = Dimensions.get('window');

interface BookCardProps {
  book: Book;
  layout?: 'list' | 'grid';
  onPress?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, layout = 'list', onPress }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: any) => {
    // Prevent propagating event to parent card (which triggers navigation)
    if (Platform.OS === 'web') {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Helper to render rating stars
  const renderStars = (rating: number, size: number = 13) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const color = filled ? '#FF9900' : '#E7E7E7';
          return (
            <Star
              key={star}
              size={size}
              color={color}
              fill={filled ? '#FF9900' : 'transparent'}
            />
          );
        })}
      </View>
    );
  };

  const hasDiscount = !!book.originalPrice && book.originalPrice > book.price;
  const discountPercent = hasDiscount
    ? Math.round(((book.originalPrice! - book.price) / book.originalPrice!) * 100)
    : 0;

  if (Platform.OS === 'web') {
    const isList = layout === 'list';
    return (
      <>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onPress?.(book);
          }}
          className={`amazon-card ${isList ? 'amazon-card-list' : 'amazon-card-grid'}`}
        >
          {/* Cover Image Wrapper */}
          <div className="img-wrap">
            {book.badge && (
              <span className={`badge-label badge-${book.badge.toLowerCase()}`}>
                {book.badge}
              </span>
            )}
            <img src={book.coverImage} className="book-img" alt={book.title} />
          </div>

          {/* Details Content */}
          <div className="details-wrap">
            <h3 className="title-text">{book.title}</h3>
            <p className="author-text">by {book.author}</p>

            {/* Ratings Row */}
            <div className="ratings-container">
              <div className="stars-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star-char ${star <= Math.floor(book.rating) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-val">{book.rating}</span>
              <span className="review-count">({book.reviews.toLocaleString()})</span>
            </div>

            {/* Price Details */}
            <div className="price-row">
              <span className="current-price">${book.price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="original-price">${book.originalPrice!.toFixed(2)}</span>
                  <span className="discount-tag">({discountPercent}% off)</span>
                </>
              )}
            </div>

            {/* Shipping & Badges */}
            <div className="delivery-row">
              <span className="prime-text"><i>prime</i></span>
              <span className="delivery-msg">FREE delivery <b>Tomorrow</b></span>
            </div>

            {/* Category badge */}
            <div className="category-tag">{book.category}</div>

            {/* Yellow Add to Cart Button */}
            <button
              className={`cart-button ${isAdded ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={14} style={{ marginRight: 6 }} />
              {isAdded ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </a>

        <style>{`
          .amazon-card {
            background: ${colors.background};
            font-family: system-ui, -apple-system, sans-serif;
            text-decoration: none;
            color: ${colors.primaryText};
            display: flex;
            box-sizing: border-box;
            border-bottom: 1px solid ${colors.border};
            transition: background-color 0.15s;
          }
          .amazon-card:hover {
            background-color: ${colors.surface};
          }
          
          /* List layout specific styles */
          .amazon-card-list {
            width: 100%;
            padding: 14px 16px;
            gap: 20px;
            align-items: flex-start;
          }
          .amazon-card-list .img-wrap {
            width: 120px;
            height: 170px;
            flex-shrink: 0;
            background: ${colors.background};
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            position: relative;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .amazon-card-list .book-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .amazon-card-list .details-wrap {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            position: relative;
          }

          /* Grid layout specific styles */
          .amazon-card-grid {
            width: calc(50% - 10px);
            max-width: 230px;
            flex-direction: column;
            border: 1px solid ${colors.border};
            border-radius: 8px;
            padding: 12px;
            gap: 12px;
            align-items: stretch;
            margin-bottom: 20px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }
          @media (max-width: 550px) {
            .amazon-card-grid {
              width: 100%;
              max-width: none;
            }
          }
          .amazon-card-grid .img-wrap {
            height: 150px;
            background: ${colors.background};
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            position: relative;
          }
          .amazon-card-grid .book-img {
            max-height: 100%;
            max-width: 100%;
            object-fit: contain;
          }
          .amazon-card-grid .details-wrap {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          /* General Card Items */
          .badge-label {
            position: absolute;
            top: 6px;
            left: 6px;
            color: white;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 2;
          }
          .badge-bestseller { background: #c45500; }
          .badge-new { background: #007600; }
          .badge-hot { background: #a435f0; }

          .title-text {
            font-size: 15px;
            font-weight: 600;
            line-height: 1.3;
            margin: 0 0 3px 0;
            color: ${colors.primaryText};
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .author-text {
            font-size: 13px;
            color: ${colors.secondaryText};
            margin: 0 0 6px 0;
          }
          
          .ratings-container {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            margin-bottom: 6px;
          }
          .stars-wrap {
            color: #FF9900;
            display: flex;
          }
          .star-char {
            font-size: 14px;
            line-height: 1;
            color: #333344;
          }
          .star-char.filled {
            color: #ff9900;
          }
          .rating-val {
            font-weight: 600;
            color: ${colors.primaryText};
          }
          .review-count {
            color: #69D900;
            cursor: pointer;
          }
          .review-count:hover {
            color: ${colors.accentGreen};
            text-decoration: underline;
          }

          .price-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            margin-bottom: 6px;
          }
          .current-price {
            font-size: 18px;
            font-weight: 700;
            color: ${colors.primaryText};
          }
          .original-price {
            font-size: 13px;
            color: ${colors.mutedText};
            text-decoration: line-through;
          }
          .discount-tag {
            font-size: 12px;
            color: ${colors.danger};
            font-weight: 600;
          }

          .delivery-row {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: ${colors.secondaryText};
            margin-bottom: 10px;
          }
          .prime-text {
            color: #69D900;
            font-weight: 900;
            font-size: 14px;
          }
          
          .category-tag {
            font-size: 11px;
            background: ${colors.controlBackground};
            color: ${colors.secondaryText};
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 600;
            margin-bottom: 12px;
          }

          .cart-button {
            background: ${colors.buttonBackground};
            border: 1px solid ${colors.accentGreenDark};
            border-radius: 100px;
            padding: 6px 16px;
            font-size: 12px;
            font-weight: 500;
            color: ${colors.buttonText};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            outline: none;
            transition: background-color 0.15s;
          }
          .cart-button:hover {
            background: ${colors.buttonHover};
          }
          .cart-button.added {
            background: #067d62;
            border-color: #056b54;
            color: white;
          }
        `}</style>
      </>
    );
  }

  // Native UI
  const isList = layout === 'list';
  const cardWidth = isList ? width - 24 : (width / 2) - 16;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(book)}
      style={[
        styles.nativeCard,
        isList ? styles.nativeCardList : styles.nativeCardGrid,
        { width: cardWidth },
      ]}
    >
      {/* Image Panel */}
      <View style={isList ? styles.nativeImgWrapList : styles.nativeImgWrapGrid}>
        <Image source={{ uri: book.coverImage }} style={styles.nativeImg} resizeMode="contain" />
        {book.badge && (
          <View style={[
            styles.nativeBadge,
            book.badge === 'BESTSELLER' ? styles.nativeBadgeBestseller : styles.nativeBadgeNew,
          ]}>
            <Text style={styles.nativeBadgeText}>{book.badge}</Text>
          </View>
        )}
      </View>

      {/* Details Panel */}
      <View style={styles.nativeDetailsWrap}>
        <Text style={styles.nativeTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.nativeAuthor}>by {book.author}</Text>

        {/* Ratings */}
        <View style={styles.nativeRatingsContainer}>
          {renderStars(book.rating)}
          <Text style={styles.nativeRatingText}>{book.rating}</Text>
          <Text style={styles.nativeReviewCount}>({book.reviews.toLocaleString()})</Text>
        </View>

        {/* Price */}
        <View style={styles.nativePriceRow}>
          <Text style={styles.nativePrice}>${book.price.toFixed(2)}</Text>
          {hasDiscount && (
            <>
              <Text style={styles.nativeOriginalPrice}>${book.originalPrice!.toFixed(2)}</Text>
              <Text style={styles.nativeDiscount}>({discountPercent}% off)</Text>
            </>
          )}
        </View>

        {/* Delivery Details */}
        <View style={styles.nativeDeliveryRow}>
          <Text style={styles.nativePrime}>prime</Text>
          <Text style={styles.nativeDeliveryText}>FREE delivery Tomorrow</Text>
        </View>

        {/* Category tag */}
        <View style={styles.nativeCategoryTag}>
          <Text style={styles.nativeCategoryText}>{book.category}</Text>
        </View>

        {/* Yellow Cart Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.nativeCartBtn, isAdded && styles.nativeCartBtnAdded]}
          onPress={handleAddToCart}
        >
          <Text style={[styles.nativeCartBtnText, isAdded && styles.nativeCartBtnTextAdded]}>
            {isAdded ? '✓ Added' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nativeCard: {
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  nativeCardList: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  nativeCardGrid: {
    flexDirection: 'column',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    gap: 8,
  },
  nativeImgWrapList: {
    width: 100,
    height: 140,
    backgroundColor: colors.background,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nativeImgWrapGrid: {
    height: 130,
    backgroundColor: colors.background,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  nativeImg: {
    width: '90%',
    height: '90%',
  },
  nativeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  nativeBadgeBestseller: {
    backgroundColor: '#C45500',
  },
  nativeBadgeNew: {
    backgroundColor: '#007600',
  },
  nativeBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
  nativeDetailsWrap: {
    flex: 1,
    flexDirection: 'column',
  },
  nativeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 2,
  },
  nativeAuthor: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  nativeRatingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1.5,
  },
  nativeRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryText,
  },
  nativeReviewCount: {
    fontSize: 11,
    color: colors.accent.blue,
  },
  nativePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  nativePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
  },
  nativeOriginalPrice: {
    fontSize: 12,
    color: colors.mutedText,
    textDecorationLine: 'line-through',
  },
  nativeDiscount: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
  },
  nativeDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  nativePrime: {
    color: '#69D900',
    fontSize: 12,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  nativeDeliveryText: {
    color: colors.secondaryText,
    fontSize: 11,
  },
  nativeCategoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.controlBackground,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    marginBottom: 8,
  },
  nativeCategoryText: {
    color: colors.secondaryText,
    fontSize: 10,
    fontWeight: '600',
  },
  nativeCartBtn: {
    backgroundColor: colors.buttonBackground,
    borderColor: colors.accentGreenDark,
    borderWidth: 1,
    borderRadius: 20,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 140,
  },
  nativeCartBtnAdded: {
    backgroundColor: '#067D62',
    borderColor: '#056B54',
  },
  nativeCartBtnText: {
    color: colors.buttonText,
    fontSize: 11,
    fontWeight: '600',
  },
  nativeCartBtnTextAdded: {
    color: '#FFFFFF',
  },
});

export default BookCard;