import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, useColorScheme, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function EditProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = useMemo(
    () => ({
      pageBg: isDark ? "#0B0F14" : "#F5F6FA",
      cardBg: isDark ? "#121922" : "#FFFFFF",
      border: isDark ? "#1F2A37" : "#E2E5EE",
      text: isDark ? "#F2F2F2" : "#111111",
      subText: isDark ? "#94A3B8" : "#555555",
      inputBg: isDark ? "#0F1720" : "#F8FAFF",
      accent: isDark ? "#38BDF8" : "#2F6BFF",
    }),
    [isDark]
  );

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      showMessage("Not signed in", "Please log in again.");
      router.replace("/login");
      return;
    }

    try {
      setSaving(true);

      // Minimal profile doc. Keeps existing fields if already present (merge: true).
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email ?? "",
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
        { merge: true }
      );

      showMessage("Saved", "Your profile has been updated.");
      router.back();
    } catch (e: any) {
      showMessage("Save error", e?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.pageBg, padding: 16 }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900", marginBottom: 12 }}>
        Edit Profile
      </Text>
      <Text style={{ color: colors.subText, marginBottom: 18 }}>
        Update your name and save.
      </Text>

      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 14,
          gap: 12,
        }}
      >
        <View>
          <Text style={{ color: colors.subText, marginBottom: 6 }}>First name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor={colors.subText}
            style={{
              backgroundColor: colors.inputBg,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              color: colors.text,
            }}
          />
        </View>

        <View>
          <Text style={{ color: colors.subText, marginBottom: 6 }}>Last name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor={colors.subText}
            style={{
              backgroundColor: colors.inputBg,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              color: colors.text,
            }}
          />
        </View>

        <Pressable
          onPress={onSave}
          disabled={saving}
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            opacity: saving ? 0.8 : 1,
            marginTop: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={{
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "800" }}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}