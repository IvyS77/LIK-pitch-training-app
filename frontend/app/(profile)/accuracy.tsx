import { View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function AccuracyDetails() {
  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 12 }}>
      <ThemedText type="title">Accuracy</ThemedText>
      <ThemedText>
        This screen will show accuracy by difficulty, note, and trend over time.
      </ThemedText>

      <View style={{ padding: 14, borderWidth: 1, borderRadius: 12, gap: 8 }}>
        <ThemedText type="subtitle">MVP Placeholder</ThemedText>
        <ThemedText>- Accuracy (Easy/Medium/Hard)</ThemedText>
        <ThemedText>- Most missed notes</ThemedText>
        <ThemedText>- Weekly trend</ThemedText>
      </View>
    </ThemedView>
  );
}
