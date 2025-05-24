import { useId } from "react";

export async function frontendUploadFile(
  file: File,
  userId: string,
  parentId?: string
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);
  if (parentId) formData.append("parent_id", parentId);

  const res = await fetch("/api/documentservice/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload file");
  return await res.json();
}




export async function frontendDeleteFileOrFolder(id: string, userId: string) {
    console.log("id user id ",id, userId);
    
  const res = await fetch(`/api/documentservice/delete`, {
    method: "DELETE",
    body: JSON.stringify({id, user_id:userId})
  });

  if (!res.ok) throw new Error("Failed to delete");
  return await res.json();
}





export async function frontendRenameFileOrFolder(
  id: string,
  newName: string,
  userId: string
) {
  const res = await fetch("/api/documentservice/rename", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, new_name: newName, user_id: userId }),
  });

  if (!res.ok) throw new Error("Failed to rename");
  return await res.json();
}





export async function frontendPreviewFile(id: string, userId: string) {
  const res = await fetch(`/api/documentservice/preview?id=${id}&user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to preview file");

  const contentType = res.headers.get("Content-Type");
  if (contentType?.startsWith("application/json")) {
    return await res.json();
  } else {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
}


export async function listFiles(userId: string, parentId?: string | null) {
  const queryParams = new URLSearchParams({
    user_id: userId,
  });

  if (parentId) {
    queryParams.append("parent_id", parentId);
  }

  const res = await fetch(`/api/documentservice/list?${queryParams.toString()}`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch file list");
  return await res.json();
}



export async function frontendCreateFolder(
  name: string,
  userId: string,
  parentId?: string | null
) {
  const res = await fetch("/api/documentservice/create-folder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      user_id: userId,
      parent_id: parentId || null,
    }),
  });

  if (!res.ok) throw new Error("Failed to create folder");
  return await res.json();
}



export async function shareDocuments(id: string, userId: string, receiverId:string){
  
  const res = await fetch(`/api/documentservice/share-docs`,{
    method: 'POST',
      body: JSON.stringify({ id, user_id:userId, receiver_id:receiverId }),
      headers: {
        'Content-Type': 'application/json',
      },
  });
  console.log("result",res);
  
  if (!res.ok) throw new Error("Failed to preview file");

  const contentType = res.headers.get("Content-Type");
  if (contentType?.startsWith("application/json")) {
    return await res.json();
  } else {
    console.log("result ",res);
    
    return res;
  }
}