import { auth, backend, uploadImage } from "@/firebaseConfig";
import { useAuth, UserProfile } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [user, profile] = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.profilePicture) {
      setAvatarUri(profile.profilePicture);
    }
  }, [profile?.profilePicture]);

  const colors = useMemo(() => ({
    pageBg: isDark ? "#0B0F14" : "#F5F6FA",
    cardBg: isDark ? "#121922" : "#FFFFFF",
    border: isDark ? "#1F2A37" : "#E2E5EE",
    text: isDark ? "#F2F2F2" : "#111111",
    subText: isDark ? "#A7B0BE" : "#555555",
    muted: isDark ? "#778195" : "#7A7A7A",
    accent: isDark ? "#38BDF8" : "#2F6BFF",
    chip: isDark ? "#0B1220" : "#F1F5FF",
    danger: isDark ? "#FF4B4B" : "#DC2626",
  }), [isDark]);

  async function updateProfile(update: Partial<UserProfile>) {
    try {
      const token = await user?.getIdToken();
      let finalUpdate = { ...update };

      if (update.profilePicture && update.profilePicture !== profile?.profilePicture) {
        const imageId = await uploadImage(update.profilePicture);
        finalUpdate.profilePicture = `https://firebasestorage.googleapis.com/v0/b/ear-training-8f082.firebasestorage.app/o/${imageId}?alt=media`;
      }

      await fetch(`${backend}/update-profile`, {
        method: "POST",
        body: JSON.stringify({ ...finalUpdate, authToken: token }),
        headers: { "Content-type": "application/json" }
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to sync profile changes.");
    }
  }

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission denied", "Allow access in settings.", [
        { text: "Settings", onPress: () => Linking.openSettings() }
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await updateProfile({ profilePicture: uri });
    }
  };

  const Pill = ({ label, value }: { label: string, value: number | string }) => (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.chip, 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 16, 
      paddingVertical: 12, 
      alignItems: 'center' 
    }}>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800", textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );

  if (user === undefined) return null;

  // Render Guest Mode UI if not logged in
  if (user === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.pageBg, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="person-circle-outline" size={80} color={colors.muted} />
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "900", marginTop: 20 }}>Guest Mode</Text>
        <Text style={{ color: colors.subText, textAlign: 'center', marginTop: 10 }}>Sign in to track your progress and compete on leaderboards.</Text>
        <Pressable 
          onPress={() => router.push("/(auth)/login")}
          style={{ backgroundColor: colors.accent, width: '100%', padding: 16, borderRadius: 14, marginTop: 30, alignItems: 'center' }}
        >
          <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 16 }}>Sign In / Create Account</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pageBg }}>
      {/* Header Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>Profile</Text>
        <Pressable onPress={() => router.push("/(profile)/settings")}>
          <Ionicons name="settings-outline" size={26} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Centered Avatar Section */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Pressable onPress={pickAvatar}>
            <View style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: colors.cardBg,
              borderWidth: 4,
              borderColor: colors.border,
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center"
            }}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Ionicons name="person" size={55} color={colors.muted} />
              )}
            </View>
            <View style={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              backgroundColor: colors.accent,
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 3,
              borderColor: colors.pageBg,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </View>
          </Pressable>
          
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "900", marginTop: 15 }}>
            {profile?.firstName ? `${profile.firstName} ${profile.lastName ?? ""}` : "Ivy Sun"}
          </Text>
          <Text style={{ color: colors.subText, fontSize: 15, marginTop: 4 }}>
            {user.email} · Joined 2026
          </Text>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 25 }}>
          <Pill label="Level" value={profile?.level ?? 1} />
          <Pill label="XP" value={profile?.currentXp ?? 0} />
          <Pill label="Streak" value={profile?.streak ?? 0} />
        </View>

        {/* Action Buttons Section */}
        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 4 }}>Statistics</Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable 
              onPress={() => router.push("/(profile)/history")}
              style={{ flex: 1, backgroundColor: colors.cardBg, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
            >
              <Ionicons name="time-outline" size={24} color={colors.accent} />
              <Text style={{ color: colors.text, fontWeight: "700", marginTop: 8 }}>History</Text>
            </Pressable>

            <Pressable 
              onPress={() => router.push("/(profile)/accuracy")}
              style={{ flex: 1, backgroundColor: colors.cardBg, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
            >
              <Ionicons name="analytics-outline" size={24} color={colors.accent} />
              <Text style={{ color: colors.text, fontWeight: "700", marginTop: 8 }}>Accuracy</Text>
            </Pressable>
          </View>

          <Pressable 
            onPress={() => router.push("/(profile)/progress")}
            style={{ backgroundColor: colors.cardBg, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <Ionicons name="trending-up" size={22} color={colors.accent} />
            <Text style={{ color: colors.text, fontWeight: "800" }}>View Detailed Progress</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />

        {/* Logout */}
        <Pressable 
          onPress={() => signOut(auth)} 
          style={{ 
            backgroundColor: isDark ? "#2A1014" : "#FFF0F0", 
            padding: 16, 
            borderRadius: 16, 
            alignItems: "center", 
            borderWidth: 1, 
            borderColor: isDark ? "#4A1B20" : "#FFD0D0" 
          }}
        >
          <Text style={{ color: colors.danger, fontWeight: "900", fontSize: 16 }}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
