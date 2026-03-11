import { StyleSheet, Pressable, View, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Components
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LevelNode } from '@/components/home/LevelNode'; 
import { useAuth } from '@/hooks/use-auth'; 
import { API_BASE_URL } from '@/constants/api';

export default function HomeScreen() {
  const router = useRouter();
  const [user, profile] = useAuth();

  const colors = {
    pageBg: "#0B0F14",
    cardBg: "#121922",
    accent: "#38BDF8",
    danger: "#FF4B4B",
    muted: "#778195",
  };

  // Learning Path Data
  const levels = [
    { id: 1, title: 'C Major Basics', isLocked: false },
    { id: 2, title: 'Perfect 5th', isLocked: false },
    { id: 3, title: 'Major Thirds', isLocked: true },
    { id: 4, title: 'Minor Scales', isLocked: true },
    { id: 5, title: 'Chord Progressions', isLocked: true },
  ];

  // --- DEBUG TEST FUNCTION ---
  const handleTestUpdate = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const newXp = (profile?.currentXp || 0) + 10;
      
      await fetch(`${API_BASE_URL}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentXp: newXp, authToken: token }),
      });
      Alert.alert("Sync Test", "XP Update Sent! Check if it updates on the UI.");
    } catch (e: any) {
      Alert.alert("Sync Error", e.message);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#0B0F14' }}
      headerImage={
        <Ionicons 
          name="musical-notes" 
          size={240} 
          color="rgba(56, 189, 248, 0.1)" 
          style={styles.headerIcon} 
        />
      }>
      
      {/* 1. WELCOME SECTION */}
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">Welcome, Musician! 🎹</ThemedText>
        <ThemedText style={{ color: colors.muted }}>Ready to sharpen your ears today?</ThemedText>
      </ThemedView>

      {/* 2. STATS ROW */}
      <ThemedView style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.cardBg }]}>
          <ThemedText style={{ fontSize: 20 }}>🔥</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.statText}>{profile?.streak || 0} Days</ThemedText>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.cardBg }]}>
          <ThemedText style={{ fontSize: 20 }}>⭐</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.statText}>{profile?.currentXp || 0} XP</ThemedText>
        </View>
      </ThemedView>

      {/* 3. THE LEARNING PATH (Zig-Zag Map) */}
      <ThemedView style={styles.pathContainer}>
        {levels.map((lvl, index) => {
          // Logic: Alternate Left and Right alignment
          const isLeft = index % 2 === 0;
          
          return (
            <LevelNode
              key={lvl.id}
              level={lvl.id}
              title={lvl.title}
              isLocked={lvl.isLocked}
              onPress={() => router.push('/pitch')}
              style={{
                alignSelf: isLeft ? 'flex-start' : 'flex-end',
                marginLeft: isLeft ? 30 : 0,
                marginRight: !isLeft ? 30 : 0,
              }}
            />
          );
        })}
      </ThemedView>

      {/* 4. ADMIN DEBUG */}
      <ThemedView style={styles.debugSection}>
        <Pressable onPress={handleTestUpdate} style={styles.debugButton}>
          <Ionicons name="bug-outline" size={18} color={colors.danger} />
          <ThemedText style={{ color: colors.danger, fontSize: 12, fontWeight: '700', marginLeft: 8 }}>
            DEV: TRIGGER +10 XP SYNC
          </ThemedText>
        </Pressable>
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statText: {
    color: '#F2F2F2',
  },
  pathContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  debugSection: {
    marginTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.2)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 75, 75, 0.05)',
  },
  headerIcon: {
    position: 'absolute',
    bottom: -60,
    right: -30,
  },
});
