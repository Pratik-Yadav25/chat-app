import React, { useState } from 'react';
import './Login.css';
import assets from '../../assets/assets';
import { signup, login } from '../../config/firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [currState, setCurrState] = useState("Sign up");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (!agreeTerms) {
            toast.error("Please agree to the terms!");
            return;
        }

        try {
            if (currState === "Sign up") {
                await signup(userName, email, password);
                toast.success("Account created! Logging in...");
            } else {
                await login(email, password);
                toast.success("Logged in successfully!");
            }
            navigate("/chat");
        } catch (error) {
            console.error(error);

        }
    };

    return (
        <div className='login'>
            <img src={assets.logo_big} alt="logo" className="logo logo-desktop" />
            <img src={assets.logo} alt="logo" className="logo logo-mobile" />

            <form className="login-form" onSubmit={onSubmitHandler}>
                <h2>{currState}</h2>
                {currState === "Sign up" && (
                    <input
                        type="text"
                        placeholder="Username"
                        className="form-input"
                        onChange={(e) => setUserName(e.target.value)}
                        value={userName}
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email address"
                    className="form-input"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="form-input"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                />
                <div className="login-terms">
                    <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={() => setAgreeTerms(!agreeTerms)}
                    />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>
                <button type="submit">
                    {currState === "Sign up" ? "Create account" : "Login now"}
                </button>
                <div className="login-forgot">
                    <p className="login-toggle">
                        {currState === "Sign up" ? "Already have an account?" : "Create an account?"}
                        <span onClick={() => setCurrState(currState === "Sign up" ? "Login" : "Sign up")}> click here</span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;