import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity style={[styles.pill, isActive && styles.pillActive]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, marginRight: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  pillActive: { backgroundColor: 'rgba(255, 107, 53, 0.2)', borderColor: 'rgba(255, 107, 53, 0.4)', shadowColor: colors.accent.orange, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  pillText: { color: colors.text.secondary, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: colors.text.primary, fontWeight: '700' },
});

export default CategoryPill;