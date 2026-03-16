import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Star, Lock, Check } from "lucide-react-native";
import { useState, useEffect } from "react";
import { getWeeklyChallenges, type WeeklyChallenge } from "../lib/weekly";
import { useRouter } from "expo-router";
import Svg, { Line, Circle } from "react-native-svg";

const X_OFFSETS = [0, 60, 30, -30, -60, -30, 30];

export default function WeeklyPath() {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const router = useRouter();

  useEffect(() => {
    getWeeklyChallenges().then(setChallenges);
  }, []);

  return (
    <View style={styles.container}>
      {challenges.map((ch, i) => (
        <View key={ch.day} style={styles.nodeWrapper}>

          {/* Connector line */}
          {i > 0 && (
            <Svg width={120} height={32} style={styles.connector}>
              <Line
                x1={60 - (X_OFFSETS[i] - X_OFFSETS[i - 1]) / 2}
                y1="0"
                x2={60 + (X_OFFSETS[i] - X_OFFSETS[i - 1]) / 2}
                y2="32"
                stroke="#2a2a3d"
                strokeWidth="3"
                strokeDasharray={ch.locked ? "6,4" : undefined}
              />
            </Svg>
          )}

          {/* Node button */}
          <Animated.View
            entering={ZoomIn.delay(i * 80).springify().stiffness(300)}
            style={{ marginLeft: X_OFFSETS[i] }}
          >
            <TouchableOpacity
              onPress={() => {
                if (!ch.locked && !ch.completed) router.push("/pitch?daily=true");
              }}
              disabled={ch.locked}
              activeOpacity={ch.locked || ch.completed ? 1 : 0.8}
              style={styles.nodeButton}
            >
              {/* Progress arc ring for today */}
              {ch.isToday && !ch.completed && (
                <Svg width={88} height={88} style={styles.arcRing}>
                  <Circle
                    cx="44" cy="44" r="40"
                    fill="none"
                    stroke="#2a2a3d"
                    strokeWidth="4"
                    strokeDasharray="8,6"
                  />
                </Svg>
              )}

              {/* Main circle */}
              <View style={[
                styles.circle,
                ch.completed || ch.isToday
                  ? styles.circleActive
                  : ch.locked
                  ? styles.circleLocked
                  : styles.circleIdle,
              ]}>
                {ch.completed ? (
                  <Check size={24} strokeWidth={3} color="#fff" />
                ) : ch.locked ? (
                  <Lock size={18} color="#666" />
                ) : (
                  <Star size={24} strokeWidth={2.5} color={ch.isToday ? "#fff" : "#666"} />
                )}
              </View>

              {/* Day label */}
              <Text style={[
                styles.dayLabel,
                ch.isToday ? styles.dayLabelActive : styles.dayLabelIdle,
              ]}>
                {ch.dayShort}
              </Text>

            </TouchableOpacity>
          </Animated.View>

        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
  nodeWrapper: {
    alignItems: "center",
  },
  connector: {
    marginBottom: -4,
  },
  nodeButton: {
    alignItems: "center",
    marginBottom: 32,
  },
  arcRing: {
    position: "absolute",
    top: -12,
    left: -12,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    backgroundColor: "#a855f7",
    borderColor: "#a855f7",
  },
  circleLocked: {
    backgroundColor: "#1a1a2e",
    borderColor: "#2a2a3d",
  },
  circleIdle: {
    backgroundColor: "#1e1e2e",
    borderColor: "#2a2a3d",
  },
  dayLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  dayLabelActive: {
    color: "#a855f7",
  },
  dayLabelIdle: {
    color: "#666",
  },
});