import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();

// Profile Schema in code
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  mealsShared: number;
  karmaPoints: number;
  rating: number;
  photoURL: string;
  createdAt: any;
}

export interface UserReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: any;
}

// Fetch Profile or create if it does not exist
export async function getOrCreateProfile(user: FirebaseUser): Promise<UserProfile> {
  const docRef = doc(db, 'users', user.uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      // Create a default profile
      const newProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || 'Anonymous Donor',
        email: user.email || '',
        location: 'Bangalore, IN',
        mealsShared: 3, // starting with placeholder points for better UX
        karmaPoints: 10,
        rating: 5.0,
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    throw err;
  }
}

// Update profile field
export async function updateProfile(uid: string, data: Partial<UserProfile>) {
  const docRef = doc(db, 'users', uid);
  try {
    await updateDoc(docRef, data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    throw err;
  }
}

// Fetch user reviews
export async function getUserReviews(uid: string): Promise<UserReview[]> {
  const reviewsRef = collection(db, 'users', uid, 'reviews');
  try {
    const qSnap = await getDocs(reviewsRef);
    const list: UserReview[] = [];
    qSnap.forEach(doc => {
      list.push(doc.data() as UserReview);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/reviews`);
    throw err;
  }
}

// Add user review
export async function addUserReview(uid: string, review: Omit<UserReview, 'id' | 'createdAt'>) {
  const reviewId = 'rev_' + Math.random().toString(36).substr(2, 9);
  const docRef = doc(db, 'users', uid, 'reviews', reviewId);
  try {
    const fullReview: UserReview = {
      id: reviewId,
      ...review,
      createdAt: serverTimestamp()
    };
    await setDoc(docRef, fullReview);
    return fullReview;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${uid}/reviews/${reviewId}`);
    throw err;
  }
}
