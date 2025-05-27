'use client'
import React, { useRef, useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";
import { frontendUploadFile } from "../utils/api";

interface UploadModalProps {
  parentId: string | null;
  userId: string;
  onUploadSuccess: () => void;
}

export default function UploadModal({ parentId, userId, onUploadSuccess }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Whenever file changes, upload it automatically
  useEffect(() => {
    const upload = async () => {
      if (!file) return;
      try {
        if(parentId)
        await frontendUploadFile(file, userId ,parentId);
        else
            await frontendUploadFile(file, userId);

        onUploadSuccess();
        setFile(null); // reset file after upload
      } catch (err) {
        alert("Upload failed: " + err);
      }
    };
    upload();
  }, [file, userId, parentId, onUploadSuccess]);

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ display: "none" }}
      />

      <button
        onClick={handleButtonClick}
        className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer text-gray-200"
        aria-label="Upload file"
      >
        <FiUpload size={18} />
        Upload
      </button>
    </div>
  );
}
