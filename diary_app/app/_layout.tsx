import { Stack } from "expo-router";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { AuthProvider } from "../context/AuthContext";
import * as ScreenOrientation from "expo-screen-orientation";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1 }}
          edges={["top", "bottom", "left", "right"]}
        >
          <PaperProvider theme={MD3LightTheme}>
            <RootLayoutNav />
          </PaperProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
};

export default _;
