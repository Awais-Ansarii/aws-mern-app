import { useEffect, useRef, useState } from "react";

export default function ImageGallery() {
  const fileInputRef = useRef();
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📥 Fetch images
  const fetchImages = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/images");
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // 📤 Upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return alert("Select image first");

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);

      await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData
      });

      await fetchImages();
      setFile(null);
      fileInputRef.current.value = ""; // 🔥 reset input
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/image/${id}`, {
        method: "DELETE"
      });

      setImages((prev) => prev.filter((img) => img._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        
        <h2 className="text-2xl font-bold mb-6">📸 S3 Image Gallery</h2>

        {/* Upload */}
        <form
          onSubmit={handleUpload}
          className="flex items-center gap-4 mb-6"
        >
          <input
            type="file"
            accept="image/*"
              ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded bg-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img._id}
                className="relative group rounded-lg overflow-hidden shadow-md"
              >
                <img
                  src={img.imageUrl}
                  alt="img"
                  className="w-full h-48 object-cover"
                />

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(img._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No images present</p>
        )}
      </div>
    </div>
  );
}