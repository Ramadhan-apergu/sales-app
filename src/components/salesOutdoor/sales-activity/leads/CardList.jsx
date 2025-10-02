'use client'

import { useEffect, useState } from "react"
import { HiOutlineTicket, HiMiniUser, HiCalendarDays } from "react-icons/hi2";
import { HiCheckCircle, HiClock, HiXCircle } from "react-icons/hi";

function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function Icon({ title }) {
    let IconComponent = null;
    let style = ''
    switch (title) {
        case 'approved':
            IconComponent = HiCheckCircle;
            style = 'text-green-7'
            break;
        case 'pending':
            IconComponent = HiClock;
            style = 'text-orange-5'
            break;
        case 'rejected':
            IconComponent = HiXCircle;
            style = 'text-red-7'
            break;
        default:
            IconComponent = null;
    }

    return IconComponent ? <IconComponent className={style} /> : null;
}

export default function CardList({ data }) {
    const [statusClass, setStatusClass] = useState({
        text: 'text-gray-5',
        bg: 'bg-gray-3',
    });

    useEffect(() => {
        const status = data?.status?.toLowerCase();
        if (status === 'prospecting') {
            setStatusClass({
                text: 'text-green-7',
                bg: 'bg-green-7',
            });
        } else if (status === 'pending' || status === 'negotiation') {
            setStatusClass({
                text: 'text-orange-5',
                bg: 'bg-orange-5',
            });
        } else if (status === 'closed') {
            setStatusClass({
                text: 'text-red-7',
                bg: 'bg-red-7',
            });
        } else {
            setStatusClass({
                text: 'text-black-5',
                bg: 'bg-black-3',
            });
        }
    }, [data?.status]);

    return (
        <div className="px-4 pb-4">
            <div className="w-full h-auto rounded-xl bg-white px-4 py-3 flex flex-col gap-2 shadow">
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2 items-center">
                        <HiOutlineTicket className="text-blue-6"/>
                        <p className="text-sm font-semibold">{data?.leadid || '-'}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <p className="text-sm font-semibold">{data?.ownername || '-'}</p>
                        <HiMiniUser className="text-blue-6"/>
                    </div>
                </div>
                <div className="h-full flex flex-col justify-between">
                    <div className="bg-gray-3 p-2 rounded border border-gray-5 flex justify-center px-2">
                        <div className="w-full h-full flex flex-col justify-left items-start">
                            <p className="text-xs text-gray-12/70">Lead Name</p>
                            <p className="text-sm truncate w-full">{data?.name || '-'}</p>
                        </div>
                        <div className="w-full h-full flex flex-col justify-left items-start">
                            <p className="text-xs text-gray-12/70">Company Name</p>
                            <p className="text-sm truncate w-full">{data?.companyname || '-'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <span className={`capitalize text-xs px-2 py-1 rounded-full ${statusClass.bg} bg-opacity-20 ${statusClass.text}`}>{data?.status || '-'}</span>
                    </div>
                    <div className="flex gap-1 items-center justify-start">
                        <HiCalendarDays className="text-sm text-gray-12/70"/>
                        <p className="text-xs text-gray-12/70">{formatDate(data?.addedon)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
