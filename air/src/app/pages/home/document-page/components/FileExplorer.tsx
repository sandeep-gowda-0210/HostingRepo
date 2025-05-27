import React, { useEffect, useState, useRef } from "react";
import { listFiles, frontendRenameFileOrFolder, searchFiles } from "../utils/api";

import CreateFolderButton from "./CreateFolderButton";
import UploadModal from "./UploadModal";
import DeleteButton from "./DeleteButton";
import PreviewButton from "./PreviewButton";

import {
  FiFolder,
  FiFile,
  FiMoreVertical,
  FiArrowLeft,
  FiSend,
  FiSearch,
} from "react-icons/fi";
import ChatDialogue from "./ChatDialogue";
import socket from "@/utils/socket";

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
  const [navigationStack, setNavigationStack] = useState<(string | null)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fileToSend, setFileToSend] = useState<FileItem | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await listFiles(userId, currentParentId ?? undefined);
      if (data.data) {
        const sortedItems = [...data.data].sort((a, b) => {
          if (a.type === b.type) return 0;
          return a.type === "folder" ? -1 : 1;
        });
        setItems(sortedItems);
      }
    } catch (error) {
      console.error("Failed to fetch files/folders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("search-result", async (result) => {
      try {
        console.log("the searched data is ", result);
        if (result.data) {
          const sorted = [...result.data].sort((a, b) =>
            a.type === b.type ? 0 : a.type === "folder" ? -1 : 1
          );
          setItems(sorted);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    })
    return () => {
      socket.off("search-result");
    }
  })
  // useEffect(() => {
  //   fetchItems();
  // }, [currentParentId]);

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

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        fetchItems();
      } else {
        await searchFiles(searchQuery.trim(), userId, currentParentId);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, userId, currentParentId]);

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

  const openFolder = (folderId: string) => {
    setSearchQuery('');
    setNavigationStack((prev) => [...prev, currentParentId]);
    setCurrentParentId(folderId);
  };

  const goBack = () => {
    setNavigationStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const previousId = newStack.pop() ?? null;
      setCurrentParentId(previousId);
      return newStack;
    });
  };

  const handleSendFile = (file: FileItem) => {
    setFileToSend(file);
    setIsChatOpen(true);
  };

  return (
    <div className="bg-gray-900 h-full max-h-[90%] p-2 sm:p-6 text-gray-200 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-6">
        {/* Back Button */}
        <div className="flex items-center gap-2">
          {navigationStack.length > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 text-sm"
            >
              <FiArrowLeft size={18} /> Back
            </button>
          )}
        </div>

        {/* Right Side: Search + Create + Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search files & folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Create Folder Button */}
          <div className="w-full sm:w-auto">
            <CreateFolderButton
              currentParentId={currentParentId}
              userId={userId}
              onFolderCreated={fetchItems}
            />
          </div>

          {/* Upload Modal Button */}
          <div className="w-full sm:w-auto">
            <UploadModal
              parentId={currentParentId}
              userId={userId}
              onUploadSuccess={fetchItems}
            />
          </div>
        </div>
      </div>


      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-2">
          {items.map((item) => {
            const isRenaming = renamingId === item.id;
            const isMenuOpen = menuOpenFor === item.id;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all relative w-full"
                onDoubleClick={() => {
                  if (item.type === "file") setPreviewFileId(item.id);
                  else if (item.type === "folder") openFolder(item.id);
                }}
              >
                {/* Icon & Name */}
                <div className="flex items-center gap-3 flex-1 cursor-pointer select-none overflow-hidden">
                  {item.type === "folder" ? (
                    <FiFolder className="text-blue-400 shrink-0" size={20} />
                  ) : (
                    <FiFile className="text-gray-400 shrink-0" size={20} />
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
                      className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="truncate text-sm">{item.name}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {isRenaming ? (
                    <>
                      <button
                        onClick={saveRename}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelRename}
                        className="bg-gray-600 hover:bg-gray-500 text-gray-200 px-3 py-1 text-sm rounded"
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
                        onClick={() => setMenuOpenFor(isMenuOpen ? null : item.id)}
                        className="p-2 hover:bg-gray-700 rounded"
                      >
                        <FiMoreVertical className="text-gray-300" size={18} />
                      </button>
                    </>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-2 top-full mt-2 w-20 sm:w-40 min-w-max bg-gray-800 border border-gray-700 rounded shadow-lg z-50"
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-900 border-gray-600 border-b-1"
                      onClick={() => startRename(item)}
                    >
                      Rename
                    </button>
                    {item.type === "file" && (
                      <button
                        onClick={() => handleSendFile(item)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-900 border-gray-600 border-b-1"
                      >
                        {/* <span>Share</span>  <FiSend className="text-gray-300" size={18} /> */}
                        Share
                      </button>
                    )}
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
              </div>
            );
          })}
        </div>
      )}


      {isChatOpen && fileToSend && (
        <ChatDialogue
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setFileToSend(null);
          }}
          onUserSelect={() => { }}
          fileToSend={fileToSend.id}
        />
      )}
    </div>
  );
}
