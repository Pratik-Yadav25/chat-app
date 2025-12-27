import React from "react";

const TestUpload = () => {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chatapp_upload");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dqa97tc0c/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    console.log("Uploaded URL:", data.secure_url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Cloudinary Test Upload</h3>
      <input type="file" onChange={handleUpload} />
    </div>
  );
};

export default TestUpload;
