import { useMemo, useState } from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

type Attempt = {
  id: string;
  createdAtLabel: string;
  difficulty: Difficulty;
  target: string;
  answer: string;
  score: number;
};

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();

  const colors = useMemo(
    () => ({
      // Duolingo-like neutrals (no purple tint)
      pageBg: isDark ? '#121212' : '#F5F6FA',
      cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
      border: isDark ? '#2A2A2A' : '#E2E5EE',

      text: isDark ? '#F2F2F2' : '#111111',
      subText: isDark ? '#B3B3B3' : '#555555',

      // Duolingo-ish accents
      accent: isDark ? '#58CC02' : '#2F6BFF',
      good: isDark ? '#58CC02' : '#20A779',
      warn: isDark ? '#FFC800' : '#D97706',
      bad: isDark ? '#FF4B4B' : '#DC2626',

      // surfaces
      surface: isDark ? '#181818' : '#FAFBFF',
      surface2: isDark ? '#232323' : '#E9ECF5',
    }),
    [isDark]
  );

  // MVP placeholders
  const [displayName] = useState('Ivy');
  const [level] = useState(3);
  const [xp] = useState(240);
  const [xpToNext] = useState(400);
  const [streakDays] = useState(4);

  const progress = Math.min(1, xpToNext === 0 ? 0 : xp / xpToNext);

  const [attempts] = useState<Attempt[]>([
    { id: 'a1', createdAtLabel: 'Today', difficulty: 'Easy', target: 'C', answer: 'C', score: 100 },
    { id: 'a2', createdAtLabel: 'Today', difficulty: 'Medium', target: 'G', answer: 'A', score: 40 },
    { id: 'a3', createdAtLabel: 'Yesterday', difficulty: 'Hard', target: 'E', answer: 'E', score: 100 },
  ]);

  const cardStyle = {
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    borderColor: colors.border,
  } as const;

  const pillStyle = (bg: string) =>
    ({
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: bg,
    } as const);

  const difficultyColor = (d: Difficulty) => {
    if (d === 'Easy') return colors.good;
    if (d === 'Medium') return colors.warn;
    return colors.bad;
  };

  const pressableCard = (pressed: boolean) => ({
    opacity: pressed ? 0.88 : 1,
  });

  return (
    <ThemedView style={{ flex: 1, padding: 16, backgroundColor: colors.pageBg }}>
      {/* Header */}
      <View style={{ marginBottom: 14 }}>
        <ThemedText type="title" style={{ color: colors.text }}>
          Profile
        </ThemedText>
        <Text style={{ color: colors.subText, marginTop: 4 }}>
          Welcome back, <Text style={{ fontWeight: '800', color: colors.text }}>{displayName}</Text>
        </Text>
      </View>

      {/* Progress (clickable) */}
      <Pressable
        onPress={() => router.push('/(profile)/progress')}
        style={({ pressed }) => [pressableCard(pressed), { marginBottom: 12 }]}
      >
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Progress
            </ThemedText>
            <View style={pillStyle(colors.accent)}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Level {level}</Text>
            </View>
          </View>

          <Text style={{ color: colors.subText, marginTop: 10 }}>
            XP: <Text style={{ color: colors.text, fontWeight: '900' }}>{xp}</Text> / {xpToNext}
          </Text>

          {/* Progress bar */}
          <View
            style={{
              height: 12,
              borderRadius: 999,
              backgroundColor: colors.surface2,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
              marginTop: 10,
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: colors.accent,
              }}
            />
          </View>

          <Text style={{ color: colors.subText, marginTop: 10 }}>
            {Math.max(0, xpToNext - xp)} XP to next level
          </Text>
        </View>
      </Pressable>

      {/* Daily streak + quick stats */}
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <Pressable
          onPress={() => router.push('/(profile)/streak')}
          style={({ pressed }) => [pressableCard(pressed), { flex: 1, marginRight: 6 }]}
        >
          <View style={[cardStyle, { minHeight: 110, justifyContent: 'center' }]}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Streak
            </ThemedText>
            <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 8 }}>
              {streakDays}
            </Text>
            <Text style={{ color: colors.subText, marginTop: 4 }}>days in a row</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(profile)/accuracy')}
          style={({ pressed }) => [pressableCard(pressed), { flex: 1, marginLeft: 6 }]}
        >
          <View style={[cardStyle, { minHeight: 110, justifyContent: 'center' }]}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Accuracy
            </ThemedText>
            <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 8 }}>
              78%
            </Text>
            <Text style={{ color: colors.subText, marginTop: 4 }}>last 7 days</Text>
          </View>
        </Pressable>
      </View>

      {/* Recent activity */}
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            Recent Activity
          </ThemedText>

          <Pressable
            onPress={() => router.push('/(profile)/history')}
            style={({ pressed }) => [
              {
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.cardBg,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text style={{ color: colors.text, fontWeight: '800' }}>View all</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 12 }}>
          {attempts.map((a) => (
            <View
              key={a.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                padding: 12,
                backgroundColor: colors.surface,
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.subText }}>{a.createdAtLabel}</Text>
                <View style={pillStyle(difficultyColor(a.difficulty))}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{a.difficulty}</Text>
                </View>
              </View>

              <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, marginTop: 8 }}>
                Target: {a.target} · Answer: {a.answer}
              </Text>

              <Text style={{ color: colors.subText, marginTop: 6 }}>
                Score: <Text style={{ color: colors.text, fontWeight: '900' }}>{a.score}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}
