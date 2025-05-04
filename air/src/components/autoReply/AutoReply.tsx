import { useState } from "react";

export default function AutoReplySettings() {
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      // Call your API or handler here
      await new Promise((res) => setTimeout(res, 1000)); // Simulate delay

      // Example: replace with your actual API logic
      console.log({
        autoReplyEnabled,
        historyDays,
      });

      setStatus("Auto-reply settings saved successfully!");
    } catch (err) {
      setStatus("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 mx-auto text-2xl rounded shadow flex flex-col justify-center items-center h-full w-full"
    >
      <div className=" flex">
        <label className="block mb-1 font-medium">Enable Auto-Reply</label>
        <input
          type="checkbox"
          checked={autoReplyEnabled}
          onChange={(e) => setAutoReplyEnabled(e.target.checked)}
          className="scale-150 cursor-pointer"
        />
      </div>

      <div className="">
        <label className="block mb-1 font-medium">
          Days of History to Consider
        </label>
        <input
          type="number"
          min={1}
          max={90}
          value={historyDays}
          onChange={(e) => setHistoryDays(Number(e.target.value))}
          required
          className="border p-2 w-full text-black rounded bg-[#a5a4a4]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition-all duration-300 ease-in-out"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>

      {status && <div className="text-sm mt-2">{status}</div>}
    </form>
  );
}
