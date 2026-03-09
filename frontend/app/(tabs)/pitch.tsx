import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, useColorScheme } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons'; 
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

// --- 🎹 PIANO SAMPLES ---
const NOTE_URLS: Record<string, string> = {
  'C': 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3/C4.mp3',
  'D': 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3/D4.mp3',
  'E': 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3/E4.mp3',
  'F': 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3/F4.mp3',
  'G': 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3/G4.mp3',
  'A': 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3/A4.mp3',
  'B': 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3/B4.mp3',
};

const NOTE_OPTIONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const DIFFICULTY_SECONDS: Record<Difficulty, number> = {
  Easy: 10, Medium: 6, Hard: 3,
};

let currentSound: Audio.Sound | null = null;

export default function PitchScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // --- 🎨 SYNCED COLORS FROM PROFILE ---
  const colors = useMemo(() => ({
    pageBg: isDark ? "#0B0F14" : "#F5F6FA",
    cardBg: isDark ? "#121922" : "#FFFFFF",
    cardBg2: isDark ? "#0F1720" : "#EEF2FF",
    border: isDark ? "#1F2A37" : "#E2E5EE",
    text: isDark ? "#F2F2F2" : "#111111",
    subText: isDark ? "#A7B0BE" : "#555555",
    muted: isDark ? "#778195" : "#7A7A7A",
    accent: isDark ? "#38BDF8" : "#2F6BFF",
    success: isDark ? "#22C55E" : "#16A34A",
    danger: isDark ? "#FF4B4B" : "#DC2626",
    chip: isDark ? "#0B1220" : "#F1F5FF",
  }), [isDark]);

  const [targetNote, setTargetNote] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'answering' | 'result'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(DIFFICULTY_SECONDS.Easy);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    return () => {
      if (currentSound) currentSound.unloadAsync();
    };
  }, []);

  const playNote = async (note: string) => {
    if (!note) return;
    try {
      if (currentSound) await currentSound.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        { uri: NOTE_URLS[note] },
        { shouldPlay: true, volume: 1.0 }
      );
      currentSound = sound;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.warn("Playback Error:", e);
    }
  };

  const startNewRound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const nextNote = NOTE_OPTIONS[Math.floor(Math.random() * NOTE_OPTIONS.length)];
    setTargetNote(nextNote);
    setSelectedNote(null);
    setState('answering');
    setSecondsLeft(DIFFICULTY_SECONDS[difficulty]);
    playNote(nextNote);
  };

  const handleSubmit = () => {
    const isCorrect = selectedNote === targetNote;
    Haptics.notificationAsync(isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setState('result');
  };

  useEffect(() => {
    if (state === 'answering' && secondsLeft > 0) {
      const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
      return () => clearInterval(id);
    } else if (secondsLeft === 0 && state === 'answering') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setState('result');
    }
  }, [state, secondsLeft]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.pageBg }]}>
      <View style={styles.header}>
        <Text style={[styles.titleText, { color: colors.text }]}>Pitch Training</Text>
      </View>

      <Pressable 
        onPress={() => state === 'answering' && playNote(targetNote)}
        disabled={state !== 'answering'}
        style={({ pressed }) => [
          styles.playHub,
          { backgroundColor: colors.cardBg, borderColor: colors.border },
          pressed && { opacity: 0.7 }
        ]}
      >
        <View style={styles.hubLeft}>
          <View style={[styles.statusIcon, { backgroundColor: state === 'answering' ? colors.success : colors.muted }]}>
            <Ionicons name={state === 'answering' ? "headset" : "play"} size={16} color="white" />
          </View>
          <View>
            <Text style={[styles.hubTitle, { color: colors.text }]}>Identify the Pitch</Text>
            <Text style={[styles.hubStatus, { color: colors.subText }]}>{state === 'answering' ? "Listening..." : "Ready"}</Text>
          </View>
        </View>
        {state === 'answering' && <Ionicons name="volume-high" size={18} color={colors.success} />}
      </Pressable>

      <View style={[styles.gameCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.cardInfo}>
          <View style={[styles.difficultyGroup, { backgroundColor: colors.pageBg }]}>
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
              <Pressable
                key={d}
                onPress={() => {
                  setDifficulty(d);
                  setSecondsLeft(DIFFICULTY_SECONDS[d]);
                  Haptics.selectionAsync();
                }}
                style={[styles.diffTab, difficulty === d && { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.diffTabText, { color: difficulty === d ? '#fff' : colors.subText }]}>{d}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.timerDisplay, { color: secondsLeft <= 3 ? colors.danger : colors.success }]}>
            {secondsLeft}s
          </Text>
        </View>

        <View style={styles.grid}>
          {NOTE_OPTIONS.map((note) => (
            <Pressable
              key={note}
              disabled={state !== 'answering'}
              onPress={() => {
                setSelectedNote(note);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              style={[
                styles.noteBtn,
                { borderColor: colors.border, backgroundColor: colors.cardBg2 },
                selectedNote === note && { borderColor: colors.accent, backgroundColor: colors.accent }
              ]}
            >
              <Text style={[styles.noteText, { color: selectedNote === note ? '#fff' : colors.text }]}>
                {note}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable 
          onPress={state === 'answering' ? handleSubmit : startNewRound}
          disabled={state === 'answering' && !selectedNote}
          style={[
            styles.actionBtn, 
            { backgroundColor: colors.accent }, 
            (state === 'answering' && !selectedNote) && { opacity: 0.3 }
          ]}
        >
          <Text style={styles.actionBtnText}>
            {state === 'answering' ? "SUBMIT ANSWER" : "START NEXT ROUND"}
          </Text>
        </Pressable>
      </View>

      {state === 'result' && (
        <View style={[
          styles.toast, 
          { backgroundColor: colors.cardBg, borderColor: selectedNote === targetNote ? colors.success : colors.danger }
        ]}>
          <Ionicons 
            name={selectedNote === targetNote ? "checkmark-circle" : "close-circle"} 
            size={18} 
            color={selectedNote === targetNote ? colors.success : colors.danger} 
          />
          <Text style={[styles.toastText, { color: colors.text }]}>
            {selectedNote === targetNote ? " PERFECT!" : ` WRONG, WAS ${targetNote}`}
          </Text>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  titleText: { fontSize: 30, fontWeight: '900' },
  playHub: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 18, borderWidth: 1, marginBottom: 20 },
  hubLeft: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  hubTitle: { fontSize: 16, fontWeight: '800' },
  hubStatus: { fontSize: 12, marginTop: 2 },
  gameCard: { padding: 20, borderRadius: 18, borderWidth: 1 },
  cardInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  difficultyGroup: { flexDirection: 'row', padding: 4, borderRadius: 10 },
  diffTab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  diffTabText: { fontSize: 12, fontWeight: '800' },
  timerDisplay: { fontSize: 20, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  noteBtn: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', margin: 8 },
  noteText: { fontSize: 20, fontWeight: '900' },
  footer: { marginTop: 'auto', marginBottom: 40 },
  actionBtn: { paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  toast: { position: 'absolute', bottom: 120, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 50, borderWidth: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  toastText: { fontWeight: '900', fontSize: 14, marginLeft: 8 }
});