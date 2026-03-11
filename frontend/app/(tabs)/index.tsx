import { StyleSheet, Pressable, View, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Components from your starter kit
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth'; 
import { API_BASE_URL } from '@/constants/api'; // Ensure this points to Luigi's backend

export default function HomeScreen() {
  const router = useRouter();
  const [user, profile] = useAuth(); // Removed updateProfile from hook destructuring

  const colors = {
    pageBg: "#0B0F14",
    cardBg: "#121922",
    accent: "#38BDF8",
    success: "#22C55E",
    danger: "#FF4B4B",
    text: "#F2F2F2",
    muted: "#778195",
  };

  // --- MANUAL UPDATE FUNCTION ---
  // We define this here to ensure it's not 'undefined'
  const updateProfileData = async (update: any) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...update, authToken: token }),
      });
      return response;
    } catch (error) {
      console.error("Update failed:", error);
      throw error;
    }
  };

  // --- DEBUG TEST FUNCTION ---
  const handleTestUpdate = async () => {
    try {
      // Adds 10 XP to current total to test the sync
      const newXp = (profile?.currentXp || 0) + 10;
      await updateProfileData({ currentXp: newXp });
      Alert.alert("Sync Test", "Update request sent! Check if XP increases on the UI.");
    } catch (e: any) {
      Alert.alert("Sync Error", e.message);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Ionicons 
          name="musical-notes" 
          size={220} 
          color="rgba(56, 189, 248, 0.15)" 
          style={styles.headerIcon} 
        />
      }>
      
      {/* 1. WELCOME SECTION */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome, {profile?.firstName || 'Musician'}! 🎹</ThemedText>
        <ThemedText style={{ color: colors.muted }}>Ready to sharpen your ears today?</ThemedText>
      </ThemedView>

      {/* 2. STATS ROW (Synced with Kevin's DB) */}
      <ThemedView style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.cardBg }]}>
          <ThemedText style={styles.statEmoji}>🔥</ThemedText>
          <View>
            <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
              {profile?.streak || 0} Days
            </ThemedText>
            <ThemedText style={styles.statLabel}>Streak</ThemedText>
          </View>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: colors.cardBg }]}>
          <ThemedText style={styles.statEmoji}>⭐</ThemedText>
          <View>
            <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
              {profile?.currentXp || 0} XP
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* 3. MAIN ACTION: PITCH TRAINING */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Daily Training</ThemedText>
        <Pressable 
          onPress={() => router.push('/pitch')}
          style={({ pressed }) => [
            styles.mainCard, 
            { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 }
          ]}
        >
          <View style={styles.cardContent}>
            <Ionicons name="play-circle" size={40} color="white" />
            <View>
              <ThemedText style={styles.cardTitle}>Pitch Training</ThemedText>
              <ThemedText style={styles.cardSubtext}>Identify notes and earn XP</ThemedText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Pressable>
      </ThemedView>

      {/* 4. ACCOUNT SECTION */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Account</ThemedText>
        <Pressable 
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [
            styles.subCard, 
            { backgroundColor: colors.cardBg, opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Ionicons name="person-circle-outline" size={28} color={colors.accent} />
          <ThemedText style={styles.subCardText}>View Profile & Accuracy</ThemedText>
        </Pressable>
      </ThemedView>

      {/* 5. ADMIN DEBUG (Verify Luigi's API & Kevin's Rules) */}
      <ThemedView style={[styles.sectionContainer, { marginTop: 10 }]}>
        <ThemedText type="subtitle" style={{ color: colors.danger }}>Admin Debug</ThemedText>
        <Pressable 
          onPress={handleTestUpdate}
          style={({ pressed }) => [
            styles.debugButton, 
            { borderColor: colors.danger, opacity: pressed ? 0.6 : 1 }
          ]}
        >
          <Ionicons name="bug-outline" size={20} color={colors.danger} />
          <ThemedText style={{ color: colors.danger, fontWeight: '700', marginLeft: 8 }}>
            Trigger +10 XP Sync Test
          </ThemedText>
        </Pressable>
        <ThemedText style={styles.debugHint}>
          Click to verify if backend API and DB Rules are working together.
        </ThemedText>
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { marginBottom: 20, gap: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statEmoji: { fontSize: 24 },
  statLabel: { fontSize: 11, color: '#778195', textTransform: 'uppercase', fontWeight: '700' },
  sectionContainer: { gap: 12, marginBottom: 24 },
  mainCard: { 
    padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...Platform.select({
      ios: { shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  cardSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  subCard: { padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center' },
  subCardText: { marginLeft: 12, fontSize: 16, fontWeight: '700' },
  debugButton: { 
    padding: 15, borderRadius: 15, borderStyle: 'dashed', 
    borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' 
  },
  debugHint: { fontSize: 11, color: '#778195', textAlign: 'center', marginTop: 4 },
  headerIcon: { position: 'absolute', bottom: -40, right: -20 },
});
