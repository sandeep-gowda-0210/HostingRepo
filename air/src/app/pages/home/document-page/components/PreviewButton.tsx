"use client";
import { frontendPreviewFile } from "../utils/api";

export default function PreviewButton({ fileId, userId }: any) {
  const handlePreview = async () => {
    try {
      const fileURL = await frontendPreviewFile(fileId, userId);
      window.open(fileURL, "_blank");
    } catch (err) {
      alert(err);
    }
  };

  return <button className="w-full text-left px-4 py-2 hover:bg-gray-950 bg-gray-900 rounded-lg cursor-pointer" onClick={handlePreview}>Preview</button>;
}