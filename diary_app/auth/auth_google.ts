import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import auth from "../config/firebase";
// import { router } from "expo-router";

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const useGoogleAuth = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "com.anonymous.diaryapp", // must match app.json — même scheme que GitHub, fixe quel que soit le mode (tunnel/lan/dev build)
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    console.log("Google redirectUri:", redirectUri);
    if (response?.type !== "success") return;
    const signIn = async () => {
      console.log(backendUrl);
      const { authentication } = response;
      const accessToken = authentication?.accessToken;
      const idToken = authentication?.idToken;
      if (!accessToken || !idToken) {
        console.error("Missing tokens");
        return;
      }
      try {
        const res = await fetch(`${backendUrl}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ token: accessToken }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Backend Google error:", data.error);
          return;
        }
        console.log("Google user in DB:", data.user);
        // Ce code finalise l'authentification Google côté Firebase, après que l'utilisateur se soit connecté via le flux OAuth Google.
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        console.log("Google login success:", data.user.login);
        // router.replace("/home");
      } catch (e) {
        console.error("Google auth error:", e);
      }
    };
    signIn();
  }, [response]);

  return { promptAsync, request };
};

export default useGoogleAuth;