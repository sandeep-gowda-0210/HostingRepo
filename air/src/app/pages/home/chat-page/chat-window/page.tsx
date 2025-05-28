'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import socket from '@/utils/socket';
import { useUserData } from '@/context/UserContext';
import ScheduleMessageForm from '@/components/scheduleMessage/ScheduleMessage';
import AutoReplySettings from '@/components/autoReply/AutoReply';
import { playNotificationSound } from '@/utils/notification';

import { ArrowLeft } from "lucide-react";
// type Timestamp = string | Date;

export type Message = {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status?: string;
  type: string;
  file_url: string;
  file: { name: string, type: string, data: string | ArrayBuffer };
  created_at: Date;
  time_stamp: Date | string;
  file_name: string;
};

function ChatWindow() {
  let { user, selectedUser, triggerRefreshRecentChat, setSelectedUser } = useUserData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [scheduleMessagePage, setScheduleMessagePage] = useState<Boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoReplyPage, setAutoReplyPage] = useState<Boolean>(false);

  const [messageLoading, setMessageLoading] = useState<Boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const containerRef = useRef<HTMLInputElement | null>(null);;
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 30;
    setIsAtBottom(isBottom);
  }, []);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await setSelectedFile(file);
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  };



  const loadMessages = useCallback(async () => {
    // setMessageLoading(true);
    if (!currentUserId || !selectedUser?.user_id) return;

    try {
      const params = new URLSearchParams({
        from: currentUserId,
        to: selectedUser.user_id,
      });

      const res = await fetch(`/api/chatservice/getMessages?${params.toString()}`);
      const data = await res.json();

      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
    finally {
      setMessageLoading(false);
      triggerRefreshRecentChat();

    }
  }, [currentUserId, selectedUser?.user_id]);


  useEffect(() => {
    scrollToBottom();
    setSelectedFile(null);
    const el = containerRef.current
    // console.log("scrollHeight:", el?.scrollHeight);
    // console.log("clientHeight:", el?.clientHeight);
    if (!el) return;
    // console.log("Container ref in useEffect:", el); // Add this
    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll)
    };
  }, [messages, scheduleMessagePage, autoReplyPage]);

  useEffect(() => {
    setCurrentUserId(user?.user_id || null);
  }, [user]);
  useEffect(() => {
    socket.on('receive-message', (message: Message) => {

      triggerRefreshRecentChat();
      if (
        (message.sender_id === selectedUser?.user_id && message.receiver_id === currentUserId) ||
        (message.sender_id === currentUserId && message.receiver_id === selectedUser?.user_id)
      ) {
        //   if(!message.time_stamp){

        // message.time_stamp= new Date(getLocalDateTimeString())
        //   }

        console.log("message", message);

        if (message.sender_id !== message.receiver_id)
          setMessages((prev) => [...prev, message]);

        let users = { sender_id: selectedUser.user_id, receiver_id: currentUserId }
        socket.emit("notification-seen", users);
      }
      else {

        playNotificationSound();
      }
    });

    return () => {
      socket.off('receive-message');
    };
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    setAutoReplyPage(false);
    setScheduleMessagePage(false);
    setMessages([]);

    loadMessages();
  }, [currentUserId, selectedUser?.user_id]);


  const handleSend = useCallback(async () => {
    console.log((!newMessage.trim() && !selectedFile) || !selectedUser || !currentUserId, !selectedFile);

    if ((!newMessage.trim() && !selectedFile) || !selectedUser || !currentUserId) return;
    function getLocalDateTimeString() {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localTime = new Date(now.getTime() - offset * 60 * 1000);
      return localTime.toISOString().slice(0, 16);
    }


    let messagePayload: Partial<Message> = {
      sender_id: currentUserId,
      receiver_id: selectedUser.user_id,
      content: newMessage,
      type: selectedFile ? selectedFile.type : "text",
      time_stamp: getLocalDateTimeString()
    };

    if (selectedFile) {

      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      messagePayload.file = {
        name: selectedFile.name,
        type: selectedFile.type,
        data: fileData,
      };
    }
    console.log("sending message");

    socket.emit('send-message', messagePayload);

    // let messagePayload_1: Message = {
    //   id: Math.random().toString(),
    //   sender_id: currentUserId,
    //   receiver_id: selectedUser.user_id,
    //   content: newMessage,
    // }
    // socket.on("sent-message", () => {
    //   loadMessages();
    //   triggerRefreshRecentChat();
    //   // triggerRefreshRecentChat();

    // })
    // setMessages((prev) => [...prev, { ...messagePayload_1 }]);
    setNewMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // return () => { socket.off("sent-message") };
  }, [newMessage, selectedUser, selectedFile, currentUserId]);

  useEffect(() => {
    console.log("status", scheduleMessagePage);


  }, [scheduleMessagePage])

  useEffect(() => {
    const handleSent = () => {
      loadMessages();
      triggerRefreshRecentChat();
    };
    socket.on("sent-message", handleSent);

    return () => {
      socket.off("sent-message", handleSent);
    };
  }, [loadMessages, triggerRefreshRecentChat]);

  if (!selectedUser || !socket.id) {
    return (
      <div className='flex justify-center items-center h-full border-2 rounded-2xl text-lg sm:text-4xl'>
        No chat Selected
      </div>
    );
  }

  const isDifferentUser = user?.user_id !== selectedUser.user_id;;


  return selectedUser && <div className="flex flex-col h-full border rounded shadow w-full bg-gray-900 border-gray-700 text-gray-300">
    {/* Top Bar */}
    <div className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-700 bg-gray-800 bg-opacity-80 backdrop-blur-sm">
      <div className='flex items-center gap-2'>
        <div className="sm:hidden flex items-center px-1 bg-gray-800 ">
          <button
            className="text-blue-400 hover:text-white flex items-center gap-2"
            onClick={() => setSelectedUser(null)}
          >
            <ArrowLeft size={25} />
          </button>
        </div>
        <div className="flex items-center">
          <img
            src={selectedUser.profile_url}
            alt="Profile"
            className="w-6 h-7 sm:w-9 sm:h-10 rounded-full mr-3 ring-2 ring-indigo-500"
          />
          <h2 className="text-sm sm:text-lg font-semibold text-indigo-400">{selectedUser.user_name}</h2>
        </div>
      </div>
      <div className="flex items-center gap-x-1 sm:gap-x-6 text-gray-400">
        {!autoReplyPage && isDifferentUser && (
          <svg
            role="button"
            aria-label="Open auto-reply settings"
            width="30"
            height="30"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => {
              scheduleMessagePage ? setScheduleMessagePage(false) : null;
              setAutoReplyPage(true);
            }}
            className="cursor-pointer w-fit h-fit p-1 px-2 rounded-2xl transition-colors duration-300 hover:bg-indigo-600 hover:text-white"
          >
            <path
              d="M7.50009 0.877014C3.84241 0.877014 0.877258 3.84216 0.877258 7.49984C0.877258 11.1575 3.8424 14.1227 7.50009 14.1227C11.1578 14.1227 14.1229 11.1575 14.1229 7.49984C14.1229 3.84216 11.1577 0.877014 7.50009 0.877014ZM1.82726 7.49984C1.82726 4.36683 4.36708 1.82701 7.50009 1.82701C10.6331 1.82701 13.1729 4.36683 13.1729 7.49984C13.1729 10.6328 10.6331 13.1727 7.50009 13.1727C4.36708 13.1727 1.82726 10.6328 1.82726 7.49984ZM8 4.50001C8 4.22387 7.77614 4.00001 7.5 4.00001C7.22386 4.00001 7 4.22387 7 4.50001V7.50001C7 7.63262 7.05268 7.7598 7.14645 7.85357L9.14645 9.85357C9.34171 10.0488 9.65829 10.0488 9.85355 9.85357C10.0488 9.65831 10.0488 9.34172 9.85355 9.14646L8 7.29291V4.50001Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        )}

        {autoReplyPage && isDifferentUser && (
          <svg
            role="button"
            aria-label="Close auto-reply settings"
            width="30"
            height="30"
            onClick={() => setAutoReplyPage(false)}
            className="cursor-pointer w-fit h-fit p-1 px-2 rounded-2xl transition-colors duration-300 hover:bg-indigo-600 hover:text-white"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 3L2.5 3.00002C1.67157 3.00002 1 3.6716 1 4.50002V9.50003C1 10.3285 1.67157 11 2.5 11H7.50003C7.63264 11 7.75982 11.0527 7.85358 11.1465L10 13.2929V11.5C10 11.2239 10.2239 11 10.5 11H12.5C13.3284 11 14 10.3285 14 9.50003V4.5C14 3.67157 13.3284 3 12.5 3ZM2.49999 2.00002L12.5 2C13.8807 2 15 3.11929 15 4.5V9.50003C15 10.8807 13.8807 12 12.5 12H11V14.5C11 14.7022 10.8782 14.8845 10.6913 14.9619C10.5045 15.0393 10.2894 14.9965 10.1464 14.8536L7.29292 12H2.5C1.11929 12 0 10.8807 0 9.50003V4.50002C0 3.11931 1.11928 2.00003 2.49999 2.00002Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        )}

        {!scheduleMessagePage && isDifferentUser && (
          <svg
            role="button"
            aria-label="Open schedule message settings"
            width="30"
            height="30"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => {
              autoReplyPage ? setAutoReplyPage(false) : null;
              setScheduleMessagePage(true);
            }}
            className="cursor-pointer w-fit h-fit p-1 px-2 rounded-2xl transition-colors duration-300 hover:bg-indigo-600 hover:text-white"
          >
            <path
              d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2ZM7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5ZM9.5 7C9.22386 7 9 7.22386 9 7.5C9 7.77614 9.22386 8 9.5 8C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        )}

        {scheduleMessagePage && isDifferentUser && (
          <svg
            role="button"
            aria-label="Close schedule message settings"
            width="30"
            height="30"
            onClick={() => setScheduleMessagePage(false)}
            className="cursor-pointer w-fit h-fit p-1 px-2 rounded-2xl transition-colors duration-300 hover:bg-indigo-600 hover:text-white"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 3L2.5 3.00002C1.67157 3.00002 1 3.6716 1 4.50002V9.50003C1 10.3285 1.67157 11 2.5 11H7.50003C7.63264 11 7.75982 11.0527 7.85358 11.1465L10 13.2929V11.5C10 11.2239 10.2239 11 10.5 11H12.5C13.3284 11 14 10.3285 14 9.50003V4.5C14 3.67157 13.3284 3 12.5 3ZM2.49999 2.00002L12.5 2C13.8807 2 15 3.11929 15 4.5V9.50003C15 10.8807 13.8807 12 12.5 12H11V14.5C11 14.7022 10.8782 14.8845 10.6913 14.9619C10.5045 15.0393 10.2894 14.9965 10.1464 14.8536L7.29292 12H2.5C1.11929 12 0 10.8807 0 9.50003V4.50002C0 3.11931 1.11928 2.00003 2.49999 2.00002Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        )}
      </div>
    </div>

    {/* Messages */}
    {selectedFile ? (
      <div className="w-full flex flex-col items-center justify-center border rounded p-3 sm:p-4">
        <div className="text-center">
          <p className="mb-2 font-semibold text-sm sm:text-2xl">Input File:</p>
          {selectedFile.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="max-h-64 w-full object-contain rounded shadow"
            />
          ) : selectedFile.type === 'application/pdf' ? (
            <iframe
              src={URL.createObjectURL(selectedFile)}
              title="PDF Preview"
              className="w-full h-64 sm:h-96 border rounded"
            ></iframe>
          ) : (
            <div className="text-gray-600 text-sm">
              <p>Preview not available for this file type.</p>
              <p className="text-xs mt-1 break-words">{selectedFile.name}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          className="my-6 px-4 py-2 text-base bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          Send
        </button>
      </div>
    ) :
      !scheduleMessagePage && !autoReplyPage &&
      <>
        <div ref={containerRef} className="flex-1 p-4 py-3 overflow-y-auto space-y-2 bg-blend-darken">
          {messageLoading ? (
            <div className="text-gray-500 text-xl sm:text-3xl flex h-full w-full justify-center items-center">
              Loading...
            </div>
          ) : messages && messages.length === 0 ? (
            <div className="text-gray-500 text-xl sm:text-3xl flex h-full w-full justify-center items-center">
              No messages yet
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[50%] sm:max-w-[60%] w-fit p-2 rounded-lg text-sm sm:text-sm break-words ${msg.sender_id === currentUserId
                  ? 'bg-[#414141] self-end ml-auto text-right'
                  : 'bg-[#222322] self-start mr-auto'
                  }`}
              >
                {msg.type === 'text' ? (
                  <>
                    <div className="whitespace-pre-wrap break-words text-[0.9em] sm:text-base">{msg.content}</div>
                    <div className="text-[0.7em] sm:text-[0.9em] text-gray-400 mt-1 text-right">
                      {new Date(msg.time_stamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </>
                ) : (
                  <div className="w-full max-w-xs sm:max-w-sm overflow-hidden rounded bg-[#404040] flex justify-center items-center flex-col">
                    <div className="w-full max-h-20 sm:max-h-40 overflow-hidden">
                      {msg.type.startsWith("image/") ? (
                        <img
                          src={msg.file_url}
                          alt={msg.file?.name}
                          className="w-full object-contain max-h-60 rounded bg-black"
                        />
                      ) : msg.type === "application/pdf" ? (
                        <iframe
                          src={msg.file_url}
                          className="w-full h-40 sm:h-60 rounded bg-black"
                          title="PDF Preview"
                        />
                      ) : msg.type.startsWith("video/") ? (
                        <video
                          src={msg.file_url}
                          controls
                          className="w-full object-contain max-h-60 rounded bg-black"
                        />
                      ) : (
                        // Fallback UI for unsupported file types
                        <div className="w-40 sm:w-50 h-10 sm:h-20 bg-black rounded flex items-center justify-between px-4 border">
                        </div>)}
                    </div>

                    <div className="mt-1 sm:mt-2 rounded-lg cursor-pointer px-1 text-center w-full">
                      {msg.file_url && (
                        <a
                          href={msg.file_url}
                          download={msg.file?.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-600 break-words text-xs sm:text-sm"
                        >
                          {msg.file_name || "Download File"}
                        </a>
                      )}
                    </div>

                    <div className="text-[10px] text-gray-400 mt-1 self-end">
                      {new Date(msg.time_stamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <div ref={bottomRef} />
          {!isAtBottom && (
            <button
              onClick={scrollToBottom}
              className="fixed text-lg bottom-24 right-5 sm:right-10 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
            >
              v
            </button>
          )}
        </div>

        <div className="p-2 sm:p-3 border-t bg-[#4b4949] flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Message Input */}
          <input
            type="text"
            className="flex-1 min-w-0 text-sm sm:text-lg border rounded px-2 sm:px-3 py-1 bg-transparent outline-none text-white placeholder:text-gray-300"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* File Upload Button */}
          <div className="flex items-center">
            <input
              type="file"
              accept="image/*,video/*,.pdf,.docx,.xlsx,.txt"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 sm:p-2 rounded-lg hover:bg-[#2f2f2f] transition-all duration-300 text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-paperclip"
              >
                <path d="M13.234 20.252 21 12.3" />
                <path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486" />
              </svg>
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

      </>

    }
    {(scheduleMessagePage && !autoReplyPage && user && selectedUser) && <ScheduleMessageForm senderId={user?.user_id} receiverId={selectedUser.user_id} />}
    {(!scheduleMessagePage && autoReplyPage && user && selectedUser) && <AutoReplySettings />}
  </div>
}


export default ChatWindow;

