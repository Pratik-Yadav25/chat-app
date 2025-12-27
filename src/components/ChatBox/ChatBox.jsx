import React, { useContext, useEffect, useRef, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import uploadToCloudinary from "../../utils/cloudinary";


const ChatBox = ({ onBackToList, onShowProfile }) => {
  const { userData, chatUser, messages, messagesId } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });
  const scrollRef = useRef(null);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  const sendMessage = async () => {
    if (isSending) return;

    if (!messagesId) {
      console.error(" messagesId missing");
      return;
    }

    if (!userData?.uid) {
      console.error(" sender uid missing");
      return;
    }

    if (!chatUser?.uid) {
      console.error(" receiver uid missing");
      return;
    }

    if (!input.trim() && !selectedImage) return;

    let imageUrl = null;

    try {
      if (selectedImage) {
        setIsUploading(true);
        const res = await uploadToCloudinary(selectedImage);
        imageUrl = res?.secure_url || null;
        setSelectedImage(null);
        setIsUploading(false);
      }

      const messageData = {
        id: `${Date.now()}_${userData.uid}`, // unique id for delete operations
        sId: userData.uid,
        text: input.trim() || "",
        image: imageUrl,
        createdAt: Date.now(), // ✅ FIX: no serverTimestamp inside array
        status: "sent",
      };

      const msgRef = doc(db, "messages", messagesId);

      setIsSending(true);

      await setDoc(
        doc(db, "messages", messagesId),
        {
          messages: arrayUnion(messageData),
          lastMessageAt: serverTimestamp(),
        },
        { merge: true }
      );

      try {
        const [senderChatsSnap, receiverChatsSnap] = await Promise.all([
          getDoc(doc(db, "chats", userData.uid)),
          getDoc(doc(db, "chats", chatUser.uid)),
        ]);

        const baseSender = senderChatsSnap.exists()
          ? senderChatsSnap.data().chatsData || []
          : [];
        const baseReceiver = receiverChatsSnap.exists()
          ? receiverChatsSnap.data().chatsData || []
          : [];

        const nowTs = Date.now();

        const summary = {
          userId: chatUser.uid,
          messagesId,
          lastMessage: messageData.text || (messageData.image ? "Photo" : ""),
          lastMessageAt: nowTs,
          unreadCount: 0,
        };

        const senderChats = (() => {
          const idx = baseSender.findIndex((c) => c.userId === chatUser.uid);
          if (idx === -1) return [...baseSender, summary];
          const updated = [...baseSender];
          updated[idx] = { ...updated[idx], ...summary };
          return updated;
        })();

        const receiverSummary = {
          userId: userData.uid,
          messagesId,
          lastMessage: messageData.text || (messageData.image ? "Photo" : ""),
          lastMessageAt: nowTs,
          unreadCount:
            (baseReceiver.find((c) => c.userId === userData.uid)?.unreadCount ||
              0) + 1,
        };

        const receiverChats = (() => {
          const idx = baseReceiver.findIndex((c) => c.userId === userData.uid);
          if (idx === -1) return [...baseReceiver, receiverSummary];
          const updated = [...baseReceiver];
          updated[idx] = { ...updated[idx], ...receiverSummary };
          return updated;
        })();

        await Promise.all([
          setDoc(
            doc(db, "chats", userData.uid),
            { chatsData: senderChats },
            { merge: true }
          ),
          setDoc(
            doc(db, "chats", chatUser.uid),
            { chatsData: receiverChats },
            { merge: true }
          ),
        ]);
      } catch (metaErr) {

        console.error("Failed to update chat metadata:", metaErr);
      }

      setInput("");
    } catch (error) {
      console.error("Message send failed:", error);
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleDeleteMessage = async () => {
    try {
      if (!messagesId || !contextMenu.message) return;

      const msgRef = doc(db, "messages", messagesId);
      const snap = await getDoc(msgRef);
      if (!snap.exists()) return;

      const currentMessages = snap.data().messages || [];
      const target = contextMenu.message;

      const filtered = currentMessages.filter((m) => {
        if (target.id) {
          return m.id !== target.id;
        }

        return !(
          m.sId === target.sId &&
          m.createdAt === target.createdAt &&
          m.text === target.text &&
          m.image === target.image
        );
      });

      await setDoc(
        msgRef,
        {
          messages: filtered,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setContextMenu((prev) => ({ ...prev, visible: false, message: null }));
    }
  };

  const openContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      message: msg,
    });
  };

  //
  if (!chatUser) {
    return (
      <div className="chat-box no-chat">
        <img src={assets.logo_big} alt="chatapp logo" className="no-chat-logo" />
        <h4>" Just open and talk . No fluff "</h4>
        <p>Select a user from the left to start chatting.</p>
      </div>
    );
  }

  return (
    <div
      className="chat-box"
      onClick={() =>
        contextMenu.visible &&
        setContextMenu((prev) => ({ ...prev, visible: false, message: null }))
      }
    >
      {/* ---------------- HEADER ---------------- */}
      <div className="chat-header">
        <div className="header-user" onClick={() => onShowProfile(true)}>
          <img
            src={assets.arrow_icon}
            className="arrow"
            alt="back"
            onClick={(e) => {
              e.stopPropagation();
              onBackToList && onBackToList();
            }}
          />
          <div className="avatar-wrap">
            <img
              src={chatUser.avatar || assets.profile_img}
              alt="avatar"
            />
            {chatUser.isOnline && <span className="online-dot"></span>}
          </div>
          <p>{chatUser.name}</p>
        </div>
        <img src={assets.help_icon} alt="info" className="help" />
      </div>


      <div className="chat-msg" ref={scrollRef}>
        {messages?.map((msg, index) => {
          const isSender = userData && msg.sId === userData.uid;

          return (
            <div
              key={index}
              className={`msg-row ${isSender ? "sent" : "received"}`}
            >
              <div
                className="msg-bubble"
                onContextMenu={(e) => openContextMenu(e, msg)}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="media"
                    className="msg-img"
                  />
                )}

                {msg.text && <p>{msg.text}</p>}

                <span className="msg-meta">
                  <span className="msg-time">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : ""}
                  </span>

                  {isSender && (
                    <span
                      className={`msg-status ${msg.status === "seen"
                        ? "seen"
                        : chatUser.isOnline
                          ? "delivered"
                          : "sent"
                        }`}
                    >
                      {msg.status === "seen" || chatUser.isOnline ? "✓✓" : "✓"}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>


      {contextMenu.visible && (
        <div
          className="msg-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={handleDeleteMessage}>Delete message</button>
        </div>
      )}

      {/* ---------------- INPUT ---------------- */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <div className="input-icons">
          <input
            type="file"
            id="image"
            hidden
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />

          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="gallery" />
          </label>

          <img
            src={assets.send_button}
            alt="send"
            className="send-btn"
            onClick={sendMessage}
          />

          {isUploading && (
            <span className="uploading-indicator">Uploading…</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
