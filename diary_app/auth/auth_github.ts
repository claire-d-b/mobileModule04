import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef } from "react";
import { GithubAuthProvider, signInWithCredential } from "firebase/auth";
import auth from "../config/firebase";

// Ferme le navigateur pour revenir à l'app
// WebBrowser.maybeCompleteAuthSession();

// authorizationEndpoint — l'URL du navigateur qui s'ouvre quand l'utilisateur clique sur "Login with GitHub"
// tokenEndpoint — l'URL pour échanger le code contre un access_token. Dans ton cas tu ne l'utilises pas directement car c'est ton backend qui fait cet échange (pour ne pas exposer le client_secret dans l'app).
// En résumé : discovery est la carte routière d'OAuth — il dit à AuthSession :
// - où envoyer l'utilisateur pour se connecter
// - où aller ensuite pour récupérer le token

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
};

// url de redirectionde github après le login
const useGithubAuth = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "com.anonymous.diaryapp", // ⚠️ MUST match app.json
  });

  const clientId = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
  if (!clientId)
    throw new Error("Missing EXPO_PUBLIC_GITHUB_CLIENT_ID in .env");
  // promptasync -> ouverture du navigateur
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId, // GitHub OAuth App ID
      scopes: ["read:user", "user:email"], // ce que tu demandes comme permissions
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

      const backendUrl = "http://192.168.1.39:3000/auth/github";
      try {
        const res = await fetch(backendUrl, {
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
      } catch (error) {
        console.error("GitHub auth error:", error);
      }
    };

    signIn();
  }, [response]);

  return { promptAsync, request };
};

export default useGithubAuth;
