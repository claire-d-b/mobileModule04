import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef } from "react";
import { GithubAuthProvider, signInWithCredential } from "firebase/auth";
import { Platform } from "react-native";
import auth from "../config/firebase";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
};

const useGithubAuth = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "com.anonymous.diaryapp", // ⚠️ MUST match app.json
  });

  const isHandled = useRef(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? "",
      scopes: ["read:user", "user:email"],
      redirectUri,

      // ❗ GitHub OAuth Apps DO NOT support PKCE
      usePKCE: false,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type !== "success") return;
    if (isHandled.current) return;

    isHandled.current = true;

    const signIn = async () => {
      const { code } = response.params;

      if (!code) {
        console.error("❌ Missing code");
        return;
      }

      const backendUrl = "http://192.168.1.192:3000/auth/github";
      try {
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri, // ✅ send this instead of codeVerifier
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ Backend error:", errText);
          return;
        }

        const data = await res.json();

        if (!data.access_token) {
          console.error("❌ No access token returned");
          return;
        }

        // Firebase login
        const credential = GithubAuthProvider.credential(data.access_token);
        await signInWithCredential(auth, credential);

        console.log("✅ GitHub login success");
      } catch (error) {
        console.error("❌ GitHub auth error:", error);
      }
    };

    signIn();

    // optional reset if you want retry capability
    return () => {
      isHandled.current = false;
    };
  }, [response]);

  return { promptAsync, request };
};

export default useGithubAuth;
