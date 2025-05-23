import { renameFileOrFolder } from '@/services/documentService';
import cookie from 'cookie';
import { NextResponse } from 'next/server';

export async function PATCH(req:Request){
    let cookies = cookie.parse(req.headers.get('cookie')||'');
    let token = cookies['login-token']!;
    const {new_name, id , user_id} = await req.json();
    // console.log("The list is ", name, parent_id || null, user_id);
    // return NextResponse.json({Message:"No files"}, {status:200});
    
    if( !new_name || !id || !user_id){
        return NextResponse.json({error:"no file uploaded"},{status:400});
    }
    const {data:folder_data,error} = await renameFileOrFolder(id,new_name,user_id, token);
    if(error!==null || folder_data===null){
        // if(error?.code === '23505')
        //     return NextResponse.json({error: "folder name already used"},{status:401});
        
        return NextResponse.json({error: "Error creating folder"},{status:401});
    }
    return NextResponse.json({data:folder_data},{status:200});
}