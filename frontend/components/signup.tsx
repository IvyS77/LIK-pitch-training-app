import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Button, TextInput } from "react-native";
import { auth } from "../firebaseConfig";

export default function SignupScreen() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    function signup() {
        setErrorMessage("")
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                setSuccessMessage("Successfully logged in")
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setErrorMessage(errorMessage)
            });
    }

    return (
        <ThemedView style={{
            justifyContent: "center",
            flexDirection: "row"
        }}>
            <ThemedView style={{
                padding: 8,
                gap: 8,
                minWidth: 200,
                maxWidth: 600,
                flexGrow: 1,
                flexShrink: 1
            }}>
                <ThemedView>
                    <ThemedText>Email</ThemedText>
                    <TextInput 
                    style={{
                        borderWidth: 1,
                        height: 40,
                        paddingHorizontal: 8
                    }}
                    value={email}
                    onChangeText={(newText) => setEmail(newText)}
                    />
                </ThemedView>

                <ThemedView>
                    <ThemedText>Password</ThemedText>
                    <TextInput 
                    style={{
                        borderWidth: 1,
                        height: 40,
                        paddingHorizontal: 8
                    }}
                    value={password}
                    onChangeText={(newText) => setPassword(newText)}
                    secureTextEntry
                    />
                </ThemedView>

                <ThemedText style={{
                    color: "green",
                }}>
                    {successMessage}
                </ThemedText>
                <ThemedText style={{
                    color: "red",
                }}>
                    {errorMessage}
                </ThemedText>

                <ThemedView style={{
                    height: 40,
                }}>
                    <Button
                    title="signup"
                    onPress={signup}
                    />
                </ThemedView>
            </ThemedView>
        </ThemedView>
    )
}