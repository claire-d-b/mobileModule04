import React, { useState } from "react";
import { View, Platform, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import auth from "../config/firebase";
import { useAuthContext } from "../context/AuthContext";
import CTextInput from "./CTextInput";
import CButton from "./CButton";

interface Information {
  login: string;
  password: string;
  npassword: string;
}

const backendUrl = "http://192.168.1.39:3000";

const Register = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [npassword, setNPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [nsecure, setNSecure] = useState(true);
  const [error, setError] = useState("");
  const { setLocalLogin } = useAuthContext();

  const isCorrectPassword = (password: string) => {
    const hasUppercase = (str: string): boolean => /[A-Z]/.test(str);
    const hasLowercase = (str: string): boolean => /[a-z]/.test(str);
    const hasNumber = (str: string): boolean => /[0-9]/.test(str);
    // matche tout caractère non alphanumérique
    const hasSpecialChar = (str: string): boolean => /\W/.test(str);

    let isCorrect = true;
    if (password.length < 8) isCorrect = false;
    if (hasUppercase(password) === false) isCorrect = false;
    if (hasLowercase(password) === false) isCorrect = false;
    if (hasNumber(password) === false) isCorrect = false;
    if (hasSpecialChar(password) === false) isCorrect = false;

    return isCorrect;
  };

  const handleSubmit = async ({ login, password, npassword }: Information) => {
    setError("");

    console.log("📡 handleSubmit called", {
      login,
      password: "***",
      backendUrl,
    });

    if (!login || !password) {
      setError("Login and password are required");
      return;
    }

    if (password !== npassword) {
      setError("Passwords do not match");
      return;
    }

    if (isCorrectPassword(password) === false) {
      setError(
        "Password does not match required format.\n Password must contain at least:\n- 8 characters\n- 1 lowercase letter\n- one uppercase letter\n- one number\n - one special character.",
      );
      return;
    }

    try {
      console.log("📡 calling:", `${backendUrl}/user/register`);

      const res = await fetch(`${backendUrl}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      console.log("📡 status:", res.status);
      const text = await res.text();
      console.log("📡 raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Server error");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Registration failed");
        console.error("❌ Registration failed:", data.error);
        return;
      }

      console.log("✅ Registration success:", data.user);
      await setLocalLogin(login);
      router.replace("/home" as any);
    } catch (err: any) {
      console.error("❌ Network error:", err);
      setError("Network error — backend running?");
    }
  };
  return (
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
          onChangeText={(secret) => setPassword(secret)}
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
          style={{ width: "100%", borderRadius: 10 }}
          disabled={false}
          multiline={false}
        />
        <CTextInput
          secureTextEntry={nsecure}
          right={
            <TextInput.Icon
              icon={nsecure ? "eye-off" : "eye"}
              onPress={() => setNSecure(!nsecure)}
            />
          }
          onBlur={() => {}}
          onChangeText={(nsecret) => setNPassword(nsecret)}
          label="confirm password"
          msg={npassword}
          placeholder="confirm your password"
          variant="outlined"
          textColor="#534DB3"
          outlineColor="#534DB3"
          outlineStyle={{ borderRadius: 10 }}
          activeOutlineColor="#534DB3"
          underlineColor="#534DB3"
          activeUnderlineColor="#534DB3"
          selectionColor="#534DB3"
          contentStyle={{}}
          style={{ width: "100%", borderRadius: 10 }}
          disabled={false}
          multiline={false}
        />
        {error && <Text style={{ color: "red" }}>{error}</Text>}
        <CButton
          onPress={() => handleSubmit({ login, password, npassword })}
          msg="Send"
          variant="contained"
          textColor="white"
          style={{ display: "flex", alignSelf: "flex-end", marginTop: 20 }}
          buttonColor="#534DB3"
          labelStyle={{}}
        />
        <CButton
          onPress={() => router.push("/signin")}
          msg="Already registered ? Sign-in"
          variant="text"
          textColor="#534DB3"
          style={{ display: "flex", alignSelf: "flex-end" }}
          buttonColor="transparent"
          labelStyle={{}}
        />
      </View>
    </View>
  );
};

export default Register;
