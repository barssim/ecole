import React, { useState } from "react";
import { Link } from "react-router-dom";


const TeacherBlock = ({ isAuthorized, content }) => {
const [showActivites, setShowActivites] = useState(false);
  return (
     <div className="bg-white p-4 shadow-md rounded-md">
             <li
                      className={`menu-item ${isAuthorized ? "menu-item-active" : "menu-item-inactive"}`}
                      onClick={() => isAuthorized && setShowActivites(!showActivites)}
                    >
                      {content.enseignant}
                    </li>
                    {showActivites && (
           <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">

             <li>
                 <Link
                   to="/enseignant/cours"
                   className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 inline-block"
                 >
                   {content.courses}
                 </Link>
               </li>
               <li>
                 <Link
                   to="/enseignant/devoirs"
                   className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 inline-block"
                 >
                   {content.assignments}
                 </Link>
               </li>
               <li>
                 <Link
                   to="/enseignant/notes"
                   className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 inline-block"
                 >
                   {content.grades}
                 </Link>
               </li>
               <li>
                 <Link
                   to="/enseignant/shared-documents"
                   className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 inline-block"
                 >
                   {content.shared_documents}
                 </Link>
               </li>
             <li>
               <Link
                 to="/enseignant/parent-meetings"
                 className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 inline-block"
               >
                 {content.parent_meetings}
               </Link>
             </li>
<li>
               <Link
                 to="/enseignant/absence"
                 className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 inline-block"
               >
                 {content.teacher_absence}
               </Link>
             </li>
           </ul>
           )}
         </div>
  );
}

export default TeacherBlock;

