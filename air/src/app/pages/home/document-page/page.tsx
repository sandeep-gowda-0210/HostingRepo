// 'use client'
// import { useEffect, useState } from "react";
// import { useUserData } from "../layout"

// export default function Document(){
//     let {user} = useUserData();
//     return <div className="flex h-full w-full justify-center text-5xl text-blue-300 font-extralight">
//         Document Storage Page.
//     </div>
// }




// // let [email, setEmail] = useState<string|null>(null);
// // useEffect(()=>{
// //     const savedUser:{email?:string} = JSON.parse(localStorage.getItem('user') || '{}');
// //     if (savedUser["email"]) {
// //       setEmail(savedUser["email"]);
// //     }
// // },[])

'use client';

import React from 'react';
import { useDocuments } from './hooks/useSupabaseDocClient';
import { DocumentList } from './components/DocumentList';
import { UploadFile } from './components/DocumentUpload';

export default function DocumentsPage() {
  const { documents, loading, error, upload, rename, remove } = useDocuments();

  return (
    <div className="p-4">
      <h1>Document Storage</h1>

      <UploadFile onUpload={upload} />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <DocumentList
        documents={documents}
        onRename={rename}
        onDelete={remove}
      />
    </div>
  );
}
