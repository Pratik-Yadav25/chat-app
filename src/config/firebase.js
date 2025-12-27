import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyAi8WH8qB9DtSWCNxcSEPOAQaFGnEPpb_o",
    authDomain: "chatapp-py.firebaseapp.com",
    projectId: "chatapp-py",
    storageBucket: "chatapp-py.appspot.com",
    messagingSenderId: "669151199302",
    appId: "1:669151199302:web:2874d29aabf8d6f800a47"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        await updateProfile(user, { displayName: username });

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            avatar: "",

            name: username,
            bio: "Hey, I am using ChatAPP",
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await setDoc(doc(db, "chats", user.uid), {
            chatsData: []
        });

        return user;
    } catch (error) {
        toast.error(error.code.split('/')[1].replace(/-/g, " "));
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        toast.error(error.code.split('/')[1].replace(/-/g, " "));
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }
};

export default app;