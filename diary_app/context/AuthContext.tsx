// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const auth = getAuth();

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;

        if (user?.email) {
          console.log("🔥 Firebase user detected:", user.email);
          setLocalLoginState(user.email);
        } else {
          setLocalLoginState(null);
        }

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
  };

  return (
    <AuthContext.Provider value={{ localLogin, setLocalLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
