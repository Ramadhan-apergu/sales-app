'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import Layout from "@/components/salesOutdoor/Layout";
import { Spin, Select, Empty, Button, message } from 'antd';
import FloatingButton from "@/components/salesOutdoor/salesOrder/FloatingButton";
import LogActivityFetch from "@/modules/salesApi/crm/logActivity";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getResponseHandler } from "@/utils/responseHandlers";
import { formatDateTimeToShort } from "@/utils/formatDate";
import CardList from "@/components/salesOutdoor/sales-activity/log-activity/CardList";

function OverviewButtons() {
    const router = useRouter();

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
                    <p className="text-sm">Review system and user activities.</p>
                </div>
            </div>

            <div className="w-full h-36 absolute bottom-0 px-4 pb-1">
                <div className="w-full h-full rounded-xl bg-white px-2 pt-2 pb-2 flex flex-col gap-3 shadow">
                    <div className="w-full flex justify-center items-center gap-2 flex-1"> 
                        {buttons.map((button, i) => (
                            <button
                                key={i}
                                onClick={() => router.push(button.path)}
                                className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold capitalize ${
                                    router.pathname === button.path 
                                        ? 'bg-blue-6 text-white'  
                                        : button.title === 'Log Activity' 
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

function LogActivityPageContent() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logTypeFilter, setLogTypeFilter] = useState('all');

    const [pagination, setPagination] = useState({ offset: 0, limit: DEFAULT_LIMIT });
    const [hasMore, setHasMore] = useState(true);

    const router = useRouter();

    const fetchLogs = async (isInitial = false, overrideOffset, overrideLimit) => {
        if (loading || (!isInitial && !hasMore)) return;
        setLoading(true);
        setError(null);

        const actualOffset = overrideOffset ?? pagination.offset;
        const actualLimit  = overrideLimit  ?? pagination.limit;

        try {
            const response = await LogActivityFetch.get(
                actualOffset,
                actualLimit,
                "", // leadName
                logTypeFilter === 'all' ? '' : logTypeFilter
            );

            const resData = getResponseHandler(response, message.error); 

            if (resData && Array.isArray(resData.list)) {
                const newLogs = resData.list;
                setLogs(prev => isInitial ? newLogs : [...prev, ...newLogs]);

                const totalCount = resData.total_items;
                const newOffset = actualOffset + actualLimit;
                setPagination({ offset: newOffset, limit: actualLimit });
                setHasMore(newOffset < totalCount);
            } else {
                setError(resData?.message || 'Failed to load log activities');
                setHasMore(false);
            }
        } catch (err) {
            setError(err.message || 'Error fetching log activities');
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPagination({ offset: 0, limit: DEFAULT_LIMIT });
        setLogs([]);
        setHasMore(true);
        fetchLogs(true, 0, DEFAULT_LIMIT);
    }, [logTypeFilter]);

    const containerRef = useRef(null);
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
                fetchLogs(false);
            }
        };
        const c = containerRef.current;
        if (c) {
            c.addEventListener('scroll', handleScroll);
            return () => c.removeEventListener('scroll', handleScroll);
        }
    }, [fetchLogs, loading]);

    const logTypeOptions = [
        { value: "all", label: "All" },
        { value: "target", label: "Target" },
        { value: "lead", label: "Lead" },
        { value: "lead activity", label: "Lead Activity" },
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
                    <div className="w-full py-4 flex justify-center items-center gap-2 px-4 bg-gray-3">
                        <Select
                            className="w-full"
                            defaultValue="all"
                            onChange={(e) => setLogTypeFilter(e)}
                            options={logTypeOptions}
                            styles={{
                                popup: {
                                    root: {
                                        minWidth: 150,
                                        whiteSpace: "nowrap",
                                    },
                                },
                            }}
                            dropdownAlign={{ points: ["tr", "br"] }}
                        />
                    </div>

                    {loading && logs.length === 0 ? (
                        <div className="flex justify-center items-center p-8"><Spin /></div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : logs.length === 0 ? (
                        <Empty className="p-8" description="No Log Activities found" />
                    ) : (
                        logs.map(log => (
                            <Link
                                key={log.id}
                                href={`/sales-outdoor/sales-activity/log-activity/${log.id}`}
                                shallow
                                scroll={false}
                            >
                                <CardList
                                    key={log.id}
                                    data={log}
                                />
                            </Link>
                        ))
                    )}

                    {loading && logs.length > 0 && (
                        <div className="flex justify-center items-center p-4"><Spin /></div>
                    )}

                    {!hasMore && logs.length > 0 && (
                        <div className="p-4 text-center text-gray-500">No more data to load</div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default function LogActivityPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><Spin size="large" /></div>}>
            <LogActivityPageContent />
        </Suspense>
    );
}