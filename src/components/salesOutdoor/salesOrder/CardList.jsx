'use client'

import { useEffect, useState } from "react"
import { HiOutlineTicket } from "react-icons/hi2";
import { HiCalendarDateRange } from "react-icons/hi2";
import { HiCheckCircle, HiClock, HiXCircle } from "react-icons/hi";

function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
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
        const status = data?.status;
        if (status === 'pending') {
            setStatusClass({
                text: 'text-orange-5',
                bg: 'bg-orange-5',
            });
        } else if (status === 'rejected') {
            setStatusClass({
                text: 'text-red-7',
                bg: 'bg-red-7',
            });
        } else if (status === 'approved') {
            setStatusClass({
                text: 'text-green-7',
                bg: 'bg-green-7',
            });
        } else {
            setStatusClass({
                text: 'text-gray-5',
                bg: 'bg-gray-3',
            });
        }
    }, [data?.status]);

    return (
        <div className="px-4 pb-4">
            <div className="w-full h-32 rounded-xl bg-white px-4 py-3 flex flex-col gap-2 shadow">
                <div className="flex gap-2 items-center">
                    <HiOutlineTicket className="text-blue-6"/>
                    <p className="text-sm font-semibold">{data?.id || '-'}</p>
                </div>
                <div className="h-full flex flex-col justify-between">
                    <div className="bg-gray-3 p-2 rounded border border-gray-5 flex justify-center px-2">
                        <div className="w-8/12 h-full flex flex-col justify-left items-start">
                            <p className="text-xs text-gray-12/70">Customer</p>
                            <p className="text-sm truncate w-full">{data?.customerName || '-'}</p>
                        </div>
                        <div className="w-4/12 h-full flex flex-col justify-right items-end">
                            <p className="text-xs text-gray-12/70">Total</p>
                            <p className="text-sm truncate">{data?.total || '-'}</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                            <Icon title={data?.status || ''}/>
                            <p className={`capitalize text-xs ${statusClass.text}`}>{data?.status || '-'}</p>
                        </div>
                        <div className="flex gap-1 items-center justify-start">
                            <HiCalendarDateRange className="text-sm text-gray-12/70"/>
                            <p className="text-xs text-gray-12/70">{formatDate(data?.date)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
