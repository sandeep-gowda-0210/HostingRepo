'use client'
import { User } from "@/context/UserContext";
import { useUserData } from "@/context/UserContext"
import { useState, useEffect } from 'react';
export default function Profile(){
    let {user} = useUserData();
    console.log("this is page",user);
    return <div className="flex flex-col w-full h-full items-center px-4 py-6 dark:bg-[#0f172a] bg-white text-gray-800 dark:text-gray-100">
  <div className="text-2xl sm:text-5xl font-extralight text-blue-500 dark:text-blue-300 mb-6">
    Profile
  </div>

  <div className="flex flex-col lg:flex-row w-full max-w-7xl items-start gap-10 overflow-y-auto">
    {/* LEFT SECTION: Profile Picture & Upload */}
    <div className="flex flex-col items-center w-full lg:w-1/3 gap-6">
      <div className="relative">
        <img
          src={`${user?.profile_url}?t=${new Date().getTime()}`}
          alt="Profile"
          className="h-60 w-60 object-cover rounded-full border-4 border-blue-300 dark:border-blue-600"
        />
        <label
          htmlFor="fileInput"
          className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full cursor-pointer hover:scale-105 transition-all"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 15 15"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600 dark:text-blue-300"
          >
            <path d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645Z" />
            <path d="m15 5-4-4" />
          </svg>
        </label>
      </div>
      <UploadForm />
    </div>

    {/* RIGHT SECTION: User Data Form */}
    <div className="flex-1 w-full">
      <UpdateUserData />
    </div>
  </div>
</div>

}
function UploadForm() {
    let {user,refreshUser} = useUserData();
    const [image, setImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    useEffect(() => {
      if (image) {
        const url = URL.createObjectURL(image)
        setPreviewUrl(url)
  
        return () => URL.revokeObjectURL(url)
      }
    }, [image])
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!image) return

      const formData = new FormData()
      formData.append('file', image)
        formData.append('user_id',user!.user_id)
      const res = await fetch('/api/userservice/profile', {
        method: 'POST',
        body: formData,
      })
  
      const data = await res.json()
      console.log('Uploaded URL:', data)
      if(res.status===200){
        setPreviewUrl(null);
        confirm('successfully changed profile url');
        await refreshUser();
      }
    }
  
    return (
      <form 
  onSubmit={handleSubmit} 
  className="flex flex-col items-center sm:items-start space-y-4 w-full sm:w-auto mt-10 px-4 sm:px-10"
>
  <div className="flex flex-col items-center sm:items-start w-full max-w-xs sm:max-w-sm">
    {/* Hidden File Input */}
    <input
      type="file"
      id="fileInput"
      accept="image/*"
      onChange={(e) => setImage(e.target.files?.[0] || null)}
      className="hidden"
    />

    {/* Upload Button (conditionally shown) */}
    {previewUrl && (
      <button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-4 py-2 rounded w-fit text-sm sm:text-base"
      >
        Upload
      </button>
    )}

    {/* Image Preview */}
    {previewUrl && (
      <div className="mt-4 text-center sm:text-left">
        <p className="text-sm text-gray-600 mb-1">Preview:</p>
        <img 
          src={previewUrl} 
          alt="Image Preview" 
          className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded shadow-md"
        />
      </div>
    )}
  </div>
</form>

    )
  }

// Dummy hook for example
// function useUserData() {
//   const [user, setUser] = useState<User | null>(null);

//   const refreshUser = () => console.log("User refreshed");

//   return { user, refreshUser, setUser };
// }

function UpdateUserData() {
  const { user,refreshUser } = useUserData();
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);
  const [originalUser, setOriginalUser] = useState<Partial<User> | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      const partialUser = {
        user_name: user.user_name,
        first_name: user.first_name,
        last_name: user.last_name,
        bio:user.bio
      };
      setEditUser(partialUser);
      setOriginalUser(partialUser);
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (key: string, value: string) => {
    setEditUser(prev => ({
      ...prev!,
      [key]: value
    }));
  };

  const handleSave = async () => {
    console.log("Saving data:", editUser);
    try {
      await fetch(`/api/userservice/profile-details?user_id=${user?.user_id}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });
      setEditingField(null);
      setOriginalUser(editUser);
      refreshUser();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleCancel = () => {
    setEditUser(originalUser);
    setEditingField(null);
  };

  return (
    <div className="w-[90%] max-w-4xl mx-auto p-4 overflow-auto text-sm">
  {loading ? (
    <div className="text-gray-400 text-center text-xl">Loading...</div>
  ) : (
    <form className="space-y-6">
      {editUser &&
        Object.entries(editUser).map(([key, value]) => {
          const isEditing = editingField === key;

          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#1e1e1e] p-4 rounded-xl border border-gray-700 shadow-md transition-all"
            >
              <label htmlFor={key} className="font-semibold text-gray-300 sm:w-1/4 capitalize">
                {key.replaceAll("_", " ")}
              </label>

              <textarea
                id={key}
                className={`bg-transparent border-b-2 text-gray-100 p-2 outline-none transition duration-300 resize-none w-full sm:w-3/4 ${
                  isEditing
                    ? 'border-blue-500 focus:ring-2 focus:ring-blue-500'
                    : 'border-gray-600'
                }`}
                disabled={!isEditing}
                placeholder="-"
                value={value ?? ""}
                onChange={(e) => handleInputChange(key, e.target.value)}
              />

              <div className="flex gap-2 items-center mt-2 sm:mt-0">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setEditingField(key)}
                    className="p-2 text-gray-300 hover:text-white transition hover:scale-105"
                    aria-label="Edit"
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
                      className="lucide lucide-pencil"
                    >
                      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
    </form>
  )}
</div>

  );
}
