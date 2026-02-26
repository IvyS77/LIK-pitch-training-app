import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Platform,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";

export default function SignupScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = useMemo(
    () => ({
      bg: isDark ? "#0B0B0B" : "#FFFFFF",
      card: isDark ? "#161616" : "#F6F7FB",
      text: isDark ? "#FFFFFF" : "#111111",
      label: isDark ? "#EDEDED" : "#222222",
      border: isDark ? "#555555" : "#D0D5DD",
      placeholder: isDark ? "#C7C7C7" : "#667085",
      button: "#2F6BFF",
      buttonDisabled: "#9BB6FF",
      muted: isDark ? "#A7B0BE" : "#555555",
    }),
    [isDark]
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    color: colors.text,
    backgroundColor: colors.card,
    fontSize: 16,
    ...(Platform.OS === "web"
      ? ({
          outlineStyle: "none",
        } as any)
      : {}),
  };

  const handleSignup = async () => {
    const emailClean = email.trim();
    const passwordClean = password;

    if (!emailClean || !passwordClean) {
      showMessage("Missing fields", "Please enter email and password.");
      return;
    }

    if (passwordClean.length < 6) {
      showMessage("Weak password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);

      // 1) Create auth user
      const cred = await createUserWithEmailAndPassword(
        auth,
        emailClean,
        passwordClean
      );

      const uid = cred.user.uid;

      // 2) Create Firestore user profile doc: users/{uid}
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          email: emailClean,
          firstName: firstName.trim() || "",
          lastName: lastName.trim() || "",
          level: 1,
          currentXp: 0,
          streak: 0,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 3) Go to app
      router.replace("/(tabs)");
    } catch (e: any) {
      const code = e?.code;
      let msg = e?.message ?? "Sign up failed.";

      if (code === "auth/email-already-in-use") msg = "That email is already in use.";
      if (code === "auth/invalid-email") msg = "Invalid email format.";
      if (code === "auth/weak-password") msg = "Password is too weak (min 6 chars).";

      showMessage("Sign up error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: colors.bg,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: "800",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        Create account
      </Text>

      <Text style={{ color: colors.muted, marginBottom: 18 }}>
        Save your progress, streaks, and history.
      </Text>

      <Text style={{ color: colors.label, marginBottom: 6 }}>First name</Text>
      <TextInput
        placeholder="Enter first name"
        placeholderTextColor={colors.placeholder}
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        style={inputStyle}
      />

      <Text style={{ color: colors.label, marginBottom: 6 }}>Last name</Text>
      <TextInput
        placeholder="Enter last name"
        placeholderTextColor={colors.placeholder}
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        style={inputStyle}
      />

      <Text style={{ color: colors.label, marginBottom: 6 }}>Email</Text>
      <TextInput
        placeholder="Enter email"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        style={inputStyle}
      />

      <Text style={{ color: colors.label, marginBottom: 6 }}>Password</Text>
      <TextInput
        placeholder="Create password"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        style={inputStyle}
      />

      <Pressable
        onPress={handleSignup}
        disabled={submitting}
        style={{
          backgroundColor: submitting ? colors.buttonDisabled : colors.button,
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 6,
          opacity: submitting ? 0.9 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
          {submitting ? "Creating..." : "Create account"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace("/login")}
        style={{ alignItems: "center", marginTop: 14 }}
      >
        <Text style={{ color: colors.muted, fontWeight: "700" }}>
          Already have an account?{" "}
          <Text style={{ color: colors.text, fontWeight: "900" }}>Sign in</Text>
        </Text>
      </Pressable>
    </View>
  );
}