import React, { useContext, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AppContext } from "./context/AppContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loadUserData } = useContext(AppContext);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {

                await loadUserData(user.uid);


                if (location.pathname === "/") {
                    navigate("/chat", { replace: true });
                }
            } else {

                if (location.pathname !== "/") {
                    navigate("/", { replace: true });
                }
            }
        });
        return () => unsub();
    }, [loadUserData, navigate, location.pathname]);

    return (
        <>
            <ToastContainer theme="dark" position="bottom-right" />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<ProfileUpdate />} />
            </Routes>
        </>
    );
};

export default App;