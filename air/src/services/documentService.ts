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



export const deleteFileOrFolder = async (id: string, token: string, user_id: string) => {
  try {
    const supabaseWithToken = await createSupabaseWithToken(token);
    const { data: existingFile, error: findError } = await supabaseWithToken
      .from('DocumentsMeta')
      .select('id, user_id, url, type')
      .eq('id', id)
      .single();

    if (findError || !existingFile) {
      return { data: null, error: 'File or folder not found' };
    }

    if (existingFile.user_id !== user_id) {
      return { data: null, error: 'You are not authorized to delete this' };
    }

    if (existingFile.type === 'file' && existingFile.url) {
      const filePath = existingFile.url.split('/documents/')[1];
      await supabaseWithToken.storage.from('documents').remove([filePath]);
    }

    const { error: deleteError } = await supabaseWithToken
      .from('DocumentsMeta')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error(deleteError);
      return { data: null, error: 'Failed to delete file/folder' };
    }

    return { data: 'Deleted successfully', error: null };
  } catch (err) {
    console.error(err);
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
        time_stamp:getLocalDateTimeString(),
        file: {
          name: data.name,
          type: fileData.type,
          data: fileBlob, // Or convert to base64 if needed
        },
      };
      let pushedError = await pushMessage(token, messagePayload)
      if(pushedError){
        console.log("error ",pushedError);
        return {data,error:null}
      }

      return { data:"successfully sent", error: null };
    }
  } catch (err) {
    console.error(err);
    return { data: null, error: 'Server error' };
  }
};