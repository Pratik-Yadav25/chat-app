import React, { useState, useContext } from "react";
import "./Chat.css";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { AppContext } from "../../context/AppContext";

const Chat = () => {
  const { chatUser, setChatUser } = useContext(AppContext);
  const [showChat, setShowChat] = useState(false);
  const [mobileView, setMobileView] = useState("list");


  const handleChatSelect = () => {
    setShowChat(true);
    setMobileView("chat");
  };

  const handleShowProfile = (keepUser = false) => {
    if (!keepUser) {
      setChatUser(null);
    }
    setMobileView("profile");
  };

  const handleBackToList = () => {
    setMobileView("list");
  };

  const handleBackToChat = () => {
    if (chatUser) {
      setMobileView("chat");
    } else {
      setMobileView("list");
    }
  };

  return (
    <div className="chat">
      <div className={`chat-container view-${mobileView}`}>
        <LeftSidebar
          setShowChat={setShowChat}
          onChatSelect={handleChatSelect}
          onProfileClick={handleShowProfile}
        />
        <ChatBox
          showChat={showChat}
          setShowChat={setShowChat}
          onShowProfile={handleShowProfile}
          onBackToList={handleBackToList}
        />
        <RightSidebar
          onBackToChat={handleBackToChat}
        />
      </div>
    </div>
  );
};

export default Chat;

