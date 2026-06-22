import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import auth from "../config/firebase";
import { AuthProvider, useAuthContext } from "../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const RootLayoutNav = () => {
  const { localLogin, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // ← attendre que Firebase soit prêt

    if (!localLogin) {
      router.replace("/signin");
    } else {
      router.replace("/home");
    }
  }, [localLogin, loading]);

  if (loading) return null;
  // headerShown : C'est l'option qui contrôle l'affichage de la barre de navigation en haut de l'écran.
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
};

const _ = () => {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
};

export default _;
