'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/salesOutdoor/Layout";
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import { Spin, Button, message, Divider } from 'antd';
import TargetFetch from "@/modules/salesApi/crm/target";
import { getResponseHandler } from "@/utils/responseHandlers";
import { formatDateToShort } from "@/utils/formatDate";
import Link from 'next/link';

function TargetDetailPageContent({ params }) {
    const { slug } = use(params); 
    const router = useRouter();
    const [target, setTarget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTarget = async () => {
            try {
                setLoading(true);
                const response = await TargetFetch.getById(slug);
                const resData = getResponseHandler(response, message.error);

                if (resData) {
                    setTarget(resData);
                } else {
                    setError(resData?.message || 'Failed to load target details');
                }
            } catch (err) {
                setError(err.message || 'Error fetching target details');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchTarget();
        }
    }, [slug]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'partially paid':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid in full':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatRole = (roleId) => {
        switch (roleId) {
            case 'sales-indoor':
                return 'Sales Indoor';
            case 'sales-outdoor':
                return 'Sales Outdoor';
            default:
                return roleId;
        }
    };

    return (
        <Layout>
            <div className='w-full h-full overflow-y-auto overflow-x-hidden relative'>
                <FixedHeaderBar bgColor="bg-blue-6" />

                <div className="w-full relative p-4">
                    <div className="max-w-3xl mx-auto">
                        {loading && !target && (
                            <div className="flex justify-center items-center p-8">
                                <Spin size="large" />
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 rounded-lg">
                                <Button onClick={() => router.back()} className="mb-4">← Back</Button>
                                <div className="text-red-600">{error}</div>
                            </div>
                        )}

                        {target && (
                            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                                <Button onClick={() => router.back()} className="mb-2">← Back</Button>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="mb-2">
                                        <h3 className="font-semibold text-gray-700 mb-2 text-center text-2xl">Target Details</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>{target.targetid}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(target.status)}`}>
                                                {target.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Divider
                                            style={{
                                                marginBottom: "8px",
                                                textTransform: "capitalize",
                                                borderColor: "#1677ff",
                                            }}
                                            orientation="left"
                                        >
                                            Primary
                                        </Divider>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Start Date:</span>
                                                <span className="text-right">{formatDateToShort(target.startdate)}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">End Date:</span>
                                                <span className="text-right">{formatDateToShort(target.enddate)}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Total Target:</span>
                                                <span className="text-right">{target.totaltarget}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Role:</span>
                                                <span className="text-right">{formatRole(target.roleid)}</span>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Description:</span>
                                                <span className="text-right">{target.description || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Notes:</span>
                                                <span className="text-right">{target.notes || '-'}</span>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!loading && !target && (
                            <div className="p-4">
                                <Button onClick={() => router.back()} className="mb-4">← Back</Button>
                                <div className="text-center text-gray-500">Target data not found</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default function TargetDetailPage({ params }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><Spin size="large" /></div>}>
            <TargetDetailPageContent params={params} />
        </Suspense>
    );
}