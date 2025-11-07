"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  MoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CustomerFetch from "@/modules/salesApi/customer";
import {
  createResponseHandler,
  deleteResponseHandler,
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
import { formatDateTimeToShort, formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import TargetFetch from "@/modules/salesApi/crm/target";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import LeadActivityFetch from "@/modules/salesApi/crm/leadActivity";

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "lead-activity";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialState = {
    payloadPrimary: {
      activitydate: "",
      channelname: null,
      channelnamestr: "",
      channelreff: "",
      companyname: "",
      createdby: "",
      createddate: "",
      id: "",
      lead: "",
      lead_name: "",
      summary: "",
      visitdoc: "",
      status: "",
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
  const [channelLabel, setChannelLabel] = useState("phone number");

  const { slug } = useParams();

  async function fetchData() {
    setIsLoading(true);
    try {
      const response = await LeadActivityFetch.getById(slug);
      const resData = getResponseHandler(response);
      setData(resData);
      if (resData) {
        console.log(resData);
        mappingDataPayload(resData);
      }
    } catch (error) {
      console.log(error);
      notify("error", "Error", "Failed get data customer");
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  const mappingDataPayload = (data) => {
    dispatch({
      type: "SET_PRIMARY",
      payload: {
        activitydate: formatDateTimeToShort(data.activitydate) || "",
        channelname: data.channelname,
        channelnamestr: data.channelnamestr,
        channelreff: data.channelreff,
        companyname: data.companyname,
        createdby: data.createdby,
        createddate: formatDateTimeToShort(data.createddate) || "",
        id: data.id,
        lead: data.lead,
        lead_name: data.lead_name,
        summary: data.summary,
        visitdoc: data.visitdoc,
        status: data.status,
      },
    });

    const label = () => {
      switch (data.channelname) {
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
  };

  const [modalDelete, setModalDelete] = useState(false);

  const dropdownItems = [
    {
      key: "1",
      label: "Delete",
      danger: true,
    },
  ];

  function handleDropdown({ key }) {
    switch (key) {
      case "1":
        setModalDelete(true);
        break;

      default:
        break;
    }
  }

  async function handleDelete() {
    setIsLoadingSubmit(true);
    try {
      const response = await LeadActivityFetch.delete(data.id);

      const resData = deleteResponseHandler(response, notify);

      if (resData) {
        router.push(`/sales-indoor/sales-activity/${title}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  }

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Activity Detail
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/sales-indoor/sales-activity/${title}`);
              }}
            >
              {isLargeScreen ? "List" : ""}
            </Button>
          </div>

          {!isLoading ? (
            <>
              {data?.id ? (
                <>
                  <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                    <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                      <p className="w-full lg:text-lg">{data.companyname}</p>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                      <Button
                        icon={<EditOutlined />}
                        type={"primary"}
                        onClick={() => {
                          router.push(
                            `/sales-indoor/sales-activity/${title}/${
                              data?.id || ""
                            }/edit`
                          );
                        }}
                      >
                        {isLargeScreen ? "Edit" : ""}
                      </Button>
                      <Dropdown
                        menu={{ items: dropdownItems, onClick: handleDropdown }}
                        placement="bottomRight"
                      >
                        <Button icon={<MoreOutlined />}></Button>
                      </Dropdown>
                    </div>
                  </div>
                  <InputForm
                    title="primary"
                    type="SET_PRIMARY"
                    payload={state.payloadPrimary}
                    data={[
                      {
                        key: "lead_name",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "activitydate",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "channelnamestr",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "channelreff",
                        input:
                          state.payloadPrimary.channelname == 4
                            ? "text"
                            : "input",

                        labeled: channelLabel,
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "status",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "summary",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "visitdoc",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                        hidden: state.payloadPrimary.channelname != 4
                      },
                    ]}
                    aliases={leadActAliases}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
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
                          Preview
                        </Divider>
                        <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                          <Form layout="vertical">
                            <Form.Item
                              label={
                                <span className="capitalize">Preview</span>
                              }
                              style={{ margin: 0 }}
                              className="w-full"
                              labelCol={{ style: { padding: 0 } }}
                            >
                              <img
                                src={state.payloadPrimary.visitdoc || null}
                                alt="Visit Doc"
                              />
                            </Form.Item>
                          </Form>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-96">
                  <EmptyCustom />
                </div>
              )}
            </>
          ) : (
            <LoadingSpin />
          )}
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
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
            onClick={() => {
              setModalDelete(false);
              handleDelete();
            }}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this activity?</p>
      </Modal>
    </>
  );
}
