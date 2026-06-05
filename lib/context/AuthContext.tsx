import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';

interface AuthContextValue {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileLocally: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userProfile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  updateProfileLocally: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setUserProfile(snap.data() as User);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    const newUser: User = {
      uid: cred.user.uid,
      email: cred.user.email!,
      displayName,
      avatarUrl: cred.user.photoURL || '',
      creationDate: Date.now(),
      likedTutorials: [],
      viewedTutorials: [],
    };
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    setUserProfile(newUser);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const ref = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const newUser: User = {
        uid: cred.user.uid,
        email: cred.user.email!,
        displayName: cred.user.displayName || 'User',
        avatarUrl: cred.user.photoURL || '',
        creationDate: Date.now(),
        likedTutorials: [],
        viewedTutorials: [],
      };
      await setDoc(ref, newUser);
      setUserProfile(newUser);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  const updateProfileLocally = (updates: Partial<User>) => {
    setUserProfile((prev) => prev ? { ...prev, ...updates } : prev);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, login, register, signInWithGoogle, logout, refreshProfile, updateProfileLocally }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
