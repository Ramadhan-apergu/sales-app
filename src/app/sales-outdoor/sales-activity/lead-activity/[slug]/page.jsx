'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/salesOutdoor/Layout";
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import { Spin, Button, message, Dropdown, Modal, Divider } from 'antd';
import LeadActivityFetch from "@/modules/salesApi/crm/leadActivity";
import Link from 'next/link';
import { EditOutlined, MoreOutlined } from '@ant-design/icons';
import { getResponseHandler, deleteResponseHandler } from "@/utils/responseHandlers";

function LeadActivityDetailPageContent({ slug }) {
    const router = useRouter();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalDelete, setModalDelete] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [channelLabel, setChannelLabel] = useState("Phone Number");

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setLoading(true);
                const response = await LeadActivityFetch.getById(slug);
                const resData = getResponseHandler(response, message.error);

                if (resData) {
                    setActivity(resData);
                    
                    // Set channel label based on channel name
                    const label = () => {
                        switch (resData.channelname) {
                            case 1:
                                return "Phone Number";
                            case 2:
                                return "Email";
                            case 3:
                                return "PIC";
                            case 4:
                                return "Lead Address";
                            default:
                                return "Channel Reference";
                        }
                    };
                    setChannelLabel(label());
                } else {
                    setError(resData?.message || 'Failed to load activity details');
                }
            } catch (err) {
                setError(err.message || 'Error fetching activity details');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchActivity();
        }
    }, [slug]);

    const handleDelete = async () => {
        setIsLoadingSubmit(true);
        try {
            const response = await LeadActivityFetch.delete(activity.id);
            const resData = deleteResponseHandler(response, (msg) => message.error(msg));

            if (resData) {
                message.success('Activity deleted successfully');
                router.push('/sales-outdoor/sales-activity/lead-activity');
            } else {
                message.error(resData?.message || 'Failed to delete activity');
            }
        } catch (error) {
            message.error(error.message || 'Internal server error');
        } finally {
            setIsLoadingSubmit(false);
            setModalDelete(false);
        }
    };

    const dropdownItems = [
        {
            key: '1',
            label: 'Delete',
            danger: true,
        },
    ];

    const handleDropdown = ({ key }) => {
        switch (key) {
            case '1':
                setModalDelete(true);
                break;
            default:
                break;
        }
    };

    const handleBack = () => {
        router.push('/sales-outdoor/sales-activity/lead-activity');
    };

    if (!activity && !loading && !error) {
        return (
            <Layout>
                <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
                    <FixedHeaderBar bgColor="bg-blue-6" />
                    <div className="w-full relative p-4">
                        <div className="max-w-3xl mx-auto">
                            <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                            <div className="p-4 bg-red-50 rounded-lg">
                                <div className="text-red-600">Activity Not Found</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
                <FixedHeaderBar bgColor="bg-blue-6" />

                <div className="w-full relative p-4">
                    <div className="max-w-3xl mx-auto">
                        {loading && !activity && (
                            <div className="flex justify-center items-center p-8">
                                <Spin size="large" />
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 rounded-lg">
                                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                                <div className="text-red-600">{error}</div>
                            </div>
                        )}

                        {activity && (
                            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <Button onClick={handleBack}>← Kembali</Button>
                                    <div className="flex gap-2">
                                        <Link href={`/sales-outdoor/sales-activity/lead-activity/${activity?.id}/edit`}>
                                            <Button
                                                icon={<EditOutlined />}
                                                type="primary"
                                            >
                                                Edit
                                            </Button>
                                        </Link>
                                        <Dropdown
                                            menu={{ items: dropdownItems, onClick: handleDropdown }}
                                            placement="bottomRight"
                                        >
                                            <Button icon={<MoreOutlined />}></Button>
                                        </Dropdown>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="mb-2">
                                        <h3 className="font-semibold text-gray-700 mb-2 text-center text-2xl">Activity Details</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className='text-lg'>{activity.companyname}</span>
                                            </div>
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
                                                <span className="text-gray-500">Lead Name:</span>
                                                <span className="text-right">{activity.lead_name}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Activity Date:</span>
                                                <span className="text-right">{activity.activitydate}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Channel:</span>
                                                <span className="text-right">{activity.channelnamestr}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">{channelLabel}:</span>
                                                <span className="text-right">
                                                    {activity.channelname === 4 ? (
                                                        <div className="text-right">
                                                            <p className="truncate max-w-xs">{activity.channelreff}</p>
                                                        </div>
                                                    ) : (
                                                        activity.channelreff
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Summary:</span>
                                                <span className="text-right">{activity.summary}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Visit Document:</span>
                                                <span className="text-right">
                                                    {activity.visitdoc ? (
                                                        <a 
                                                            href={activity.visitdoc} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            Open Document
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!loading && !activity && !error && (
                            <div className="p-4">
                                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                                <div className="text-center text-gray-500">No activity data found</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                title="Delete Activity"
                open={modalDelete}
                onCancel={() => setModalDelete(false)}
                footer={[
                    <Button key="cancel" onClick={() => setModalDelete(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        onClick={handleDelete}
                        loading={isLoadingSubmit}
                    >
                        Delete
                    </Button>,
                ]}
            >
                <p>Are you sure you want to delete this activity?</p>
            </Modal>
        </Layout>
    );
}

export default function LeadActivityDetailPage({ params }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><Spin size="large" /></div>}>
            <LeadActivityDetailPageContent slug={params.slug} />
        </Suspense>
    );
}