import React, { useRef, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { Book } from '../data/books';

interface SpinningCardTransitionProps {
  book: Book | null;
  visible: boolean;
  onComplete: () => void;
}

const SpinningCardTransition: React.FC<SpinningCardTransitionProps> = ({ book, visible, onComplete }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const borderSpinAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible && book) {
      spinAnim.setValue(0);
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
      borderSpinAnim.setValue(0);
      glowOpacity.setValue(0.6);

      Animated.parallel([
        Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(borderSpinAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
          onComplete();
        });
      });
    }
  }, [visible, book]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-90deg'] });
  const borderSpin = borderSpinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const borderScaleX = spinAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.34] });
  const borderScaleY = spinAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.77] });

  if (!visible || !book) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.container, { opacity: opacityAnim, transform: [{ rotate: spin }, { scale: scaleAnim }] }]}>
        <Animated.View style={[styles.spinBorder, { transform: [{ rotate: borderSpin }, { scaleX: borderScaleX }, { scaleY: borderScaleY }] }]}>
          <LinearGradient colors={[colors.accent.magenta, colors.accent.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]}>
          <LinearGradient colors={['#fc00ff', '#00dbde']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <View style={styles.card}>
          <Image source={{ uri: book.coverImage }} style={styles.cardImage} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>{book.title}</Text>
            <Text style={styles.cardAuthor}>{book.author}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  container: { width: 200, height: 280, justifyContent: 'center', alignItems: 'center' },
  spinBorder: { position: 'absolute', width: 210, height: 290, borderRadius: 14, zIndex: -1 },
  glow: { position: 'absolute', width: 200, height: 280, borderRadius: 10, transform: [{ scale: 0.95 }], zIndex: -2, shadowColor: '#fc00ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 20 },
  card: { width: 190, height: 270, backgroundColor: '#000', borderRadius: 10, padding: 12, justifyContent: 'flex-end', gap: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardImage: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, resizeMode: 'cover' },
  cardInfo: { marginTop: 'auto' },
  cardTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cardAuthor: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
});

export default SpinningCardTransition;