'use client'
import { useState } from "react";
import { frontendCreateFolder } from "../utils/api";

interface CreateFolderButtonProps {
  currentParentId: string | null;
  userId: string;
  onFolderCreated: () => void;
}

export default function CreateFolderButton({
  currentParentId,
  userId,
  onFolderCreated,
}: CreateFolderButtonProps) {
  const [folderName, setFolderName] = useState("");

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      await frontendCreateFolder(folderName, userId, currentParentId ?? undefined);
      setFolderName("");
      onFolderCreated(); // Trigger parent update
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  return (
    <div className="flex items-center gap-2 ">
      <input
        type="text"
        placeholder="Folder name"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        className="border px-2 py-1 rounded min-w-0 max-w-[300px] flex-1"
      />
      <button
        onClick={handleCreateFolder}
        className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-700 transition-all ease-in-out duration-50"
      >
        +
      </button>
    </div>
  );
}
