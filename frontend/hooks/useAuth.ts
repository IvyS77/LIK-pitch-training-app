import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";

export type UserProfile = {
  currentXp: number;
  email: string;
  firstName: string;
  lastName: string;
  level: number;
  streak: number;
  uid: string;
};

export function useAuth(): [User | undefined | null, UserProfile | undefined] {
  const [user, setUser] = useState<User | undefined | null>(undefined);
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const unsub = useRef<Unsubscribe | undefined>(undefined);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (userData) => {
      // clean old firestore listener
      unsub.current?.();
      unsub.current = undefined;
      setProfile(undefined);

      if (userData) {
        setUser(userData);
        const uid = userData.uid;

        unsub.current = onSnapshot(doc(db, "users", uid), (snap) => {
          setProfile(snap.data() as UserProfile);
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      unsub.current?.();
      unsubscribeAuth();
    };
  }, []);

  return [user, profile];
}