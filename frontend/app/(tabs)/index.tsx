import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Flame, Zap, Trophy, Target } from "lucide-react-native";
import { useState, useEffect } from "react";
import { loadProgressAsync, type UserProgress } from "@/lib/progression";
import XPBar from "../../components/XPBar";
import WeeklyPath from "../../components/WeeklyPath";
import { useRouter } from "expo-router";

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadProgressAsync().then(setProgress);
  }, []);

  const router = useRouter();

  if (!progress) return null;

  const accuracy = progress.totalAnswers > 0
    ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100)
    : 0;

  const stats = [
    { icon: Flame, label: "Streak", value: `${progress.streak}`, color: "#ef4444" },
    { icon: Zap, label: "Level", value: progress.level, color: "#facc15" },
    { icon: Trophy, label: "Done", value: progress.exercisesCompleted, color: "#a855f7" },
    { icon: Target, label: "Accuracy", value: `${accuracy}%`, color: "#3b82f6" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>



      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <Animated.View
            key={s.label}
            entering={FadeInDown.delay(i * 60)}
            style={styles.statItem}
          >
            <s.icon size={16} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
          </Animated.View>
        ))}
      </View>

      <XPBar progress={progress} />

      <Animated.View entering={FadeInDown.delay(200)} style={styles.banner}>
        <Text style={styles.bannerLabel}>THIS WEEK</Text>
        <Text style={styles.bannerTitle}>Daily Pitch Challenges</Text>
      </Animated.View>

      <WeeklyPath />

      <Animated.View entering={FadeInDown.delay(500)}>
        <TouchableOpacity
          style={styles.quickPlay}
          onPress={() => router.push("/pitch")}
          activeOpacity={0.95}
        >
          <View>
            <Text style={styles.quickPlayTitle}>Free Practice</Text>
            <Text style={styles.quickPlaySub}>Train at your own pace</Text>
          </View>
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>PLAY</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 96,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  banner: {
    borderRadius: 16,
    backgroundColor: "#a855f7",
    padding: 16,
  },
  bannerLabel: {
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.7,
    color: "#fff",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
  },
  quickPlay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#1e1e2e",
  },
  quickPlayTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#fff",
  },
  quickPlaySub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  playButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  playButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
});