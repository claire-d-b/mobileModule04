// app/index.tsx
import Signin from "./signin";
import Home from "./home";
import Loading from "./loading";
import { useAuthContext } from "../context/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { localLogin, loading } = useAuthContext();

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "bottom", "left", "right"]}
      >
        {loading ? <Loading /> : localLogin ? <Home /> : <Signin />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
