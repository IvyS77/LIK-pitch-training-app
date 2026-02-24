import LoginScreen from "@/components/login";
import SignupScreen from "@/components/signup";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { Button, TextInput } from "react-native";

export default function Profile() {
    const [user, profile] = useAuth()

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
        <ThemedView style={{
            width: "100%",
            alignItems: "center"
        }}>
            <ThemedView
            style={{
                flexDirection: "row",
                width: "100%",
                gap: 8,
                padding: 8,
                maxWidth: 600
            }}
            >
                <ThemedView style={{
                    flexGrow: 1
                }}>
                    <ThemedText>First Name</ThemedText>
                    <TextInput 
                    style={{
                        borderWidth: 1,
                        height: 40,
                        paddingHorizontal: 8,
                    }}
                    value={profile?.firstName}
                    />
                </ThemedView>
                <ThemedView style={{
                    flexGrow: 1
                }}>
                    <ThemedText>Last Name</ThemedText>
                    <TextInput 
                    style={{
                        borderWidth: 1,
                        height: 40,
                        paddingHorizontal: 8
                    }}/>
                </ThemedView>
            </ThemedView>
            
            <Button title="Update"/>

        </ThemedView>
    )
}