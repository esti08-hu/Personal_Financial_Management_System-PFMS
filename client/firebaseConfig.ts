// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdh7VtmTMcM_CMTm5mP6R3ZVGgYLz4HqQ",
  authDomain: "pfms-fea3f.firebaseapp.com",
  projectId: "pfms-fea3f",
  storageBucket: "pfms-fea3f.firebasestorage.app",
  messagingSenderId: "104009988907",
  appId: "1:104009988907:web:29ae7aa4d7b942fb5b636e",
  measurementId: "G-GHM99W3M9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

export { auth, provider };
