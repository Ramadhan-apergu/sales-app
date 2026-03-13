'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/salesOutdoor/Layout";
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import { Spin, Button, message, Tag, Dropdown, Modal, Divider } from 'antd';
import LeadsFetch from "@/modules/salesApi/crm/leads";
import Link from 'next/link';
import { EditOutlined, MoreOutlined } from '@ant-design/icons';
import {
    deleteResponseHandler,
    getResponseHandler,
    updateResponseHandler,
} from "@/utils/responseHandlers";

function LeadDetailPageContent({ params }) {
    const { slug } = use(params);
    const router = useRouter();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalDelete, setModalDelete] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

    useEffect(() => {
        const fetchLead = async () => {
            try {
                setLoading(true);
                const response = await LeadsFetch.getById(slug);
                const resData = getResponseHandler(response, message.error);

                if (resData) {
                    setLead(resData);
                } else {
                    setError(resData?.message || 'Failed to load lead details');
                }
            } catch (err) {
                setError(err.message || 'Error fetching lead details');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchLead();
        }
    }, [slug]);

    const handleDelete = async () => {
        setIsLoadingSubmit(true);
        try {
            const response = await LeadsFetch.delete(lead.id);
            const resData = deleteResponseHandler(response, (msg) => message.error(msg));

            if (resData) {
                message.success('Lead deleted successfully');
                router.push('/sales-outdoor/sales-activity/leads');
            } else {
                message.error('Failed to delete lead');
            }
        } catch (error) {
            message.error(error.message || 'Internal server error');
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const handleConvert = async () => {
        setIsLoadingSubmit(true);
        try {
            const response = await LeadsFetch.convert(lead.id);
            const resData = updateResponseHandler(response, (msg) => message.error(msg));

            if (resData) {
                message.success('Lead converted successfully');
                router.push(`/sales-outdoor/sales-activity/leads/${response.data?.id}`);
            } else {
                message.error('Failed to convert lead');
            }
        } catch (error) {
            message.error(error.message || 'Internal server error');
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const dropdownItems = [
        // {
        //     key: '1',
        //     label: 'Convert',
        // },
        {
            key: '2',
            label: 'Delete',
            danger: true,
        },
    ];

    const handleDropdown = ({ key }) => {
        switch (key) {
            // case '1':
            //     handleConvert();
            //     break;
            case '2':
                setModalDelete(true);
                break;
            default:
                break;
        }
    };

    const handleBack = () => {
        router.push('/sales-outdoor/sales-activity/leads');
    };

    if (!lead && !loading && !error) {
        return (
            <Layout>
                <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
                    <FixedHeaderBar bgColor="bg-blue-6" />
                    <div className="w-full relative p-4">
                        <div className="max-w-3xl mx-auto">
                            <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                            <div className="p-4 bg-red-50 rounded-lg">
                                <div className="text-red-600">Lead Not Found</div>
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
                        {loading && !lead && (
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

                        {lead && (
                            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <Button onClick={handleBack}>← Kembali</Button>
                                    <div className="flex gap-2">
                                        <Link href={`/sales-outdoor/sales-activity/leads/${lead?.id}/edit`}>
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
                                        <h3 className="font-semibold text-gray-700 mb-2 text-center text-2xl">Lead Details</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>{lead.leadid} / {lead.name}</span>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs w-fit ${['open'].includes(lead?.status?.toLowerCase())
                                                ? 'bg-green-100 text-green-800'
                                                : ['pending'].includes(lead?.status?.toLowerCase())
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : ['closed'].includes(lead?.status?.toLowerCase())
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {lead.status}
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs w-fit ${lead.isconvert === 1
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {lead.isconvert === 1 ? "Convert" : "Not Convert"}
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
                                                <span className="text-gray-500">Owner Name:</span>
                                                <span className="text-right">{lead.ownername}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="text-right">{lead.email}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Phone:</span>
                                                <span className="text-right">{lead.phone}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Company:</span>
                                                <span className="text-right">{lead.companyname}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Added On:</span>
                                                <span className="text-right">{lead.addedon}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">Address:</span>
                                                <span className="text-right">{lead.addr1}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">City:</span>
                                                <span className="text-right">{lead.city}</span>
                                            </div>
                                            <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                                                <span className="text-gray-500">State:</span>
                                                <span className="text-right">{lead.state}</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}

                        {!loading && !lead && !error && (
                            <div className="p-4">
                                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                                <div className="text-center text-gray-500">No lead data found</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                title="Delete Lead"
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
                <p>Are you sure you want to delete this lead?</p>
            </Modal>
        </Layout>
    );
}

export default function LeadDetailPage({ params }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><Spin size="large" /></div>}>
            <LeadDetailPageContent params={params} />
        </Suspense>
    );
}