import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { db, auth } from "../../config/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import uploadToCloudinary from "../../utils/cloudinary.js";
import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";
import "./ProfileUpdate.css";

const ProfileUpdate = () => {
    const { userData, setUserData, setChatUser } = useContext(AppContext);
    const navigate = useNavigate();
    const [name, setName] = useState(userData?.name || "");
    const [bio, setBio] = useState(userData?.bio || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setName((prevName) => prevName || userData.name || "");
            setBio((prevBio) => prevBio || userData.bio || "");
        }
    }, [userData]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Updating profile...");

        try {
            let avatarURL = userData?.avatar || "";
            if (avatarFile) {
                const res = await uploadToCloudinary(avatarFile);
                avatarURL = res.secure_url;
            }

            const userRef = doc(db, "users", auth.currentUser.uid);
            const updateData = { name, nameLower: name.toLowerCase(), bio, avatar: avatarURL };

            await updateDoc(userRef, updateData);
            const snap = await getDoc(userRef);
            setUserData(snap.data());

            toast.update(toastId, { render: "Profile updated successfully!", type: "success", isLoading: false, autoClose: 2000 });
            setTimeout(() => navigate('/chat'), 1500);
        } catch (err) {
            toast.update(toastId, { render: "Update failed!", type: "error", isLoading: false, autoClose: 2000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile">
            <div className="profile-card">
                <img
                    src={assets.arrow_icon}
                    className="profile-back-icon"
                    onClick={() => {
                        if (setChatUser) setChatUser(null);
                        navigate("/chat");
                    }}
                    alt="Back"
                />

                <label htmlFor="avatar" className="profile-avatar-wrap">
                    <input
                        type="file"
                        onChange={(e) => setAvatarFile(e.target.files[0])}
                        id="avatar"
                        accept="image/*"
                        hidden
                    />
                    <img
                        src={avatarFile ? URL.createObjectURL(avatarFile) : userData?.avatar || assets.avatar_icon}
                        alt="avatar"
                        className="profile-avatar"
                    />
                    <span className="profile-avatar-edit">Edit Pofile Pic</span>
                </label>

                <form className="profile-form" onSubmit={handleSave}>
                    <div className="profile-field">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="profile-field">
                        <label>Bio</label>
                        <textarea
                            placeholder="Write something about yourself"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            required
                        />
                    </div>

                    <button className="profile-save" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileUpdate;