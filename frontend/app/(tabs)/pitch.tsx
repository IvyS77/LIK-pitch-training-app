import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

type GameState = 'answering' | 'submitting' | 'result';

const NOTE_OPTIONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const DIFFICULTY_SECONDS: Record<Difficulty, number> = {
  Easy: 10,
  Medium: 6,
  Hard: 3,
};

function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function PitchScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Duolingo-style colors
  const colors = {
    pageBg: isDark ? '#121212' : '#F5F6FA',
    cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
    border: isDark ? '#2A2A2A' : '#E2E5EE',
    text: isDark ? '#F2F2F2' : '#111111',
    subText: isDark ? '#B3B3B3' : '#555555',

    easy: isDark ? '#58CC02' : '#20A779',
    medium: isDark ? '#FFC800' : '#D97706',
    hard: isDark ? '#FF4B4B' : '#DC2626',

    optionBg: isDark ? '#1E1E1E' : '#FFFFFF',
    optionText: isDark ? '#F2F2F2' : '#111111',
    optionSelectedText: '#FFFFFF',

    primaryBtnText: '#FFFFFF',
  };

  const difficultyColor = (d: Difficulty) => {
    if (d === 'Easy') return colors.easy;
    if (d === 'Medium') return colors.medium;
    return colors.hard;
  };

  const [targetNote, setTargetNote] = useState<string>(() =>
    randomChoice(NOTE_OPTIONS)
  );
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [state, setState] = useState<GameState>('answering');
  const [result, setResult] = useState<{
    correct: boolean;
    score: number;
    feedback: string;
  } | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [secondsLeft, setSecondsLeft] = useState<number>(
    DIFFICULTY_SECONDS.Easy
  );

  const canSubmit = useMemo(
    () => state === 'answering' && selectedNote !== null,
    [state, selectedNote]
  );

  const startNewRound = () => {
    setTargetNote(randomChoice(NOTE_OPTIONS));
    setSelectedNote(null);
    setResult(null);
    setState('answering');
    setSecondsLeft(DIFFICULTY_SECONDS[difficulty]);
  };

  useEffect(() => {
    if (state === 'answering') {
      setSecondsLeft(DIFFICULTY_SECONDS[difficulty]);
    }
  }, [difficulty, state]);

  useEffect(() => {
    if (state !== 'answering') return;

    if (secondsLeft <= 0) {
      setResult({
        correct: false,
        score: 0,
        feedback: "Time's up!",
      });
      setState('result');
      return;
    }

    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [state, secondsLeft]);

  const onSubmit = async () => {
    if (!canSubmit) return;

    setState('submitting');
    await new Promise((r) => setTimeout(r, 500));

    const correct = selectedNote === targetNote;
    setResult({
      correct,
      score: correct ? 100 : 40,
      feedback: correct ? 'Nice! You got it.' : `Close — it was ${targetNote}.`,
    });
    setState('result');
  };

  const cardStyle = {
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    borderColor: colors.border,
  } as const;

  return (
    <ThemedView style={{ flex: 1, padding: 16, backgroundColor: colors.pageBg }}>
      <ThemedText type="title" style={{ color: colors.text, marginBottom: 12 }}>
        Pitch Exercise
      </ThemedText>

      <View style={cardStyle}>
        <ThemedText type="subtitle" style={{ color: colors.text }}>
          Listen and identify the pitch
        </ThemedText>

        {/* Difficulty selector */}
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => {
            const active = difficulty === d;
            const disabled = state !== 'answering';

            return (
              <Pressable
                key={d}
                onPress={() => setDifficulty(d)}
                disabled={disabled}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: active ? difficultyColor(d) : colors.border,
                  backgroundColor: active ? difficultyColor(d) : colors.optionBg,
                  marginRight: 8,
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    fontWeight: '800',
                    color: active ? '#FFFFFF' : colors.optionText,
                  }}
                >
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ fontSize: 16, color: colors.text, marginTop: 12 }}>
          Target note:{' '}
          <Text style={{ fontWeight: '800' }}>{targetNote}</Text>
        </Text>

        <Text style={{ fontSize: 16, marginTop: 8 }}>
          Time left:{' '}
          <Text style={{ fontWeight: '900', color: difficultyColor(difficulty) }}>
            {secondsLeft}s
          </Text>
        </Text>

        <Text style={{ color: colors.subText, marginTop: 10 }}>
          Select the note you think it is:
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {NOTE_OPTIONS.map((note) => {
            const isSelected = selectedNote === note;
            const disabled = state !== 'answering';

            return (
              <Pressable
                key={note}
                disabled={disabled}
                onPress={() => setSelectedNote(note)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isSelected
                    ? difficultyColor(difficulty)
                    : colors.border,
                  backgroundColor: isSelected
                    ? difficultyColor(difficulty)
                    : colors.optionBg,
                  marginRight: 8,
                  marginBottom: 8,
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: isSelected ? '#FFFFFF' : colors.optionText,
                  }}
                >
                  {note}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Submit */}
      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit || state !== 'answering'}
        style={({ pressed }) => ({
          marginTop: 14,
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: canSubmit ? difficultyColor(difficulty) : 'transparent',
          borderWidth: 1,
          borderColor: canSubmit ? 'transparent' : colors.border,
          alignItems: 'center',
          opacity: pressed ? 0.85 : canSubmit ? 1 : 0.35,
        })}
      >
        {state === 'submitting' ? (
          <ActivityIndicator color={colors.primaryBtnText} />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: '800', color: canSubmit ? '#FFFFFF' : colors.text }}>
            Submit
          </Text>
        )}
      </Pressable>

      {/* Result */}
      <View style={[cardStyle, { marginTop: 14 }]}>
        <ThemedText type="subtitle" style={{ color: colors.text }}>
          Result
        </ThemedText>

        {!result ? (
          <Text style={{ color: colors.subText }}>
            Submit an answer to see feedback.
          </Text>
        ) : (
          <>
            <Text style={{ fontWeight: '900', color: colors.text, marginTop: 6 }}>
              {result.correct ? '✅ Correct' : '❌ Incorrect'}
            </Text>
            <Text style={{ color: colors.text }}>Score: {result.score}</Text>
            <Text style={{ color: colors.text }}>{result.feedback}</Text>

            <Pressable
              onPress={startNewRound}
              style={({ pressed }) => ({
                marginTop: 10,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: difficultyColor(difficulty),
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>Next</Text>
            </Pressable>
          </>
        )}
      </View>
    </ThemedView>
  );
}
