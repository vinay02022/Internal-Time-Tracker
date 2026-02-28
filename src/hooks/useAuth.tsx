import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthChange,
  ensureUserInFirestore,
  signOut,
  getGoogleAccessToken,
} from '../services/auth';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleToken: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  googleToken: null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await ensureUserInFirestore(firebaseUser);
          setUser(appUser);
          setGoogleToken(getGoogleAccessToken());
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
        setGoogleToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
    setGoogleToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, googleToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
