import React, { useState } from "react";
import { View, Platform } from "react-native";
import { TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthContext } from "../context/AuthContext";
import { router } from "expo-router";
import auth from "../config/firebase";
import useGoogleAuth from "../auth/auth_google";
import useGithubAuth from "../auth/auth_github";
import CTextInput from "./CTextInput";
import CButton from "./CButton";

interface Information {
  login: string;
  password: string;
}

const backendUrl = "http://192.168.1.39:3000";

const SignIn = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState("");

  const { promptAsync: googlePrompt, request: googleRequest } = useGoogleAuth();
  const { promptAsync: githubPrompt, request: githubRequest } = useGithubAuth();
  const { setLocalLogin } = useAuthContext(); // ← ajoute ça
  const handleSubmit = async ({ login, password }: Information) => {
    setError("");
    try {
      // 1. Appel backend
      const res = await fetch(`${backendUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        console.error("❌ Login failed:", data.error);
        return;
      }

      const provider = data.user?.provider;
      console.log("PROVIDER", provider);
      console.log("✅ Backend login success, provider:", provider);

      if (provider === "local") {
        // Compte local → pas de Firebase
        await setLocalLogin(login);
        console.log("✅ Backend registration success:", data.user);
        router.replace("/home");
      } else {
        // Compte Google/GitHub → Firebase
        await signInWithEmailAndPassword(auth, login, password);
        setLogin("");
        // _layout.tsx redirige via onAuthStateChanged
      }
    } catch (err) {
      console.error("❌ Error during login:", err);
      setError("An error occurred");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={["top", "bottom", "left", "right"]}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ width: "100%", padding: 10 }}>
          <CTextInput
            secureTextEntry={false}
            right={<></>}
            onBlur={() => {}}
            onChangeText={(text: string) => setLogin(text)}
            label="login"
            msg={login}
            placeholder="Type your login"
            variant="outlined"
            textColor="#534DB3"
            outlineColor="#534DB3"
            outlineStyle={{ borderRadius: 10 }}
            activeOutlineColor="#534DB3"
            underlineColor="#534DB3"
            activeUnderlineColor="#534DB3"
            selectionColor="#534DB3"
            contentStyle={{}}
            style={{ width: "100%" }}
            disabled={false}
            multiline={false}
          />
          <CTextInput
            secureTextEntry={secure}
            right={
              <TextInput.Icon
                icon={secure ? "eye-off" : "eye"}
                onPress={() => setSecure(!secure)}
              />
            }
            onBlur={() => {}}
            onChangeText={(text: string) => setPassword(text)}
            label="password"
            msg={password}
            placeholder="Type your password"
            variant="outlined"
            textColor="#534DB3"
            outlineColor="#534DB3"
            outlineStyle={{ borderRadius: 10 }}
            activeOutlineColor="#534DB3"
            underlineColor="#534DB3"
            activeUnderlineColor="#534DB3"
            selectionColor="#534DB3"
            contentStyle={{}}
            style={{ width: "100%" }}
            disabled={false}
            multiline={false}
          />
          {error ? (
            <CButton
              msg={error}
              variant="text"
              textColor="red"
              style={{}}
              buttonColor="transparent"
              labelStyle={{}}
              onPress={() => {}}
            />
          ) : null}
          <CButton
            onPress={() => handleSubmit({ login, password })}
            msg="Send"
            variant="contained"
            textColor="white"
            style={{ display: "flex", alignSelf: "flex-end", marginTop: 20 }}
            buttonColor="#534DB3"
            labelStyle={{}}
          />
          <CButton
            onPress={() => router.push("/register")}
            msg="Not registered yet ? Create an account"
            variant="text"
            textColor="#534DB3"
            style={{ display: "flex", alignSelf: "flex-end" }}
            buttonColor="transparent"
            labelStyle={{}}
          />
          <CButton
            onPress={() => googleRequest && googlePrompt()}
            msg="Connect with Google"
            variant="text"
            textColor="gray"
            style={{ display: "flex", alignSelf: "flex-end" }}
            buttonColor="transparent"
            labelStyle={{}}
          />
          <CButton
            onPress={() => githubRequest && githubPrompt()}
            msg="Connect with Github"
            variant="text"
            textColor="gray"
            style={{ display: "flex", alignSelf: "flex-end" }}
            buttonColor="transparent"
            labelStyle={{}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
