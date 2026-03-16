import { StyleSheet, Pressable, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ExploreScreen() {
  const colors = {
    cardBg: "#121922",
    accent: "#38BDF8",
    pianoGold: "#F59E0B",
    muted: "#778195",
  };

  // Professional Piano Modules
  const categories = [
    {
      title: 'Keyboard Layout',
      icon: 'musical-notes',
      color: '#38BDF8',
      desc: 'Visualize intervals on the 88-key bed'
    },
    {
      title: 'Piano Chords',
      icon: 'layers',
      color: '#A855F7',
      desc: 'Identify complex triads & inversions'
    },
    {
      title: 'Grand Samples',
      icon: 'mic-outline',
      color: '#22C55E',
      desc: 'Studio-recorded Steinway D-274 audio'
    },
    {
      title: 'Sight Reading',
      icon: 'eye',
      color: '#F59E0B',
      desc: 'Connect sheet music directly to keys'
    },
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#0B0F14' }}
      headerImage={
        <Ionicons
          size={310}
          name="musical-notes-outline"
          style={styles.headerImage}
          color="rgba(56, 189, 248, 0.05)"
        />
      }>

      {/* HEADER SECTION */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Piano Studio</ThemedText>
        <ThemedText style={{ color: colors.muted }}>
          Advanced ear training for professional pianists
        </ThemedText>
      </ThemedView>

      {/* FEATURED: CONCERT GRAND BANNER */}
      <LinearGradient
        colors={['#1E293B', '#334155']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredCard}
      >
        <View style={styles.featuredTextContent}>
          <ThemedText style={styles.featuredTitle}>Concert Grand Pro</ThemedText>
          <ThemedText style={styles.featuredSub}>
            Unlocked: High-Fidelity 24-bit Samples
          </ThemedText>
          <View style={styles.tag}>
            <ThemedText style={styles.tagText}>CURRENT PREVIEW</ThemedText>
          </View>
        </View>
        <Ionicons name="piano-outline" size={70} color="rgba(56, 189, 248, 0.2)" />
      </LinearGradient>

      {/* GRID: PIANO MODULES */}
      <ThemedView style={styles.gridContainer}>
        {categories.map((item, index) => (
          <Pressable key={index} style={[styles.gridItem, { backgroundColor: colors.cardBg }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.itemDesc}>
              {item.desc}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>

      {/* PEDAGOGY QUOTE (Makes it look academic) */}
      <ThemedView style={styles.quoteCard}>
        <ThemedText style={styles.quoteText}>
          "The piano keys are black and white, but in your mind, they should sound like a thousand colors."
        </ThemedText>
        <ThemedText style={styles.quoteAuthor}>— Classical Methodology</ThemedText>
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -40,
    position: 'absolute'
  },
  titleContainer: {
    marginBottom: 24,
    gap: 4
  },
  featuredCard: {
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featuredTextContent: {
    flex: 1
  },
  featuredTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900'
  },
  featuredSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4
  },
  tag: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 12
  },
  tagText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '47%',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 }
    })
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  itemTitle: {
    fontSize: 15,
    color: '#F2F2F2'
  },
  itemDesc: {
    fontSize: 11,
    color: '#778195',
    marginTop: 6,
    lineHeight: 16
  },
  quoteCard: {
    marginTop: 30,
    padding: 30,
    alignItems: 'center'
  },
  quoteText: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#52525B',
    fontSize: 14,
    lineHeight: 22
  },
  quoteAuthor: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1
  }
});
