
// cloudinary.js
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chatapp_upload"); // from Cloudinary dashboard
  formData.append("cloud_name", "dqa97tc0c");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dqa97tc0c/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  return await res.json();
};

export default uploadToCloudinary; 

