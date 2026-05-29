import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import auth from "../config/firebase";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("🔥 Auth state changed:", firebaseUser?.email ?? "null");
      setUser(firebaseUser);
      setReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;
    console.log("👤 user:", user?.email, "| segment:", segments[0]);

    if (user) {
      router.replace("/home"); // ✅ connecté → home
    } else {
      const onProtectedPage = segments[0] === "home";
      if (onProtectedPage) router.replace("/home");
    }
  }, [user, ready]);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="register" />
          <Stack.Screen name="home" />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
