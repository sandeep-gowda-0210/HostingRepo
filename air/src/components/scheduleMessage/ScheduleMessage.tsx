'use client';

import { useEffect, useState } from 'react';
import { CircularLoader } from '../loader/Loader';

interface ScheduleMessageFormProps {
  senderId: string;
  receiverId: string;
}
interface ScheduledMessage {
  id: string;
  message_content: string;
  send_time: string;
  sender_id: string,
  receiver_id: string
}
const ScheduleMessageForm: React.FC<ScheduleMessageFormProps> = ({ senderId, receiverId }) => {
  const [messageContent, setMessageContent] = useState('');
  const [sendTime, setSendTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [fetchLoad, setFetchLoad] = useState(true);
  const [deleteStatus, setDeleteStatus] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string>("");




  const fetchScheduledMessages = async () => {
    try {
      const res = await fetch(`/api/chatservice/scheduleMessages/getSchedule?from_user_id=${senderId}&to_user_id=${receiverId}`);
      const { data, error } = await res.json();
      if (res.ok) {
        setScheduledMessages(data);
      } else {
        setStatus(data.error || 'Failed to fetch scheduled messages.');
      }
    } catch (error) {
      // setStatus('Error fetching scheduled messages.');
    }
    finally {
      setFetchLoad(false);
    }
  };

  useEffect(() => {
    fetchScheduledMessages();
  }, [])
  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      const res = await fetch(`/api/chatservice/scheduleMessages/deleteSchedule?message_id=${id}`, {
        method: 'DELETE',
      });
      const { data, error } = await res.json();
      if (!error) {
        setScheduledMessages(prev => prev.filter(msg => msg.id !== id));
        setDeleteLoading("");
        setDeleteStatus("message deleted successfully..");

      } else {
        const result = await res.json();
        setDeleteStatus(result.error || 'Failed to delete message.');
      }
    } catch (error) {
      setDeleteStatus('Error deleting message.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    console.log("send time ", sendTime);

    try {
      const res = await fetch('/api/chatservice/scheduleMessages/setSchedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: senderId,
          receiver_id: receiverId,
          message_content: messageContent,
          send_time: sendTime,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus('Message scheduled successfully!');
        setMessageContent('');
        setSendTime('');
      } else {
        setStatus(result.error || 'Failed to schedule message.');
      }
    } catch (error) {
      setStatus('Error submitting the form.');
    }
    finally {
      fetchScheduledMessages();
    }

    setLoading(false);
  };

  return (
    <div className="w-full h-full overflow-auto flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* View Scheduled Messages */}
      <div className="mb-10 border-b border-gray-300 dark:border-gray-700 pb-10 rounded-sm p-4 sm:p-6 w-full max-w-3xl bg-gray-50 dark:bg-gray-800 shadow">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Scheduled Messages</h2>

        {deleteStatus && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">{deleteStatus}</p>
        )}

        {fetchLoad ? (
          <div className="text-base sm:text-lg">Loading...</div>
        ) : scheduledMessages.length === 0 ? (
          <p className="text-base">No scheduled messages.</p>
        ) : (
          <ul className="space-y-4 mt-4">
            {scheduledMessages.map((msg) => (
              <li
                key={msg.id}
                className="border p-4 rounded shadow flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 w-full bg-white dark:bg-gray-700"
              >
                <div className="flex-1">
                  <p className="text-base sm:text-lg break-words">{msg.message_content}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Send at: {new Date(msg.send_time).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm sm:text-base min-w-[100px] flex items-center justify-center transition-all duration-300"
                  disabled={deleteLoading ? true : false}
                >
                  {deleteLoading === msg.id ? <CircularLoader /> : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Schedule Form */}
      <div className="w-full max-w-3xl bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded shadow text-base sm:text-lg">
        <label className="block mb-2 font-semibold">Schedule New Message</label>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex flex-col w-full"
        >
          {/* Message Input */}
          <div>
            <label className="block mb-1 font-medium">Message Content</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              required
              className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          {/* Send Time Input */}
          {messageContent && (
            <div>
              <label className="block mb-1 font-medium">Send Time</label>
              <input
                type="datetime-local"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="border p-2 w-full rounded bg-[#a5a4a4] text-black dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 min-w-[12rem] flex justify-center items-center transition-all duration-300 ease-in-out"
          >
            {loading ? <CircularLoader /> : "Schedule Message"}
          </button>

          {/* Status */}
          {status && <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{status}</div>}
        </form>
      </div>
    </div>

  );
};

export default ScheduleMessageForm;
