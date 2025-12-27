import { createContext, useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [chatsData, setChatsData] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData({
          uid,
          ...userSnap.data()
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!messagesId) {
      setMessages([]);
      return;
    }

    const unSub = onSnapshot(
      doc(db, "messages", messagesId),
      (res) => {
        if (res.exists()) {
          setMessages(res.data().messages || []);
        } else {
          setMessages([]);
        }
      },
      (error) => {
        console.error("Messages listener error:", error);
        setMessages([]);
      }
    );

    return () => unSub();
  }, [messagesId]);

  useEffect(() => {
    if (!userData?.uid) return;

    const unSub = onSnapshot(
      doc(db, "chats", userData.uid),
      (res) => {
        if (res.exists()) {
          setChatsData(res.data().chatsData || []);
        } else {
          setChatsData([]);
        }
      },
      (error) => {
        console.error("Chats listener error:", error);
        setChatsData([]);
      }
    );

    return () => unSub();
  }, [userData?.uid]);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{
      userData, setUserData,
      chatUser, setChatUser,
      messages, setMessages,
      messagesId, setMessagesId,
      chatsData, setChatsData,
      loadUserData,
      chatVisible, setChatVisible,
      loading, setLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
