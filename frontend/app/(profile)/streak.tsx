import { View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function StreakDetails() {
  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 12 }}>
      <ThemedText type="title">Streak</ThemedText>
      <ThemedText>
        This screen will show streak rules, calendar view, and daily challenge status.
      </ThemedText>

      <View style={{ padding: 14, borderWidth: 1, borderRadius: 12, gap: 8 }}>
        <ThemedText type="subtitle">MVP Placeholder</ThemedText>
        <ThemedText>- Current streak</ThemedText>
        <ThemedText>- Longest streak</ThemedText>
        <ThemedText>- Streak calendar</ThemedText>
      </View>
    </ThemedView>
  );
}
