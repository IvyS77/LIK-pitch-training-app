import { View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function ProgressDetails() {
  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 12 }}>
      <ThemedText type="title">Progress</ThemedText>
      <ThemedText>
        This screen will show XP breakdown, level history, and progress charts.
      </ThemedText>

      <View style={{ padding: 14, borderWidth: 1, borderRadius: 12, gap: 8 }}>
        <ThemedText type="subtitle">MVP Placeholder</ThemedText>
        <ThemedText>- XP earned today</ThemedText>
        <ThemedText>- XP earned this week</ThemedText>
        <ThemedText>- Level-up milestones</ThemedText>
      </View>
    </ThemedView>
  );
}
