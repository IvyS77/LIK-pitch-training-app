import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export function useAuth() {
    const [user, setUser] = useState<undefined | null | User>(undefined)

    useEffect(() => {
        onAuthStateChanged(auth, (userData) => {
            if (userData) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/auth.user
                setUser(userData)
                const uid = userData.uid;
                // ...
            } else {
                // User is signed out
                setUser(null)
                // ...
            }
        });
    }, [])

    return user
}