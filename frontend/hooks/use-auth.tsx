import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export type UserProfile = {
    currentXp: number,
    email: string,
    firstName: string,
    lastName: string,
    level: number,
    streak: number,
    uid: string,
    profilePicture: string
}

export function useAuth(): [User | undefined | null, UserProfile | undefined] {
    // TODO: fetch user profile on login and return that
    const [user, setUser] = useState<undefined | null | User>(undefined)
    const [profile, setProfile] = useState<UserProfile | undefined>(undefined)
    const unsub = useRef<Unsubscribe | undefined>(undefined)

    useEffect(() => {
        onAuthStateChanged(auth, (userData) => {
            if (userData) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/auth.user
                setUser(userData)
                const uid = userData.uid;
                unsub.current = onSnapshot(doc(db, "users", uid), (doc) => {
                    setProfile(doc.data() as UserProfile)
                })
            } else {
                // User is signed out
                setUser(null)
                unsub.current?.()
            }
        });
    }, [])

    return [user, profile]
}