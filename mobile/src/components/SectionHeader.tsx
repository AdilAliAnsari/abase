import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  accentColor?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, onSeeAll, accentColor = colors.accent.orange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
          <Text style={styles.seeAllArrow}>→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 16, marginTop: 32 },
  textContainer: { flex: 1 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -1.5, textTransform: 'uppercase', lineHeight: 32, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  subtitle: { fontSize: 13, color: colors.text.secondary, marginTop: 6, fontWeight: '500' },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  seeAllText: { fontSize: 13, color: colors.text.secondary, fontWeight: '600' },
  seeAllArrow: { fontSize: 13, color: colors.text.secondary },
});

export default SectionHeader;