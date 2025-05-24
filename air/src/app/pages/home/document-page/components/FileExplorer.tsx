import React, { useEffect, useState, useRef } from "react";
import { listFiles, frontendRenameFileOrFolder } from "../utils/api";

import CreateFolderButton from "./CreateFolderButton";
import UploadModal from "./UploadModal";
import DeleteButton from "./DeleteButton";
import PreviewButton from "./PreviewButton";

import { FiFolder, FiFile, FiMoreVertical, FiArrowLeft } from "react-icons/fi";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId?: string | null;
}

interface FileExplorerProps {
  userId: string;
}

export default function FileExplorer({ userId }: FileExplorerProps) {
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Track navigation history to implement "Back"
  const [navigationStack, setNavigationStack] = useState<(string | null)[]>([]);

  // Refs for outside click detection
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Fetch files/folders inside the currentParentId folder
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await listFiles(userId, currentParentId ?? undefined);
      if (data.data) setItems(data.data);
    } catch (error) {
      console.error("Failed to fetch files/folders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentParentId]);

  // Close menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuOpenFor &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpenFor(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenFor]);

  const startRename = (item: FileItem) => {
    setRenamingId(item.id);
    setRenameValue(item.name);
    setMenuOpenFor(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const saveRename = async () => {
    if (!renamingId) return;
    try {
      await frontendRenameFileOrFolder(renamingId, renameValue, userId);
      await fetchItems();
      cancelRename();
    } catch (error) {
      alert("Rename failed: " + error);
    }
  };

  // Handle navigation into folder (push currentParentId to stack)
  const openFolder = (folderId: string) => {
    setNavigationStack((prev) => [...prev, currentParentId]);
    setCurrentParentId(folderId);
  };

  // Handle Back button click (pop last from stack)
  const goBack = () => {
    setNavigationStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const previousId = newStack.pop() ?? null;
      setCurrentParentId(previousId);
      return newStack;
    });
  };

  return (
    <div className="bg-gray-900 h-full max-h-[90%]  p-6 text-gray-200 overflow-y-scroll">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {navigationStack.length > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-200"
              aria-label="Go back to parent folder"
            >
              <FiArrowLeft size={18} />
              Back
            </button>
          )}
        </div>

        <div className="flex gap-10">
          <CreateFolderButton
            currentParentId={currentParentId}
            userId={userId}
            onFolderCreated={fetchItems}
          />
          <UploadModal
            parentId={currentParentId}
            userId={userId}
            onUploadSuccess={fetchItems}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => {
            const isRenaming = renamingId === item.id;
            const isMenuOpen = menuOpenFor === item.id;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-colors relative"
                onDoubleClick={() => {
                  if (item.type === "file") setPreviewFileId(item.id);
                  else if (item.type === "folder") openFolder(item.id);
                }}
              >
                <div className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                  {item.type === "folder" ? (
                    <FiFolder className="text-blue-400" size={20} />
                  ) : (
                    <FiFile className="text-gray-400" size={20} />
                  )}

                  {isRenaming ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename();
                        else if (e.key === "Escape") cancelRename();
                      }}
                      autoFocus
                      className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 flex-grow"
                    />
                  ) : (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-5">
                  {isRenaming ? (
                    <>
                      <button
                        onClick={saveRename}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelRename}
                        className="bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-1 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {item.type === "file" && (
                        <PreviewButton fileId={item.id} userId={userId} />
                      )}

                      <button
                        ref={isMenuOpen ? buttonRef : null}
                        onClick={() =>
                          setMenuOpenFor(isMenuOpen ? null : item.id)
                        }
                        className="p-2 hover:bg-gray-700 rounded cursor-pointer"
                        aria-label="Open menu"
                      >
                        <FiMoreVertical className="text-gray-300" size={18} />
                      </button>

                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 mt-10 w-36 bg-gray-800 border border-gray-700 rounded shadow-lg z-20"
                        >
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 cursor-pointer"
                            onClick={() => startRename(item)}
                          >
                            Rename
                          </button>

                          <DeleteButton
                            itemId={item.id}
                            userId={userId}
                            onDeleteSuccess={() => {
                              fetchItems();
                              setMenuOpenFor(null);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
