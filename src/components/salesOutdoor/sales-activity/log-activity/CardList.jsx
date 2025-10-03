'use client'

import { HiOutlineClipboardDocumentList, HiCalendarDays, HiMiniUser } from "react-icons/hi2"; 

function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function CardList({ data }) {
    return (
        <div className="px-4 pb-4">
            <div className="w-full h-auto rounded-xl bg-white px-4 py-3 flex flex-col gap-2 shadow">
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2 items-center">
                        <HiOutlineClipboardDocumentList className="text-blue-6"/>
                        <p className="text-sm font-semibold">{data?.activityname || '-'}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <p className="text-sm font-semibold">{data?.sales || '-'}</p>
                        <HiMiniUser className="text-blue-6"/>
                    </div>
                </div>
                <div className="h-full flex flex-col justify-between">
                    <div className="bg-gray-3 p-2 rounded border border-gray-5 flex justify-center px-2">
                        <div className="w-full h-full flex flex-col justify-left items-start">
                            <p className="text-xs text-gray-12/70">Activity Log</p>
                            <p 
                                className="text-sm w-full"
                                dangerouslySetInnerHTML={{ 
                                    __html: data?.activitylog?.replace(/\\n/g, '<br />') || '-' 
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <span className={`capitalize text-xs px-2 py-1 rounded-full bg-opacity-20 `}>{data?.activitytype || '-'}</span>
                    </div>
                    <div className="flex gap-1 items-center justify-start">
                        <HiCalendarDays className="text-sm text-gray-12/70"/>
                        <p className="text-xs text-gray-12/70">{formatDate(data?.activitydate)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}