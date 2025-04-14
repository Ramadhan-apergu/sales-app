'use client'

import { HiOutlineTicket } from "react-icons/hi2";
import { HiCalendarDateRange } from "react-icons/hi2";

export default function CardList({ data }) {

    return (
        <div className="px-4 pb-4">
            <div className="w-full rounded-xl bg-white px-4 py-3 flex flex-col gap-2 shadow">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <HiOutlineTicket className="text-blue-6"/>
                        <p className="text-sm font-semibold">{data?.id || '-'}</p>
                    </div>
                    <div className="flex gap-1 items-center justify-start">
                        <HiCalendarDateRange className="text-sm text-gray-12/70"/>
                        <p className="text-xs text-gray-12/70">{data?.date || '-'}</p>
                    </div>
                </div>
                <div className="h-full flex flex-col justify-between">
                    <div className="h-12 bg-gray-3 rounded border border-gray-5 flex justify-center px-2">
                        <div className="w-8/12 h-full flex flex-col justify-center items-start">
                            <p className="text-xs text-gray-12/70">Customer</p>
                            <p className="text-sm truncate w-full">{data?.customerName || '-'}</p>
                        </div>
                        <div className="w-4/12 h-full flex flex-col justify-center items-start">
                            <p className="text-xs text-gray-12/70">Amount</p>
                            <p className="text-sm truncate w-full capitalize">{data?.amount || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
