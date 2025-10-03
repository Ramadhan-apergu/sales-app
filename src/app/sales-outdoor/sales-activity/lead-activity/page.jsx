'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import Layout from "@/components/salesOutdoor/Layout";
import { Spin, Select, Empty, message } from 'antd';
import FloatingButton from "@/components/salesOutdoor/salesOrder/FloatingButton";
import LeadActivityFetch from "@/modules/salesApi/crm/leadActivity";
import Link from 'next/link';
import { getResponseHandler } from "@/utils/responseHandlers";
import { formatDateTimeToShort } from "@/utils/formatDate";
import CardList from "@/components/salesOutdoor/sales-activity/lead-activity/CardList";

function OverviewButtons() {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const buttons = [
        { title: 'Target', path: '/sales-outdoor/sales-activity/target' },
        { title: 'Leads', path: '/sales-outdoor/sales-activity/leads' },
        { title: 'Lead Activity', path: '/sales-outdoor/sales-activity/lead-activity' },
        { title: 'Log Activity', path: '/sales-outdoor/sales-activity/log-activity' }
    ];

    return (
        <div className="h-56 relative bg-gray-3">
            <div className="h-40 bg-blue-6 rounded-b-4xl flex items-start justify-between px-4 pt-2">
                <div className="w-full flex flex-col text-white px-4">
                    <p className="text-2xl font-semibold tracking-wide">Activities</p>
                    <p className="text-sm">Activities description</p>
                </div>
            </div>

            <div className="w-full h-36 absolute bottom-0 px-4 pb-1">
                <div className="w-full h-full rounded-xl bg-white px-2 pt-2 pb-2 flex flex-col gap-3 shadow">
                    <div className="w-full flex justify-center items-center gap-2 flex-1"> 
                        {buttons.map((button, i) => (
                            <button
                                key={i}
                                onClick={() => window.location.href = button.path}
                                className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold capitalize ${
                                    currentPath === button.path 
                                        ? 'bg-blue-6 text-white'  
                                        : button.title === 'Lead Activity' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-3 text-gray-12/70 hover:bg-blue-100'
                                } transition-colors`}
                            >
                                {button.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const DEFAULT_LIMIT = 10; 

function LeadActivityPageContent() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [statusFilter, setStatusFilter] = useState("");
    const [channelFilter, setChannelFilter] = useState("");
    const [statusList, setStatusList] = useState([]);

    const [pagination, setPagination] = useState({ offset: 0, limit: DEFAULT_LIMIT });
    const [hasMore, setHasMore] = useState(true);

    const containerRef = useRef(null);

    const statusOptions = [
        [
          { value: "", label: "All" },
          {
            value: "answered",
            label: "Answered",
          },
          {
            value: "no response",
            label: "No Response",
          },
        ],
        [
          { value: "", label: "All" },
          {
            value: "sent",
            label: "Sent",
          },
          {
            value: "no response",
            label: "No Response",
          },
        ],
        [
          { value: "", label: "All" },
          {
            value: "scheduled",
            label: "Scheduled",
          },
          {
            value: "rescheduled",
            label: "Re-Scheduled",
          },
          {
            value: "canceled",
            label: "Canceled",
          },
          {
            value: "done",
            label: "Done",
          },
        ],
    ];

    const fetchActivities = useCallback(async (isInitial = false, overrideOffset, overrideLimit) => {
        if (loading || (!isInitial && !hasMore)) return;
        setLoading(true);
        setError(null);

        const actualOffset = overrideOffset ?? pagination.offset;
        const actualLimit  = overrideLimit  ?? pagination.limit;

        try {
            const response = await LeadActivityFetch.get(
                actualOffset,
                actualLimit,
                statusFilter,
                channelFilter
            );

            const resData = getResponseHandler(response, message.error); 

            if (resData && Array.isArray(resData.list)) {
                const newActivities = resData.list;
                setActivities(prev => isInitial ? newActivities : [...prev, ...newActivities]);

                const totalCount = resData.total_items;
                const newOffset = actualOffset + actualLimit;
                setPagination({ offset: newOffset, limit: actualLimit });
                setHasMore(newOffset < totalCount);
            } else {
                setError(resData?.message || 'Failed to load lead activities');
                setHasMore(false);
            }
        } catch (err) {
            setError(err.message || 'Error fetching lead activities');
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [pagination, statusFilter, channelFilter, loading, hasMore]);

    useEffect(() => {
        setPagination({ offset: 0, limit: DEFAULT_LIMIT });
        setActivities([]);
        setHasMore(true);
        fetchActivities(true, 0, DEFAULT_LIMIT);
    }, [statusFilter, channelFilter]);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
                fetchActivities(false);
            }
        };
        const c = containerRef.current;
        if (c) {
            c.addEventListener('scroll', handleScroll);
            return () => c.removeEventListener('scroll', handleScroll);
        }
    }, [fetchActivities, loading]);

    const handleChannelChange = (value) => {
        setChannelFilter(value);
        setStatusFilter(""); 
        if (value && statusOptions[Number(value) - 1]) {
            setStatusList(statusOptions[Number(value) - 1]); 
        } else {
            setStatusList([]); 
        }
    };

    const channelOptions = [
        { value: "", label: "All" },
        { value: "1", label: "Phone" },
        { value: "2", label: "Email" },
        { value: "3", label: "Meetings" },
        { value: "4", label: "Record Visit" },
    ];

    return (
        <Layout>
            <div
                ref={containerRef}
                className='w-full h-full overflow-y-auto overflow-x-hidden relative'
                style={{ scrollbarWidth: 'none' }}
            >
                <FixedHeaderBar bgColor="bg-blue-6" />
                <OverviewButtons />

                <div className="w-full relative">
                    <div className={`w-full pt-4 ${channelFilter ? 'pb-1': 'pb-4'} flex justify-center items-center gap-2 px-4 bg-gray-3`}>
                        <div>Channel Filter</div>
                        <Select
                            className="flex-1"
                            defaultValue=""
                            onChange={handleChannelChange}
                            options={channelOptions}
                            styles={{
                                popup: {
                                    root: {
                                        whiteSpace: "nowrap",
                                    },
                                },
                            }}
                            dropdownAlign={{ points: ["tr", "br"] }}
                        />
                    </div>
                    {channelFilter && 
                        <div className="w-full pb-4 pt-1 flex justify-center items-center gap-2 px-4 bg-gray-3">
                            <div>Status Filter</div>
                            <Select
                                className="flex-1"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e)}
                                options={statusList}
                                styles={{
                                    popup: {
                                        root: {
                                            whiteSpace: "nowrap",
                                        },
                                    },
                                }}
                                dropdownAlign={{ points: ["tr", "br"] }}
                            />
                        </div>
                    }

                    {loading && activities.length === 0 ? (
                        <div className="flex justify-center items-center p-8"><Spin /></div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : activities.length === 0 ? (
                        <Empty className="p-8" description="No Lead Activities found" />
                    ) : (
                        activities.map(activity => (
                            <Link
                                key={activity.id}
                                href={`/sales-outdoor/sales-activity/lead-activity/${activity.id}`}
                                shallow
                                scroll={false}
                            >
                                <CardList
                                    key={activity.id}
                                    data={activity}
                                />
                            </Link>
                        ))
                    )}

                    {loading && activities.length > 0 && (
                        <div className="flex justify-center items-center p-4"><Spin /></div>
                    )}

                    {!hasMore && activities.length > 0 && (
                        <div className="p-4 text-center text-gray-500">No more data to load</div>
                    )}

                    <div className="fixed bottom-[12%] right-1/2 transform translate-x-1/2 max-w-md w-full flex justify-end pr-6 z-50">
                        <Link href="/sales-outdoor/sales-activity/lead-activity/new">
                            <FloatingButton />
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default function LeadActivityPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><Spin size="large" /></div>}>
            <LeadActivityPageContent />
        </Suspense>
    );
}