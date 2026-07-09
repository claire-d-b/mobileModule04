import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  localLogin: string | null;
  setLocalLogin: (login: string | null) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  localLogin: null,
  setLocalLogin: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [localLogin, setLocalLoginState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ← nouveau

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // 1. Try to restore a previously saved local login immediately
      try {
        const storedLogin = await AsyncStorage.getItem("localLogin");
        if (isMounted && storedLogin) {
          setLocalLoginState(storedLogin);
        }
      } catch (e) {
        console.warn("Failed to read localLogin from storage", e);
      }

      // 2. Then let Firebase's auth state override/confirm as needed
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;

        if (user?.email) {
          console.log("🔥 Firebase user detected:", user.email);
          setLocalLoginState(user.email);
          await AsyncStorage.setItem("localLogin", user.email);
        }
        // NOTE: intentionally not clearing localLogin here if user is null,
        // since you may want to keep the local/manual login as a fallback.

        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribePromise = init();

    return () => {
      isMounted = false;
      unsubscribePromise.then((unsub) => unsub && unsub());
    };
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
    <AuthContext.Provider value={{ localLogin, setLocalLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
