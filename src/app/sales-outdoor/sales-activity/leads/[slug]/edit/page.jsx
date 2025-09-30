'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/salesOutdoor/Layout";
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import { Spin, Button, message, Divider } from 'antd';
import LeadsFetch from "@/modules/salesApi/crm/leads";
import ProfilFetch from "@/modules/salesApi/getProfile";
import { getResponseHandler } from "@/utils/responseHandlers";
import InputForm from "@/components/salesOutdoor/InputForm";
import { leadAliases } from "@/utils/aliases";
import dayjs from "dayjs";
import { CheckOutlined } from "@ant-design/icons";

function EditLeadPageContent({ slug }) {
    const router = useRouter();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState({
        name: "",
        addedon: dayjs(new Date()),
        addr1: "",
        city: "",
        companyname: "",
        email: "",
        phone: "",
        state: "",
        owner: "",
    });

    useEffect(() => {
        const fetchLead = async () => {
            try {
                setLoading(true);
                const response = await LeadsFetch.getById(slug);
                const resData = getResponseHandler(response, message.error);

                if (resData) {
                    setLead(resData);
                    setPayload({
                        ...resData,
                        addedon: resData.addedon ? dayjs(resData.addedon) : dayjs(new Date()),
                    });
                } else {
                    setError(resData?.message || 'Failed to load lead details for editing');
                }
            } catch (err) {
                setError(err.message || 'Error fetching lead details');
            } finally {
                setLoading(false);
            }
        };

        async function fetchProfile() {
            try {
                const profileData = await ProfilFetch.get();
                
                setPayload(prev => ({ 
                    ...prev, 
                    owner: profileData?.data?.id || "" 
                }));
            } catch (e) {
                console.error('Error fetching profile', e);
            }
        }

        if (slug) {
            fetchLead();
            fetchProfile();
        }
    }, [slug]);

    const handleFormChange = (type, values) => {
        setPayload(prev => ({ ...prev, ...values }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const response = await LeadsFetch.update(slug, payload);
            const resData = getResponseHandler(response, message.error);

            if (resData) {
                message.success('Lead updated successfully!');
                router.push(`/sales-outdoor/sales-activity/leads/${slug}`);
            }
        } catch (err) {
            message.error(err.message || 'Error updating lead');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push(`/sales-outdoor/sales-activity/leads/${slug}`);
    };

    if (!lead && !loading && !error) {
        return (
            <Layout>
                <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
                    <FixedHeaderBar bgColor="bg-blue-6" />
                    <div className="w-full relative p-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="p-4 bg-red-50 rounded-lg">
                                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
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
                                </div>
                                
                                <h3 className="font-semibold text-gray-700 mb-3 text-center text-2xl">Edit Lead</h3>
                                
                                <div className="w-full flex flex-col gap-4">
                                    <div className="w-full flex flex-col justify-between items-start">
                                        <div className="w-full flex gap-1"></div>
                                        <div className="w-full flex justify-end items-center gap-2">
                                            <Button type="primary" icon={<CheckOutlined />} onClick={handleSubmit} disabled={submitting}>
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex flex-col gap-8">
                                    <div className="w-full flex flex-col gap-2">
                                        <InputForm
                                            type="Primary"
                                            payload={payload}
                                            data={[
                                                {
                                                    key: "name",
                                                    input: "input",
                                                    isAlias: true,
                                                    rules: [{ required: true, message: `Name is required` }],
                                                },
                                                {
                                                    key: "email",
                                                    input: "input",
                                                    isAlias: true,
                                                    rules: [{ required: true, message: `Email is required` }],
                                                },
                                                {
                                                    key: "phone",
                                                    input: "input",
                                                    isAlias: true,
                                                    rules: [
                                                        { required: true, message: `Phone Number is required` },
                                                    ],
                                                },
                                                {
                                                    key: "companyname",
                                                    input: "input",
                                                    isAlias: true,
                                                    rules: [{ required: true, message: `Company is required` }],
                                                },
                                                {
                                                    key: "addr1",
                                                    input: "text",
                                                    isAlias: true,
                                                },
                                                {
                                                    key: "city",
                                                    input: "input",
                                                    isAlias: true,
                                                },
                                                {
                                                    key: "state",
                                                    input: "input",
                                                    isAlias: true,
                                                },
                                                {
                                                    key: "addedon",
                                                    input: "date",
                                                    isAlias: true,
                                                    rules: [{ required: true, message: `Added on is required` }],
                                                },
                                            ]}
                                            aliases={leadAliases}
                                            onChange={handleFormChange}
                                            isSingleCol={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {!loading && !lead && !error && (
                            <div className="p-4">
                                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                                <div className="text-center text-gray-500">No lead data found for editing</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default function EditLeadPage({ params }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><Spin size="large" /></div>}>
            <EditLeadPageContent slug={params.slug} />
        </Suspense>
    );
}