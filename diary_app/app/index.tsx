// app/index.tsx
import Signin from "./signin";
import Home from "./home";
import Loading from "./loading";
import { useAuthContext } from "../context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Index() {
  const { localLogin, loading } = useAuthContext();

  return loading ? <Loading /> : localLogin ? <Home /> : <Signin />;
}
