import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Platform,
  useColorScheme,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const colors = useMemo(() => ({
    bg: isDark ? "#0B0F14" : "#FFFFFF",
    inputBg: isDark ? "#121922" : "#F7F8FA",
    text: isDark ? "#FFFFFF" : "#111111",
    border: isDark ? "#2A3746" : "#EEEFF4",
    accent: isDark ? "#38BDF8" : "#2F6BFF",
    muted: isDark ? "#A7B0BE" : "#555555",
  }), [isDark]);

  const handleSignup = async () => {
    if (!email.trim() || !password || !firstName.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;

      // Initialize User Profile in Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        level: 1,
        currentXp: 0,
        streak: 0,
        createdAt: serverTimestamp(),
      }, { merge: true });

      router.replace("/(tabs)/profile");
    } catch (e: any) {
      Alert.alert("Signup Error", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: 20 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subTitle, { color: colors.muted }]}>Join us to track your pitch progress!</Text>

          <View style={{ marginTop: 30 }}>
            <TextInput
              placeholder="First Name"
              placeholderTextColor="#AAA"
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Last Name"
              placeholderTextColor="#AAA"
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#AAA"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#AAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            />

            <Pressable
              onPress={handleSignup}
              disabled={submitting}
              style={[styles.btn, { backgroundColor: colors.accent, opacity: submitting ? 0.7 : 1 }]}
            >
              {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>CREATE ACCOUNT</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: "900" },
  subTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  input: { borderWidth: 2, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: "600", marginBottom: 15 },
  btn: { padding: 18, borderRadius: 16, alignItems: "center", marginTop: 10 },
  btnText: { color: "#FFF", fontWeight: "900", fontSize: 16 }
});
