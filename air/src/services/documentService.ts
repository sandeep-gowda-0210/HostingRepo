import { v4 as uuidv4 } from 'uuid';
import { createSupabaseWithToken } from "@/utils/socket";
import { pushMessage } from './chatService';
import { Message } from '@/app/pages/home/chat-page/chat-window/page';

export const createFolder = async (name: string, parent_id: string, token: string, user_id: string) => {
  try {
    const supabaseWithToken = await createSupabaseWithToken(token);
    const { data, error } = await supabaseWithToken
      .from('DocumentsMeta')
      .insert([{
        user_id,
        name,
        type: 'folder',
        parent_id: parent_id || null,
      }])
      .select()
      .single();

    if (error) {
      console.log("Error while creating a folder: ", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error("Error while creating a folder: ", err);
    return { data: null, err };
  }
};




type DocumentItem = {
  id: string;
  user_id: string;
  type: 'file' | 'folder';
  path?: string;
};

export const deleteFileOrFolder = async (id: string, token: string, user_id: string) => {
  try {
    const supabase = await createSupabaseWithToken(token);

    // Fetch the root item
    const { data: rootItem, error: findError } = await supabase
      .from('DocumentsMeta')
      .select('id, user_id, type, path')
      .eq('id', id)
      .single();

    if (findError || !rootItem) {
      return { data: null, error: 'File or folder not found' };
    }

    if (rootItem.user_id !== user_id) {
      return { data: null, error: 'You are not authorized to delete this' };
    }

    // Recursive function to get all descendants of a folder
    const getAllDescendants = async (parentId: string): Promise<DocumentItem[]> => {
      const { data: children, error } = await supabase
        .from('DocumentsMeta')
        .select('id, user_id, type, path')
        .eq('parent_id', parentId);

      if (error || !children) return [];

      const all: DocumentItem[] = [];

      for (const child of children) {
        all.push(child);
        if (child.type === 'folder') {
          const descendants = await getAllDescendants(child.id);
          all.push(...descendants);
        }
      }

      return all;
    };

    // Get all items to delete
    const itemsToDelete: DocumentItem[] =
      rootItem.type === 'folder'
        ? [rootItem, ...(await getAllDescendants(rootItem.id))]
        : [rootItem];

    // Collect paths of all files to delete from storage
    const filePaths = itemsToDelete
      .filter((item) => item.type === 'file' && item.path)
      .map((file) => file.path!);

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove(filePaths);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        return { data: null, error: 'Failed to delete files from storage' };
      }
    }

    // Delete all metadata entries
    const idsToDelete = itemsToDelete.map((item) => item.id);
    const { error: deleteError } = await supabase
      .from('DocumentsMeta')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error(deleteError);
      return { data: null, error: 'Failed to delete from metadata' };
    }

    return { data: 'Deleted successfully', error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: 'Server error' };
  }
};




export const listFiles = async (user_id: string, parent_id: string | null, token: string) => {
  try {
    const supabaseWithToken = await createSupabaseWithToken(token);

    if (parent_id === null) {
      const { data, error } = await supabaseWithToken
        .from('DocumentsMeta')
        .select('*')
        .eq('user_id', user_id)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return { data: null, error: 'Failed to list files/folders' };
      }

      return { data, error: null };
    }
    else {
      const { data, error } = await supabaseWithToken
        .from('DocumentsMeta')
        .select('*')
        .eq('user_id', user_id)
        .eq('parent_id', parent_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return { data: null, error: 'Failed to list files/folders' };
      }

      return { data, error: null };

    }
  } catch (err) {
    console.error(err);
    return { data: null, error: 'Server error' };
  }
};





export const renameFileOrFolder = async (id: string, new_name: string, user_id: string, token: string) => {
  try {
    const supabaseWithToken = await createSupabaseWithToken(token);

    const { data: existingFile, error: findError } = await supabaseWithToken
      .from('DocumentsMeta')
      .select('user_id')
      .eq('id', id)
      .single();

    if (findError || !existingFile) {
      return { data: null, error: 'File or folder not found' };
    }

    if (existingFile.user_id !== user_id) {
      return { data: null, error: 'You are not authorized to rename this' };
    }

    const { data: updatedData, error: updateError } = await supabaseWithToken
      .from('DocumentsMeta')
      .update({ name: new_name })
      .eq('id', id).select().single();

    if (updateError) {
      console.error(updateError);
      return { data: null, error: 'Failed to rename' };
    }
    console.log("renamed successfully");

    return { data: updatedData, error: null };
  } catch (err) {
    console.error(err);
    return { data: null, error: 'Server error' };
  }
};



