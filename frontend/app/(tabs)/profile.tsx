import LoginScreen from "@/components/login";
import SignupScreen from "@/components/signup";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { TextInput } from "react-native";

export default function Profile() {
    const user = useAuth()

    if (user === null) {
        return (
            <ThemedView style={{
                justifyContent: "space-around",
                height: "100%"
            }}>

                <ThemedView>
                    <ThemedText style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 32,
                        height: 40,
                        padding: 8
                    }}>
                        Returning User?
                    </ThemedText>
                    <LoginScreen/>
                </ThemedView>

                <ThemedView>
                    <ThemedText style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 32,
                        height: 40,
                        padding: 8
                    }}>
                        New User?
                    </ThemedText>
                    <SignupScreen/>
                </ThemedView>
            </ThemedView>
        )
    }
    
    return (
        <ThemedView>{user?.uid}</ThemedView>
    )
}