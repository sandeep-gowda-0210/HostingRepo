import { uploadFile } from '@/services/documentService';
import cookie from 'cookie';
import { NextResponse } from 'next/server';

export async function POST(req:Request){
    let cookies = cookie.parse(req.headers.get('cookie')||'');
    let token = cookies['login-token']!;
    // const {name,parent_id, user_id} = await req.json();
    // console.log("The list is ", name, parent_id || null, user_id);
    // return NextResponse.json({Message:"No files"}, {status:200});
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const user_id = formData.get('user_id')?.toString();
    const parent_id = formData.get('parent_id')?.toString();
    console.log("the data ", file, user_id, parent_id);
    
    if( !user_id || !file){
        return NextResponse.json({error:"no file uploaded"},{status:400});
    }
        if(!file || !user_id){
            return NextResponse.json({error:"no file uploaded"},{status:400});
        }
        const {data:url_path,error} = await uploadFile(file, user_id, parent_id || null,token);
    
        if(error)
            return NextResponse.json({error:error},{status:401});
        return NextResponse.json({message:'uploaded successfully',url_path},{status:200});
}