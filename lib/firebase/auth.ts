import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
  deleteUser,
  type User as FirebaseUser,
  type Unsubscribe,
  type ConfirmationResult,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./config";
import type { UserRole, User } from "@/types";
import { DEFAULT_EMAIL_PREFERENCES } from "@/types/user";

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<FirebaseUser> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await createUserDocument(user.uid, { uid: user.uid, email, displayName, role });
  return user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(user.uid, {
      uid: user.uid,
      email: user.email || email,
      displayName: user.displayName || email.split("@")[0],
      role: "seeker",
    });
  } else {
    try {
      await updateDoc(doc(db, "users", user.uid), { lastLoginAt: serverTimestamp() });
    } catch (e) {
      console.warn("Could not update lastLoginAt:", e);
    }
  }
  return user;
}

export async function signInWithGoogle(role: UserRole = "seeker"): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  const { user } = await signInWithPopup(auth, provider);

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(user.uid, {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      role,
    });
  } else {
    await updateDoc(doc(db, "users", user.uid), { lastLoginAt: serverTimestamp() });
  }
  return user;
}

export async function signInWithPhone(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, `+91${phoneNumber}`, recaptchaVerifier);
}

export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  code: string,
  role: UserRole = "seeker"
): Promise<FirebaseUser> {
  const { user } = await confirmationResult.confirm(code);
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(user.uid, {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.phoneNumber || "",
      role,
    });
  }
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) throw new Error("Not authenticated");

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);
  await firebaseUpdatePassword(currentUser, newPassword);
}

export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export async function getUserDocument(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as User;
}

export async function deleteUserAccount(password: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) throw new Error("Not authenticated");

  const credential = EmailAuthProvider.credential(currentUser.email, password);
  await reauthenticateWithCredential(currentUser, credential);

  const uid = currentUser.uid;

  const notifSnap = await getDocs(
    query(collection(db, "notifications"), where("userId", "==", uid))
  );
  await Promise.all(notifSnap.docs.map((d) => deleteDoc(d.ref)));

  const appSnap = await getDocs(
    query(collection(db, "applications"), where("applicantId", "==", uid))
  );
  await Promise.all(appSnap.docs.map((d) => deleteDoc(d.ref)));

  const savedSnap = await getDocs(collection(db, "users", uid, "savedJobs"));
  await Promise.all(savedSnap.docs.map((d) => deleteDoc(d.ref)));

  await deleteDoc(doc(db, "users", uid));
  await deleteUser(currentUser);
}

export async function updateEmailPreferences(
  uid: string,
  preferences: import("@/types").EmailPreferences
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { emailPreferences: preferences });
}

export { PhoneAuthProvider, RecaptchaVerifier };

async function createUserDocument(
  uid: string,
  data: { uid: string; email: string; displayName: string; role: UserRole }
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...data,
    photoURL: null,
    phone: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    fcmTokens: [],
    onboardingCompleted: false,
    emailPreferences: DEFAULT_EMAIL_PREFERENCES,
    profile: {
      headline: "",
      bio: "",
      location: { city: "", state: "" },
      skills: [],
      experience: [],
      education: [],
      preferredJobTypes: [],
      expectedSalary: { min: 0, max: 0 },
      resumeURL: "",
      resumeFileName: "",
    },
  });
}