export const uploadFile = async (file: File, user_id: string, parent_id: string | null, token: string) => {
  try {
    const supabaseWithToken = await createSupabaseWithToken(token);

    if (!file) {
      return { data: null, error: 'No file uploaded' };
    }

    const fileName = `${uuidv4()}_${file.name}`;

    // ✅ Correct: Upload as Stream
    // const fileStream = streamifier.createReadStream(file.buffer);

    const { error: uploadError } = await supabaseWithToken.storage
      .from('documents')
      .upload(fileName, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return { data: null, error: 'Error uploading file to storage' };
    }

    // Get the public URL
    const { data: { publicUrl } } = await supabaseWithToken
      .storage
      .from('documents')
      .getPublicUrl(fileName);

    // Save metadata in DB
    const { error: insertError } = await supabaseWithToken
      .from('DocumentsMeta')
      .insert([{
        user_id,
        name: file.name,
        type: 'file',
        url: publicUrl,
        parent_id: parent_id || null,
        path: fileName
      }]);

    if (insertError) {
      console.error(insertError);
      return { data: null, error: 'Error saving file metadata' };
    }
    console.log('File uploaded successfully');

    return { data: publicUrl, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Server error' };
  }
};





export const previewFile = async (id: string, user_id: string, token: string) => {
  try {
    const supabaseWithToken = await createSupabaseWithToken(token);

    const { data, error } = await supabaseWithToken
      .from('DocumentsMeta')
      .select('url, user_id')
      .eq('id', id)
      .single();

    if (error || !data || data === null) {
      console.error(error);
      return { data: null, error: 'File not found' };
    }

    if (data.user_id !== user_id) {
      return { data: null, error: 'You are not authorized to view this file' };
    }

    if (!data.url) {
      return { data: null, error: 'No preview available' };
    }

    return { data, error: null };
  } catch (err) {
    console.error(err);
    return { data: null, error: 'Server error' };
  }
};


export const shareFiles = async (id: string, user_id: string, receiver_id: string, token: string) => {
  try {
    const supabaseWithToken = await createSupabaseWithToken(token);

    const { data, error } = await supabaseWithToken
      .from('DocumentsMeta')
      .select('url, user_id, name, path')
      .eq('id', id)
      .single();

    if (error || !data || data === null) {
      console.error(error);
      return { data: null, error: 'File not found' };
    }

    if (data.user_id !== user_id) {
      return { data: null, error: 'You are not authorized to view this file' };
    }

    if (!data.url) {
      return { data: null, error: 'No preview available' };
    }
    const { data: fileData, error: fileError } = await supabaseWithToken.storage
      .from("documents")
      .download(data.path);
    if (fileError || !fileData || fileData === null) {
      console.log("The error is ", fileError);
      return { data: null, error: fileError.message };
    }
    else {
      //   const fileData = await new Promise<string>((resolve, reject) => {
      //   const reader = new FileReader();
      //   reader.onload = () => resolve(reader.result as string);
      //   reader.onerror = reject;
      //   reader.readAsDataURL(downloadFileData);
      // });

      function getLocalDateTimeString() {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localTime = new Date(now.getTime() - offset * 60 * 1000);
        return localTime.toISOString().slice(0, 16);
      }
      // const arrayBuffer = await fileData.arrayBuffer();
      const arrayBuffer = await fileData.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');

      const fileBlob = `data:${fileData.type};base64,${base64String}`;
      const messagePayload: Partial<Message> = {
        sender_id: user_id,
        receiver_id,
        type: fileData.type,
        time_stamp: getLocalDateTimeString(),
        file: {
          name: data.name,
          type: fileData.type,
          data: fileBlob, // Or convert to base64 if needed
        },
      };
      let { data: pushedData, error: pushedError } = await pushMessage(token, messagePayload)
      if (pushedError) {
        console.log("error ", pushedError);
        return { data: pushedData, error: null }
      }

      return { data: pushedData, error: null };
    }
  } catch (err) {
    console.error(err);
    return { data: null, error: 'Server error' };
  }
};



export default async function documentSearchHandler(query: string, userId: string, parentId: string, token: string) {
  const supabaseWithToken = await createSupabaseWithToken(token);
  // console.log("entered");
  
  if (parentId===null) {
    const { data, error } = await supabaseWithToken
      .from('DocumentsMeta') // replace with your actual table name
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('user_id', userId)

    // console.log("searched data", data, error);
    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  }
  else{
    // console.log("entereddd", parentId);
    
  const { data, error } = await supabaseWithToken
    .from('DocumentsMeta') // replace with your actual table name
    .select('*')
    .ilike('name', `%${query}%`)
    .eq('user_id', userId)
    .eq('parent_id',parentId);

  // console.log("searched data", data, error);
  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
}
