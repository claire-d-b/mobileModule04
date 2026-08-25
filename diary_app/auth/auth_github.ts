import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";
import { GithubAuthProvider, signInWithCredential } from "firebase/auth";
import auth from "../config/firebase";
// import { router } from "expo-router";

// authorizationEndpoint — l'URL du navigateur qui s'ouvre quand l'utilisateur clique sur "Login with GitHub"
// tokenEndpoint — l'URL pour échanger le code contre un access_token.
// En résumé : discovery est la carte routière d'OAuth — il dit à AuthSession :
// - où envoyer l'utilisateur pour se connecter
// - où aller ensuite pour récupérer le token

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
};

// url de redirection de github après le login
const useGithubAuth = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "com.anonymous.diaryapp", // must match app.json
  });

  const clientId = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
  if (!clientId)
    throw new Error("Missing EXPO_PUBLIC_GITHUB_CLIENT_ID in .env");

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId, // GitHub OAuth App ID
      scopes: ["read:user", "user:email"], // ce qu'on demande comme permissions
      redirectUri, // où GitHub redirige après login
      // PKCE (Proof Key for Code Exchange) est une sécurité supplémentaire pour les apps mobiles, mais GitHub OAuth Apps ne le supportent pas — donc on le désactive.
      usePKCE: false,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type !== "success") return;

    const signIn = async () => {
      const { code } = response.params;

      if (!code) {
        console.error("Missing code");
        return;
      }

      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      try {
        const res = await fetch(`${backendUrl}/auth/github`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri,
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          console.error("Backend error:", error);
          return;
        }

        const data = await res.json();

        if (!data.access_token) {
          console.error("No access token returned");
          return;
        }

        // Utilise le token GitHub pour créer une session Firebase — l'utilisateur est maintenant connecté.
        const credential = GithubAuthProvider.credential(data.access_token);
        await signInWithCredential(auth, credential);

        console.log("GitHub login success");
        // router.replace("/home");
      } catch (e) {
        console.error("GitHub auth error:", e);
      }
    };

    signIn();
  }, [response]);

  return { promptAsync, request };
};

export default useGithubAuth;
