"use client";
import { useState } from "react";
import { frontendRenameFileOrFolder } from "../utils/api";

export default function RenameModal({ fileId, userId, onRenamed }: any) {
  const [newName, setNewName] = useState("");

  const handleRename = async () => {
    try {
      await frontendRenameFileOrFolder(fileId, newName, userId);
      onRenamed();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div>
      <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New name" />
      <button  onClick={handleRename}>Rename</button>
    </div>
  );
}
