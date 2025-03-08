"use client";

import { useState } from "react";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string | null) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    // 🚀 Upload image to Cloudinary through our API
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onImageUpload(data.imageUrl);
      } else {
        console.error("❌ Error uploading image:", data.error);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="w-full mb-8">
      <div className="bg-zinc-50 rounded-xl p-4">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#111111]">
            Upload a full-body photo, choose a clothing item, and let AI transform your look!
          </p>
          <div className="flex">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full cursor-pointer text-sm bg-transparent border-none p-2 rounded-md text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 file:bg-black file:text-white file:border-none file:rounded-lg file:px-3 file:py-1.5 file:text-sm"
            />
          </div>
        </div>
        {loading && <p className="text-sm text-zinc-500 mt-2">Uploading...</p>}
      </div>
    </div>
  );
}
