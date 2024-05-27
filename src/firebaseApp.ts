// Import the functions you need from the SDKs you need
import {initializeApp, FirebaseApp, getApp} from "firebase/app";
import "firebase/auth";
import {OAuthProvider, User, getAuth} from "firebase/auth";
import {doc, getDoc, getFirestore, setDoc} from "firebase/firestore";
export let app: FirebaseApp;
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

try {
  app = getApp("app");
} catch (e) {
  app = initializeApp(firebaseConfig, "app");
}

const firebase = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export const kakaoProvider = new OAuthProvider("oidc.kakao");
kakaoProvider.setCustomParameters({
  // client_id: `${process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY}`,
  prompt: "consent",
  response_type: "code",
  scope: "openid profile email",
  redirect_uri: "http://localhost:3000/oauth/kakao",
});

// Firestore에 사용자 정보 저장
export const saveUserData = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    providerId: user.providerData[0].providerId,
    lastLogin: new Date(),
  });
  console.log("User data saved to Firestore");
};

// 사용자가 로그인했을 때 호출되는 함수
export const checkUserRegistration = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    console.log("User is registered:", userDoc.data());
    return true;
  } else {
    console.log("User is not registered.");
    return false;
  }
};

export default firebase;
