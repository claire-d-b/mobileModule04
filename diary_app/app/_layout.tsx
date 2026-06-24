import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import auth from "../config/firebase";
import { AuthProvider, useAuthContext } from "../context/AuthContext";
import * as ScreenOrientation from "expo-screen-orientation";
import { PaperProvider, MD3LightTheme } from "react-native-paper";

WebBrowser.maybeCompleteAuthSession();

const RootLayoutNav = () => {
  useEffect(() => {
    ScreenOrientation.unlockAsync();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
};

const _ = () => {
  return (
    <AuthProvider>
      <PaperProvider theme={MD3LightTheme}>
        <RootLayoutNav />
      </PaperProvider>
    </AuthProvider>
  );
};

export default _;
