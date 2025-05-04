'use client';

import { useState } from 'react';

interface ScheduleMessageFormProps {
  senderId: string;
  receiverId: string;
}

const ScheduleMessageForm: React.FC<ScheduleMessageFormProps> = ({ senderId, receiverId }) => {
  const [messageContent, setMessageContent] = useState('');
  const [sendTime, setSendTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

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

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 mx-auto text-2xl  rounded shadow flex flex-col justify-center items-center h-full w-full">
      <div className=''>
        <label className="block mb-1 font-medium">Message Content</label>
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          required
          className="border  p-2 rounded"
        />
      </div>

      <div className=''>
        <label className="block mb-1 font-medium">Send Time</label>
        <input
          type="datetime-local"
          value={sendTime}
          onChange={(e) => setSendTime(e.target.value)}
          required
          min={new Date().toISOString().slice(0, 16)}
          className="border p-2 w-full text-black rounded bg-[#a5a4a4]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition-all duration-300 ease-in-out"
      >
        {loading ? 'Scheduling...' : 'Schedule Message'}
      </button>

      {status && <div className="text-sm mt-2">{status}</div>}
    </form>
  );
};

export default ScheduleMessageForm;
