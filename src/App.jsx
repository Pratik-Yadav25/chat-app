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
    const { userData, loading } = useContext(AppContext);
    const hasNavigated = React.useRef(false);

    useEffect(() => {
        if (loading) return;

        if (userData) {
            if (location.pathname === "/") {
                navigate("/chat", { replace: true });
            }
        } else {
            if (location.pathname !== "/") {
                navigate("/", { replace: true });
            }
        }
    }, [userData, loading, navigate, location.pathname]);

    if (loading) return null;

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