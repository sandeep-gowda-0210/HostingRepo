import { useUserData } from "@/app/pages/home/layout";
import { useEffect, useState } from "react";

export default function AutoReplySettings() {
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  let { user, selectedUser } = useUserData();
  const [fetchLoad, setFetchLoad] = useState(true);


  useEffect(() => {
    if (user?.user_id && selectedUser?.user_id) {
      const fetchAutoReplyData = async () => {
        const res = await fetch(`/api/chatservice/autoResponse/getAutoResponse?from_user_id=${user?.user_id}&to_user_id=${selectedUser?.user_id}`)
        const data = (await res.json()).data;
        // console.log("d", data);

        try {
          if (data !== undefined && data.error !== undefined) {
            console.log("error");

            setStatus(`error ${data.error}`);
          }
          if (data.history_period !== undefined) {
            console.log("2");

            setAutoReplyEnabled(true);
            setHistoryDays(data.history_period);
          }
        }
        catch (error) {
          console.error("There is a error ", error);
        }
        finally {
          setFetchLoad(false);
        }


      }

      fetchAutoReplyData();
    }
    else {
      setStatus("select user first");
    }

  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");


    try {
      // Call your API or handler here
      // await new Promise((res) => setTimeout(res, 1000)); // Simulate delay
      if (user?.user_id && selectedUser?.user_id) {
        let user_id = user.user_id;
        let selecteduser_id = selectedUser.user_id
        await fetch("/api/chatservice/autoResponse/setAutoResponse",
          {
            method: 'POST',
            body: JSON.stringify({ autoReplyEnabled, historyDays, user_id, selecteduser_id }),
            headers: {
              'Content-Type': 'application/json',
            },
          })

        // Example: replace with your actual API logic
        console.log({
          autoReplyEnabled,
          historyDays,
        });

        setStatus("Auto-reply settings saved successfully!");
      }
      else {
        setStatus("select user first");
      }
    } catch (err) {
      setStatus("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    fetchLoad ? (
      <div className="h-full w-full flex justify-center items-center  text-lg sm:text-xl text-gray-800 dark:text-gray-200">
        Loading...
      </div>
    ) : (
      <form
        onSubmit={handleSubmit}
        className="space-y-8 px-4 sm:px-8 py-6 mt-10 mx-auto  w-full max-w-xl rounded shadow flex flex-col justify-center items-center bg-white dark:bg-gray-800"
      >
        {/* Toggle Auto Reply */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-between">
          <label className="text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-200">
            Enable Auto-Reply
          </label>
          <button
            type="button"
            onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${autoReplyEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* History Days Input */}
        <div className="flex flex-col items-start w-full">
          <label className="block mb-1 font-medium text-base sm:text-lg text-gray-800 dark:text-gray-200">
            Days of History to Consider
          </label>
          <input
            type="number"
            min={1}
            max={90}
            value={historyDays}
            onChange={(e) => setHistoryDays(Number(e.target.value))}
            required
            className="border p-2 w-full rounded bg-gray-200 text-black text-base sm:text-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 cursor-pointer transition-all duration-300 ease-in-out text-base sm:text-lg disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>

        {/* Status Message */}
        {status && (
          <div className="text-sm mt-2 text-center w-full text-gray-700 dark:text-gray-300">
            {status}
          </div>
        )}
      </form>
    )
  )

}
