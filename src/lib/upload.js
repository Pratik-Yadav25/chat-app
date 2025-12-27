const upload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chatapp_upload");

    try {
        const res = await fetch(
            "https://api.cloudinary.com/v1_1/dqa97tc0c/image/upload",
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await res.json();
        return data.secure_url; 
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

export default upload;