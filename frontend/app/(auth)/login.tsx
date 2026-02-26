import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Platform,
  useColorScheme,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = {
    bg: isDark ? "#0B0B0B" : "#FFFFFF",
    card: isDark ? "#161616" : "#F6F7FB",
    text: isDark ? "#FFFFFF" : "#111111",
    label: isDark ? "#EDEDED" : "#222222",
    border: isDark ? "#555555" : "#D0D5DD",
    placeholder: isDark ? "#C7C7C7" : "#667085",
    button: "#2F6BFF",
    buttonDisabled: "#9BB6FF",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    const emailClean = email.trim();

    if (!emailClean || !password) {
      showMessage("Missing fields", "Please enter both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, emailClean, password);

      // Go to tabs after successful login
      router.back();
    } catch (error: any) {
      showMessage("Login Error", error?.message ?? "Login failed.");
    } finally {
      setSubmitting(false);
    }
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
          marginBottom: 20,
        }}
      >
        Login
      </Text>

      <Text style={{ color: colors.label, marginBottom: 6 }}>
        Email
      </Text>
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

      <Text style={{ color: colors.label, marginBottom: 6 }}>
        Password
      </Text>
      <TextInput
        placeholder="Enter password"
        placeholderTextColor={colors.placeholder}
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        style={inputStyle}
      />

      <Pressable
        onPress={handleLogin}
        disabled={submitting}
        style={{
          backgroundColor: submitting ? colors.buttonDisabled : colors.button,
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 6,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
          {submitting ? "Logging in..." : "Login"}
        </Text>
      </Pressable>
    </View>
  );
}