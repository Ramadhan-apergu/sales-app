'use client';

import { useState, useEffect, useReducer, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/salesOutdoor/Layout";
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import { Spin, Button, message, Divider, Form, Select, Upload } from 'antd';
import LeadActivityFetch from "@/modules/salesApi/crm/leadActivity";
import { getResponseHandler } from "@/utils/responseHandlers";
import InputForm from "@/components/salesOutdoor/InputForm";
import { leadActAliases } from "@/utils/aliases";
import dayjs from "dayjs";
import { CheckOutlined } from "@ant-design/icons";
import LeadsFetch from "@/modules/salesApi/crm/leads";
import ProfilFetch from "@/modules/salesApi/getProfile";

function CreateLeadActivityPageContent() {
    const router = useRouter();
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [channelLabel, setChannelLabel] = useState("Phone Number");
    const [leadOptions, setLeadOptions] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [profile, setProfile] = useState({});

    const initialState = {
        payloadPrimary: {
            lead: "",
            channelname: 1,
            channelreff: "",
            activitydate: dayjs(new Date()),
            status: "",
            summary: "",
        },
    };

    function reducer(state, action) {
        switch (action.type) {
            case "Primary":
                return {
                    ...state,
                    payloadPrimary: {
                        ...state.payloadPrimary,
                        ...action.payload,
                    },
                };
            case "RESET":
                return initialState;
            default:
                return state;
        }
    }

    const [state, dispatch] = useReducer(reducer, initialState);

    const handleSubmit = async () => {
        setIsLoadingSubmit(true);
        try {
            let payloadToInsert = { ...state.payloadPrimary };

            if (!payloadToInsert.channelname) {
                throw new Error("Channel name is required.");
            }
            if (!payloadToInsert.channelreff) {
                throw new Error(`${channelLabel} is required.`);
            }
            if (!payloadToInsert.activitydate) {
                throw new Error("Activity date is required.");
            }
            if (!payloadToInsert.lead) {
                throw new Error("Lead is required.");
            }

            const formData = new FormData();
            formData.append("lead", payloadToInsert.lead);
            formData.append("channelname", payloadToInsert.channelname);

            // For Meetings (channelname === 3), construct channelreff from profile data
            if (payloadToInsert.channelname === 3 && profile?.data) {
                formData.append("channelreff", `${profile.data.role_name}/${profile.data.id}`);
            } else {
                formData.append("channelreff", payloadToInsert.channelreff);
            }

            formData.append("activitydate", payloadToInsert.activitydate.toISOString());
            formData.append("status", payloadToInsert.status || "");
            formData.append("summary", payloadToInsert.summary || "");

            if (payloadToInsert.channelname === 4) {
                if (!fileList || fileList.length === 0) {
                    throw new Error("A file is required.");
                }

                const file = fileList[0]?.originFileObj;
                if (!file) {
                    throw new Error("File upload failed. Please try again.");
                }

                formData.append("files", file);
            }

            const response = await LeadActivityFetch.create(formData);
            const resData = getResponseHandler(response, message.error);

            if (resData) {
                message.success('Lead activity created successfully!');
                router.push(`/sales-outdoor/sales-activity/lead-activity/${resData.data?.id || resData.id}`);
            } else {
                message.error(resData?.message || 'Failed to create lead activity');
            }
        } catch (error) {
            message.error(error.message || 'Internal server error');
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const channelOptions = [
        { value: 1, label: "Phone" },
        { value: 2, label: "Email" },
        { value: 3, label: "Meetings" },
        { value: 4, label: "Record Visit" },
    ];

    const statusOptions = [
        [
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

    const fetchDataLead = async () => {
        try {
            const response = await LeadsFetch.get(0, 10000, "");

            const resData = getResponseHandler(response, message.error);

            if (resData) {
                setLeadOptions(
                    resData.list.map((lead) => ({
                        ...lead,
                        value: lead.id,
                        label: lead.companyname,
                    }))
                );
            }
        } catch (error) {
            message.error(error?.message || 'Internal Server error');
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await ProfilFetch.get();
                setProfile(profileData);
            } catch (e) {
                console.error('Error fetching profile', e);
            }
        };

        fetchDataLead();
        fetchProfile();
    }, []);

    const handleChangeFile = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleBack = () => {
        router.push('/sales-outdoor/sales-activity/lead-activity');
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

                            <h3 className="font-semibold text-gray-700 mb-3 text-center text-2xl">Create Lead Activity</h3>

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
                                        payload={state.payloadPrimary}
                                        data={[
                                            {
                                                key: "lead",
                                                input: "select",
                                                isAlias: true,
                                                options: leadOptions || [],
                                                rules: [{ required: true, message: `Lead is required` }],
                                            },
                                            {
                                                key: "activitydate",
                                                input: "datetime",
                                                isAlias: true,
                                                rules: [
                                                    { required: true, message: `Activity Date is required` },
                                                ],
                                            },
                                            {
                                                key: "channelname",
                                                input: "select",
                                                isAlias: true,
                                                options: channelOptions,
                                                rules: [
                                                    { required: true, message: `Channel Name is required` },
                                                ],
                                            },
                                            {
                                                key: "channelreff",
                                                input: state.payloadPrimary.channelname == 4 ? "text" : "input",
                                                labeled: channelLabel,
                                                disabled: state.payloadPrimary.channelname == 3,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: `Channel Reff is required`,
                                                    },
                                                    state.payloadPrimary.channelname === 1 ? {
                                                        pattern: /^[0-9]+$/,
                                                        message: "Please enter a valid phone number",
                                                    } : {},
                                                    state.payloadPrimary.channelname === 2 ? {
                                                        type: "email",
                                                        message: "Please enter a valid email",
                                                    } : {},
                                                ],
                                            },
                                            {
                                                key: "status",
                                                input: "select",
                                                isAlias: true,
                                                options: statusOptions[state.payloadPrimary.channelname - 1],
                                                hidden: state.payloadPrimary.channelname == 4,
                                            },
                                            {
                                                key: "summary",
                                                input: "text",
                                                isAlias: true,
                                            },
                                        ]}
                                        aliases={leadActAliases}
                                        onChange={(type, payload) => {
                                            let updatedPayload = { ...payload };

                                            // Check if channelname has changed
                                            if (payload.channelname && payload.channelname !== state.payloadPrimary.channelname) {
                                                if (payload.channelname === 3) {
                                                    // Auto-fill channelreff with profile name for Meetings
                                                    if (profile?.data?.name) {
                                                        updatedPayload.channelreff = profile.data.name;
                                                    }
                                                } else {
                                                    // Clear channelreff for other channels
                                                    updatedPayload.channelreff = "";
                                                }
                                            }

                                            dispatch({ type, payload: updatedPayload });

                                            const label = () => {
                                                switch (updatedPayload.channelname || state.payloadPrimary.channelname) {
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
                                        }}
                                        isSingleCol={true}
                                    />
                                </div>
                            </div>

                            {state.payloadPrimary.channelname == 4 && (
                                <div className="w-full flex flex-col gap-8">
                                    <div className="w-full flex flex-col gap-2">
                                        <Divider
                                            style={{ margin: "0", textTransform: "capitalize", borderColor: "#1677ff" }}
                                            orientation="left"
                                        >
                                            Files
                                        </Divider>
                                        <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                                            <Form layout="vertical">
                                                <Form.Item
                                                    label={<span className="capitalize">Files</span>}
                                                    style={{ margin: 0 }}
                                                    className="w-full"
                                                    labelCol={{ style: { padding: 0 } }}
                                                    required
                                                >
                                                    <Upload
                                                        style={{ width: "100%" }}
                                                        name="file"
                                                        accept="image/*"
                                                        maxCount={1}
                                                        beforeUpload={(file) => {
                                                            const isImage = file.type.startsWith("image/");
                                                            if (!isImage) {
                                                                message.error("You can only upload image files!");
                                                                return Upload.LIST_IGNORE;
                                                            }
                                                            return false;
                                                        }}
                                                        onChange={handleChangeFile}
                                                    >
                                                        <Button style={{ width: "100%" }} block>
                                                            Select Image
                                                        </Button>
                                                    </Upload>
                                                </Form.Item>
                                            </Form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default function CreateLeadActivityPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><Spin size="large" /></div>}>
            <CreateLeadActivityPageContent />
        </Suspense>
    );
}