"use client";
import { frontendDeleteFileOrFolder } from "../utils/api";

export default function DeleteButton({ itemId, userId, onDeleteSuccess }: any) {
  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this?");
    if (!confirmed) return;
    try {
      await frontendDeleteFileOrFolder(itemId, userId);
      onDeleteSuccess();
    } catch (err) {
      alert(err);
    }
  };

  return <button className="w-full text-left px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={handleDelete}>Delete</button>;
}