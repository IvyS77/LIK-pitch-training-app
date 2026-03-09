import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons'; 
import * as Tone from "tone";
import * as Haptics from 'expo-haptics';

// --- 🎹 GLOBAL AUDIO SINGLETON (Prevents AudioParam Errors) ---
let globalSynth: Tone.Synth | null = null;

const NOTE_OPTIONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const DIFFICULTY_SECONDS: Record<Difficulty, number> = {
  Easy: 10, Medium: 6, Hard: 3,
};

export default function PitchScreen() {
  const [targetNote, setTargetNote] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'answering' | 'result'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(DIFFICULTY_SECONDS.Easy);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');

  const initAndPlay = async (note: string) => {
    if (!note) return;
    try {
      await Tone.start();
      if (!globalSynth) {
        globalSynth = new Tone.Synth({
          oscillator: { type: "triangle" },
          envelope: { attack: 0.1, release: 1 }
        }).toDestination();
      }
      if (Tone.getContext().state !== 'running') {
        await Tone.getContext().resume();
      }
      const now = Tone.now();
      globalSynth.triggerAttackRelease(`${note}4`, "4n", now + 0.1);
    } catch (e) {
      console.warn("Audio initialized via singleton.");
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
    
    initAndPlay(nextNote);
  };

  const handleSubmit = () => {
    const isCorrect = selectedNote === targetNote;
    
    // --- 🎯 FEEDBACK LOGIC ---
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

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
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.titleText}>Pitch Training</ThemedText>
      </View>

      {/* 🎧 SLEEK AUDIO HUB */}
      <Pressable 
        onPress={() => state === 'answering' && initAndPlay(targetNote)}
        disabled={state !== 'answering'}
        style={({ pressed }) => [
          styles.playHub,
          pressed && { opacity: 0.6 }
        ]}
      >
        <View style={styles.hubLeft}>
          <View style={[styles.statusIcon, { backgroundColor: state === 'answering' ? "#1DB954" : "#334155" }]}>
            <Ionicons name={state === 'answering' ? "headset" : "play"} size={14} color="white" />
          </View>
          <View>
            <Text style={styles.hubTitle}>Identify the Pitch</Text>
            <Text style={styles.hubStatus}>{state === 'answering' ? "Listening..." : "Ready"}</Text>
          </View>
        </View>
        {state === 'answering' && (
          <Ionicons name="volume-high" size={16} color="#1DB954" />
        )}
      </Pressable>

      <View style={styles.gameCard}>
        <View style={styles.cardInfo}>
          <View style={styles.difficultyGroup}>
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
              <Pressable
                key={d}
                onPress={() => {
                  setDifficulty(d);
                  setSecondsLeft(DIFFICULTY_SECONDS[d]);
                  Haptics.selectionAsync();
                }}
                style={[styles.diffTab, difficulty === d && styles.diffTabActive]}
              >
                <Text style={[styles.diffTabText, difficulty === d && { color: '#fff' }]}>{d}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.timerDisplay, secondsLeft <= 3 && { color: '#EF4444' }]}>
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
                selectedNote === note && styles.noteBtnActive
              ]}
            >
              <Text style={[styles.noteText, { color: selectedNote === note ? '#fff' : '#94A3B8' }]}>
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
          style={[styles.actionBtn, (state === 'answering' && !selectedNote) && { opacity: 0.2 }]}
        >
          <Text style={styles.actionBtnText}>
            {state === 'answering' ? "SUBMIT ANSWER" : "START NEXT ROUND"}
          </Text>
        </Pressable>
      </View>

      {/* FLOATING RESULT BADGE */}
      {state === 'result' && (
        <View style={[
          styles.toast, 
          { borderColor: selectedNote === targetNote ? "#1DB954" : "#EF4444" }
        ]}>
          <Ionicons 
            name={selectedNote === targetNote ? "checkmark-circle" : "close-circle"} 
            size={18} 
            color={selectedNote === targetNote ? "#1DB954" : "#EF4444"} 
          />
          <Text style={styles.toastText}>
            {selectedNote === targetNote ? " PERFECT! YOU GOT IT." : ` WRONG, IT WAS ${targetNote}`}
          </Text>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, backgroundColor: "#020617" },
  header: { marginBottom: 15 },
  titleText: { color: "#F8FAFC", fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  
  playHub: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 14, borderRadius: 16, backgroundColor: "#0F172A", 
    borderWidth: 1, borderColor: "#1E293B", marginBottom: 20
  },
  hubLeft: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  hubTitle: { fontSize: 14, fontWeight: '700', color: "#F1F5F9" },
  hubStatus: { fontSize: 10, color: '#64748B', textTransform: 'uppercase' },

  gameCard: { padding: 20, borderRadius: 24, backgroundColor: "#0F172A", borderStyle: 'dashed', borderWidth: 1, borderColor: "#334155" },
  cardInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  difficultyGroup: { flexDirection: 'row', backgroundColor: '#020617', padding: 4, borderRadius: 10 },
  diffTab: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 7 },
  diffTabActive: { backgroundColor: "#1DB954" },
  diffTabText: { fontSize: 11, fontWeight: '800', color: '#475569' },
  timerDisplay: { fontSize: 18, fontWeight: '900', color: "#1DB954" },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  noteBtn: { width: 54, height: 54, borderRadius: 16, borderWidth: 1, borderColor: "#1E293B", justifyContent: 'center', alignItems: 'center', margin: 8 },
  noteBtnActive: { backgroundColor: "#1DB954", borderColor: "#1DB954" },
  noteText: { fontSize: 18, fontWeight: '800' },
  
  footer: { marginTop: 'auto', marginBottom: 40 },
  actionBtn: { backgroundColor: '#1DB954', paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  
  toast: { 
    position: 'absolute', bottom: 120, alignSelf: 'center', 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: "#F8FAFC", paddingVertical: 12, paddingHorizontal: 20, 
    borderRadius: 50, borderWidth: 2, shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 10
  },
  toastText: { color: '#020617', fontWeight: '900', fontSize: 13, marginLeft: 8 }
});
