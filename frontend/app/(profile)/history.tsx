import { View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function HistoryDetails() {
  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 12 }}>
      <ThemedText type="title">History</ThemedText>
      <ThemedText>
        This screen will show a full list of attempts with filters and search.
      </ThemedText>

      <View style={{ padding: 14, borderWidth: 1, borderRadius: 12, gap: 8 }}>
        <ThemedText type="subtitle">MVP Placeholder</ThemedText>
        <ThemedText>- Attempts list</ThemedText>
        <ThemedText>- Filter by difficulty</ThemedText>
        <ThemedText>- Sort by score/time</ThemedText>
      </View>
    </ThemedView>
  );
}
