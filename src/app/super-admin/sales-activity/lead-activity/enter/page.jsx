"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Table,
  Tooltip,
  Upload,
} from "antd";
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CustomerFetch from "@/modules/salesApi/customer";
import {
  createResponseHandler,
  getResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import ItemFetch from "@/modules/salesApi/item";
import convertToLocalDate from "@/utils/convertToLocalDate";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import dayjs from "dayjs";
import PaymentFetch from "@/modules/salesApi/payment";
import { leadActAliases, paymentAliases, targetAliases } from "@/utils/aliases";
import { formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import TargetFetch from "@/modules/salesApi/crm/target";
import LeadsFetch from "@/modules/salesApi/crm/leads";
import LeadActivityFetch from "@/modules/salesApi/crm/leadActivity";

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "lead-activity";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [channelLabel, setChannelLabel] = useState("phone number");
  const [leadOptions, setLeadOptions] = useState([]);

  const initialState = {
    payloadPrimary: {
      lead: "",
      channelname: 1,
      channelreff: "",
      activitydate: dayjs(new Date()),
      status: "",
      summary: "",
    },
    payloadFile: {
      files: "",
    },
  };

  const roleOptions = [
    { label: "Sales Indoor", value: "sales-indoor" },
    { label: "Sales Outdoor", value: "sales-outdoor" },
  ];

  function reducer(state, action) {
    switch (action.type) {
      case "SET_PRIMARY":
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
      formData.append("channelreff", payloadToInsert.channelreff);
      formData.append("activitydate", payloadToInsert.activitydate);
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

        const maxSize = 2 * 1024 * 1024; // 2MB dalam bytes
        if (file.size > maxSize) {
          throw new Error("File size must be less than 2MB.");
        }

        formData.append("files", file);
      }

      const response = await LeadActivityFetch.create(formData);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/sales-activity/${title}/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
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

      const resData = getResponseHandler(response, notify);

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
      notify("error", "Error", error?.message || "Internal Server error");
    }
  };

  useEffect(() => {
    fetchDataLead();
  }, []);

  const [fileList, setFileList] = useState([]);

  const handleChangeFile = ({ fileList: newFileList }) => {
    setFileList(newFileList); // update state setiap kali ada perubahan
  };

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Activity Enter
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/super-admin/transaction/${title}`);
              }}
            >
              {isLargeScreen ? "List" : ""}
            </Button>
          </div>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col lg:flex-row justify-between items-start">
              <div className="w-full lg:w-1/2 flex gap-1"></div>
              <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                <Button
                  type={"primary"}
                  icon={<CheckOutlined />}
                  onClick={handleSubmit}
                >
                  {isLargeScreen ? "Submit" : ""}
                </Button>
              </div>
            </div>
          </div>

          <InputForm
            title="primary"
            type="SET_PRIMARY"
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
                rules: [
                  {
                    required: true,
                    message: `Channel Reff is required`,
                  },
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
              let updatePayload = payload;
              if (
                updatePayload.channelname != state.payloadPrimary.channelname
              ) {
                updatePayload = {
                  ...updatePayload,
                  status: "",
                  channelreff: "",
                };
              }
              dispatch({ type, payload: updatePayload });

              const label = () => {
                switch (payload.channelname) {
                  case 1:
                    return "Phone Number";
                  case 2:
                    return "Email";
                  case 3:
                    return "PIC";
                  case 4:
                    return "Lead Address";
                }
              };
              setChannelLabel(label);
            }}
          />

          {state.payloadPrimary.channelname == 4 && (
            <div className="w-full flex flex-col gap-8">
              <div className="w-full flex flex-col gap-2">
                <Divider
                  style={{
                    margin: "0",
                    textTransform: "capitalize",
                    borderColor: "#1677ff",
                  }}
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
                        maxCount={1} // hanya 1 file
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/");
                          if (!isImage) {
                            notify(
                              "error",
                              "Failed",
                              "You can only upload image files!"
                            );
                            return Upload.LIST_IGNORE;
                          }
                          return false; // cegah auto-upload
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
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
