// app/oauthredirect.tsx
import { useEffect } from "react";
import { useRouter } from "expo-router";
import Home from "./home";

export default function OAuthRedirect() {
  // const router = useRouter();
  // useEffect(() => {
  //   router.replace("/home");
  // }, []);
  return <Home />;
}
