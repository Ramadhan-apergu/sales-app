'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/salesOutdoor/Layout";
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import { Spin, Button, message } from 'antd';
import LeadsFetch from "@/modules/salesApi/crm/leads";
import ProfilFetch from "@/modules/salesApi/getProfile";
import { getResponseHandler } from "@/utils/responseHandlers";
import InputForm from "@/components/salesOutdoor/InputForm";
import { leadAliases } from "@/utils/aliases";
import dayjs from "dayjs";
import { CheckOutlined } from "@ant-design/icons";

function CreateLeadPageContent() {
    const router = useRouter();
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
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
        
        fetchProfile();
    }, []);

    const handleFormChange = (type, values) => {
        setPayload(prev => ({ ...prev, ...values }));
    };

    const handleSubmit = async () => {
        try {
            setIsLoadingSubmit(true);
            const payloadToInsert = {
                ...payload
            };

            const response = await LeadsFetch.create(payloadToInsert);
            const resData = getResponseHandler(response, message.error);

            if (resData) {
                message.success('Lead created successfully!');
                router.push('/sales-outdoor/sales-activity/leads');
            }
        } catch (err) {
            message.error(err.message || 'Error creating lead');
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const handleBack = () => {
        router.push('/sales-outdoor/sales-activity/leads');
    };

    return (
        <Layout>
            <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
                <FixedHeaderBar bgColor="bg-blue-6" />
                <div className="w-full relative p-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <Button onClick={handleBack}>← Kembali</Button>
                            </div>
                            
                            <h3 className="font-semibold text-gray-700 mb-3 text-center text-2xl">Create Lead</h3>
                            
                            <div className="w-full flex flex-col gap-4">
                                <div className="w-full flex flex-col justify-between items-start">
                                    <div className="w-full flex gap-1"></div>
                                    <div className="w-full flex justify-end items-center gap-2">
                                        <Button type="primary" icon={<CheckOutlined />} onClick={handleSubmit} disabled={isLoadingSubmit}>
                                        Submit
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
                                                key: "address",
                                                input: "text",
                                                isAlias: true,
                                                labeled: "Address"
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
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default function CreateLeadPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><Spin size="large" /></div>}>
            <CreateLeadPageContent />
        </Suspense>
    );
}