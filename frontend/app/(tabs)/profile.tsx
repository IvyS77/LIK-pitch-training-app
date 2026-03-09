import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

type AuthMode = "signin" | "signup";

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = useMemo(
    () => ({
      pageBg: isDark ? "#0B0F14" : "#F5F6FA",
      cardBg: isDark ? "#121922" : "#FFFFFF",
      cardBg2: isDark ? "#0F1720" : "#EEF2FF",
      border: isDark ? "#1F2A37" : "#E2E5EE",
      text: isDark ? "#F2F2F2" : "#111111",
      subText: isDark ? "#A7B0BE" : "#555555",
      muted: isDark ? "#778195" : "#7A7A7A",
      accent: isDark ? "#38BDF8" : "#2F6BFF",
      success: isDark ? "#22C55E" : "#16A34A",
      danger: isDark ? "#FF4B4B" : "#DC2626",
      chip: isDark ? "#0B1220" : "#F1F5FF",
      overlay: "rgba(0,0,0,0.55)",
    }),
    [isDark]
  );

  const [user, profile] = useAuth();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Auth bottom sheet
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
      }}
    >
      {children}
    </View>
  );

  const Pill = ({
    label,
    value,
  }: {
    label: string;
    value: number | string;
  }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.chip,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.cardBg,
    fontSize: 16,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  } as const;

  const pickAvatar = async () => {
    try {
      console.log("pickAvatar pressed");

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("permission:", perm.status, "canAskAgain:", perm.canAskAgain);

      if (perm.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo access to choose an avatar.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log("picker result canceled:", result.canceled);

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setAvatarUri(uri);
    } catch (e: any) {
      console.log("pickAvatar error:", e?.message ?? e);
      Alert.alert("Error", e?.message ?? "Failed to open photo library.");
    }
  };

  function AuthSheet() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const close = () => {
      setAuthOpen(false);
      setError(null);
      setSubmitting(false);
    };

    const doSignIn = async () => {
      const e = email.trim();
      if (!e || !password) {
        setError("Please enter both email and password.");
        return;
      }
      try {
        setSubmitting(true);
        setError(null);
        await signInWithEmailAndPassword(auth, e, password);
        close();
      } catch (err: any) {
        setError(err?.message ?? "Sign in failed.");
      } finally {
        setSubmitting(false);
      }
    };

    const doSignUp = async () => {
      const e = email.trim();

      if (!firstName.trim() || !lastName.trim()) {
        setError("Please enter your first and last name.");
        return;
      }
      if (!e || !password || !confirm) {
        setError("Please fill in all fields.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      try {
        setSubmitting(true);
        setError(null);

        const cred = await createUserWithEmailAndPassword(auth, e, password);

        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email ?? e,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          currentXp: 0,
          level: 1,
          streak: 0,
          createdAt: serverTimestamp(),
        });

        close();
      } catch (err: any) {
        setError(err?.message ?? "Create account failed.");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <Modal
        visible={authOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAuthOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAuthOpen(false)}>
          <View style={{ flex: 1, backgroundColor: colors.overlay }} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: colors.pageBg,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <View
                  style={{
                    width: 46,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: colors.border,
                  }}
                />
              </View>

              <Text
                style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}
              >
                {authMode === "signin" ? "Sign in" : "Create account"}
              </Text>

              <Text
                style={{
                  color: colors.subText,
                  marginTop: 6,
                  marginBottom: 14,
                }}
              >
                {authMode === "signin"
                  ? "Save progress, keep streaks, and sync your profile."
                  : "Create an account to track XP, streaks, and history."}
              </Text>

              {authMode === "signup" ? (
                <>
                  <Text style={{ color: colors.subText, marginBottom: 6 }}>
                    First name
                  </Text>
                  <TextInput
                    placeholder="Enter first name"
                    placeholderTextColor={colors.muted}
                    value={firstName}
                    onChangeText={setFirstName}
                    style={inputStyle}
                  />
                  <View style={{ height: 12 }} />

                  <Text style={{ color: colors.subText, marginBottom: 6 }}>
                    Last name
                  </Text>
                  <TextInput
                    placeholder="Enter last name"
                    placeholderTextColor={colors.muted}
                    value={lastName}
                    onChangeText={setLastName}
                    style={inputStyle}
                  />
                  <View style={{ height: 12 }} />
                </>
              ) : null}

              <Text style={{ color: colors.subText, marginBottom: 6 }}>
                Email
              </Text>
              <TextInput
                placeholder="Enter email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={inputStyle}
              />

              <View style={{ height: 12 }} />

              <Text style={{ color: colors.subText, marginBottom: 6 }}>
                Password
              </Text>
              <TextInput
                placeholder="Enter password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={inputStyle}
              />

              {authMode === "signup" ? (
                <>
                  <View style={{ height: 12 }} />
                  <Text style={{ color: colors.subText, marginBottom: 6 }}>
                    Confirm password
                  </Text>
                  <TextInput
                    placeholder="Confirm password"
                    placeholderTextColor={colors.muted}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={inputStyle}
                  />
                </>
              ) : null}

              {error ? (
                <Text
                  style={{
                    color: colors.danger,
                    marginTop: 10,
                    fontWeight: "700",
                  }}
                >
                  {error}
                </Text>
              ) : null}

              <Pressable
                onPress={authMode === "signin" ? doSignIn : doSignUp}
                disabled={submitting}
                style={{
                  marginTop: 14,
                  backgroundColor: submitting ? "#4B7BFF" : colors.accent,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: submitting ? 0.88 : 1,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>
                  {submitting
                    ? authMode === "signin"
                      ? "Signing in..."
                      : "Creating..."
                    : authMode === "signin"
                    ? "Sign in"
                    : "Create account"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setAuthMode(authMode === "signin" ? "signup" : "signin")
                }
                style={{ marginTop: 12, alignItems: "center" }}
              >
                <Text style={{ color: colors.accent, fontWeight: "900" }}>
                  {authMode === "signin"
                    ? "New here? Create an account"
                    : "Already have an account? Sign in"}
                </Text>
              </Pressable>

              <Pressable
                onPress={close}
                style={{ marginTop: 12, alignItems: "center" }}
              >
                <Text style={{ color: colors.subText, fontWeight: "800" }}>
                  Not now
                </Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // Loading auth state
  if (user === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.pageBg }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Guest mode
  if (user === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.pageBg }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ color: colors.text, fontSize: 30, fontWeight: "900" }}>
            Profile
          </Text>
          <Text style={{ color: colors.subText, marginTop: 8, marginBottom: 14 }}>
            You are browsing as a guest. Sign in to save progress, keep streaks,
            and view history.
          </Text>

          <Card>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>
              Guest Mode
            </Text>
            <Text style={{ color: colors.muted, marginTop: 10 }}>
              • Progress will not be saved
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              • XP and streaks require an account
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              • History and accuracy stats are locked
            </Text>

            <View style={{ height: 14 }} />

            <Pressable
              onPress={() => {
                setAuthMode("signin");
                setAuthOpen(true);
              }}
              style={{
                backgroundColor: colors.accent,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>Sign in</Text>
            </Pressable>

            <View style={{ height: 10 }} />

            <Pressable
              onPress={() => {
                setAuthMode("signup");
                setAuthOpen(true);
              }}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: colors.cardBg,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "900" }}>
                Create account
              </Text>
            </Pressable>
          </Card>

          <View style={{ height: 24 }} />
        </ScrollView>

        <AuthSheet />
      </SafeAreaView>
    );
  }

  // Logged in
  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ""}${profile?.lastName ? " " + profile.lastName : ""}`.trim()
      : user.email ?? "User";

  const username = user.email ? "@" + user.email.split("@")[0] : "@user";
  const joinLabel = "Joined 2026";
  const level = profile?.level ?? 1;
  const xp = profile?.currentXp ?? 0;
  const streak = profile?.streak ?? 0;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pageBg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: colors.text, fontSize: 30, fontWeight: "900" }}>
            {fullName}
          </Text>
          <Text style={{ color: colors.subText, marginTop: 6 }}>
            {username} · {joinLabel}
          </Text>
        </View>

        {/* Avatar + Edit */}
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={pickAvatar}
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: colors.cardBg2,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <Text
                  style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}
                >
                  +
                </Text>
              )}
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "900" }}>
                Profile setup
              </Text>
              <Text style={{ color: colors.muted, marginTop: 6 }}>
                Tap the avatar to choose a photo.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/(profile)/edit-profile")}
              style={{
                backgroundColor: colors.accent,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>Edit</Text>
            </Pressable>
          </View>
        </Card>

        <View style={{ height: 12 }} />

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pill label="Level" value={level} />
          <Pill label="XP" value={xp} />
          <Pill label="Streak (days)" value={streak} />
        </View>

        <View style={{ height: 12 }} />

        {/* Quick actions */}
        <Card>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>
            Quick actions
          </Text>

          <View style={{ height: 12 }} />

          <Pressable
            onPress={() => router.push("/(profile)/progress")}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "900" }}>
              View progress
            </Text>
          </Pressable>

          <View style={{ height: 10 }} />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => router.push("/(profile)/history")}
              style={{
                flex: 1,
                backgroundColor: colors.cardBg2,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "900" }}>
                History
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(profile)/accuracy")}
              style={{
                flex: 1,
                backgroundColor: colors.cardBg2,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "900" }}>
                Accuracy
              </Text>
            </Pressable>
          </View>

          <View style={{ height: 10 }} />

          <Pressable
            onPress={() => router.push("/(profile)/streak")}
            style={{
              backgroundColor: colors.success,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              Streak details
            </Text>
          </Pressable>
        </Card>

        <View style={{ height: 12 }} />

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={{
            backgroundColor: isDark ? "#1A0F12" : "#FFF0F0",
            borderWidth: 1,
            borderColor: isDark ? "#3A1B20" : "#FFD0D0",
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.danger, fontWeight: "900" }}>
            Log out
          </Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}