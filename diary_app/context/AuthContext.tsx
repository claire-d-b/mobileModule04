import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  localLogin: string | null;
  setLocalLogin: (login: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  localLogin: null,
  setLocalLogin: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [localLogin, setLocalLoginState] = useState<string | null>(null);

  // 1. restore asyncstorage
  useEffect(() => {
    AsyncStorage.getItem("localLogin").then((val) => {
      if (val) {
        console.log("✅ localLogin loaded:", val);
        setLocalLoginState(val);
      }
    });
  }, []);

  // 2. sync Firebase auth (IMPORTANT FIX)
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        console.log("🔥 Firebase user detected:", user.email);

        setLocalLoginState(user.email);
        await AsyncStorage.setItem("localLogin", user.email);
      } else {
        setLocalLoginState(null);
        await AsyncStorage.removeItem("localLogin");
      }
    });

    return unsubscribe;
  }, []);

  const setLocalLogin = async (login: string | null) => {
    setLocalLoginState(login);

    if (login) {
      await AsyncStorage.setItem("localLogin", login);
    } else {
      await AsyncStorage.removeItem("localLogin");
    }
  };

  return (
    <AuthContext.Provider value={{ localLogin, setLocalLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
