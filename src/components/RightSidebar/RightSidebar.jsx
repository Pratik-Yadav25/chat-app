import React, { useContext } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { logout } from '../../config/firebase';

const RightSidebar = ({ onBackToChat }) => {
    const { userData, chatUser, messages } = useContext(AppContext);
    const displayUser = chatUser || userData;

    return (
        <div className='rs'>
            <div className="rs-content">

                <img
                    src={assets.arrow_icon}
                    className="rs-back-icon"
                    onClick={onBackToChat}
                    alt="Back"
                />
                <div className="rs-profile">
                    <img src={displayUser?.avatar || assets.profile_img} alt="" />
                    <h3>
                        {displayUser?.name}
                        {displayUser?.isOnline && (
                            <img src={assets.green_dot} className='dot' alt="" />
                        )}
                    </h3>
                    <p>{displayUser?.bio}</p>


                    {!chatUser && (
                        <button
                            className='rs-edit-btn'
                            onClick={() => window.location.href = '/profile'}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {chatUser ? (
                    <>
                        <hr />
                        <div className="rs-media">
                            <p>Shared Media</p>
                            <div>
                                {messages
                                    .filter((m) => m.image)
                                    .map((msg, index) => (
                                        <img
                                            key={index}
                                            src={msg.image}
                                            onClick={() => window.open(msg.image)}
                                            alt="shared"
                                        />
                                    ))}
                            </div>
                        </div>
                    </>
                ) : (

                    <div style={{ marginTop: '20px' }}></div>
                )}
            </div>
            <button className='rs-button' onClick={() => logout()}>Logout</button>
        </div>
    );
}

export default RightSidebar;