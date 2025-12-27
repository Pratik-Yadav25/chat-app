import React, { useContext, useEffect, useMemo, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import { db, auth, logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const LeftSidebar = ({ onChatSelect, onProfileClick }) => {
  const { userData, chatsData, setChatUser, setMessagesId, setMessages } =
    useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map((snap) => ({
        uid: snap.id,
        ...snap.data(),
      }));

      setUsers(allUsers.filter((u) => u.uid !== auth.currentUser?.uid));
    });
    return () => unsubscribe();
  }, []);

  const selectChat = async (user) => {
    setChatUser(user);
    if (onChatSelect) onChatSelect();
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    const mId =
      currentUid < user.uid ? currentUid + user.uid : user.uid + currentUid;
    setMessagesId(mId);


    try {
      const chatRef = doc(db, "chats", currentUid);
      const snap = await getDoc(chatRef);
      if (!snap.exists()) return;
      const base = snap.data().chatsData || [];
      const idx = base.findIndex((c) => c.userId === user.uid);
      if (idx === -1) return;
      const updated = [...base];
      updated[idx] = { ...updated[idx], unreadCount: 0 };
      await setDoc(chatRef, { chatsData: updated }, { merge: true });


      const msgRef = doc(db, "messages", mId);
      const msgSnap = await getDoc(msgRef);
      if (msgSnap.exists()) {
        const msgs = msgSnap.data().messages || [];


        const updatedMsgs = msgs.map((m) =>
          m.sId !== currentUid && m.status !== "seen"
            ? { ...m, status: "seen" }
            : m
        );

        await setDoc(msgRef, { messages: updatedMsgs }, { merge: true });
        setMessages(updatedMsgs);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to mark chat as read:", err);
    }
  };

  const orderedUsers = useMemo(() => {
    const list = users.map((u) => {
      const meta = chatsData?.find((c) => c.userId === u.uid);
      return { ...u, _meta: meta };
    });

    const filtered = list.filter((u) => {
      const name = (u.name || u.username || "").toLowerCase();
      return name.includes(search.toLowerCase());
    });

    return filtered.sort((a, b) => {
      const aTime = a._meta?.lastMessageAt || 0;
      const bTime = b._meta?.lastMessageAt || 0;
      return bTime - aTime;
    });
  }, [users, chatsData, search]);

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="logo" />


          <div className="menu desktop-only">
            <img src={assets.menu_icon} className="menu-icon" alt="menu" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}> Edit profile</p>
              <hr />
              <p onClick={() => logout()}>Logout</p>
            </div>
          </div>
          <div className="mobile-only">
            <img
              src={userData?.avatar || assets.profile_img}
              className="ls-current-avatar"
              onClick={onProfileClick}
              alt="profile"
            />
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="search" />
          <input onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="ls-list">
        {orderedUsers.map((user, index) => (
          <div key={index} className="friends" onClick={() => selectChat(user)}>
            <img
              src={user.avatar || assets.profile_img}
              className="user-avatar"
              alt=""
            />
            <div className="user-details">
              <p className="user-name">{user.name || user.username}</p>
              <span className="user-status">
                {user.isOnline ? "Online" : "Offline"}
              </span>
              {user._meta?.lastMessage && (
                <span className="user-last-msg">
                  {user._meta.lastMessage.length > 25
                    ? user._meta.lastMessage.slice(0, 25) + "…"
                    : user._meta.lastMessage}
                </span>
              )}
            </div>
            {user._meta?.unreadCount > 0 && (
              <span className="unread-badge">
                {user._meta.unreadCount > 9 ? "9+" : user._meta.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
