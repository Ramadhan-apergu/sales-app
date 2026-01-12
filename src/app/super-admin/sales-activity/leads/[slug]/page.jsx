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
  updateResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import ItemFetch from "@/modules/salesApi/item";
import convertToLocalDate from "@/utils/convertToLocalDate";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import dayjs from "dayjs";
import PaymentFetch from "@/modules/salesApi/payment";
import { leadAliases, paymentAliases, targetAliases } from "@/utils/aliases";
import { formatDateTimeToShort, formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import TargetFetch from "@/modules/salesApi/crm/target";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import LeadsFetch from "@/modules/salesApi/crm/leads";

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "leads";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialState = {
    payloadPrimary: {
      addedon: "",
      addr1: "",
      city: "",
      companyname: "",
      createdby: "",
      createddate: "",
      email: "",
      id: "",
      leadid: "",
      name: "",
      owner: "",
      ownername: "",
      phone: "",
      stageid: null,
      state: "",
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

  const { slug } = useParams();

  async function fetchData() {
    setIsLoading(true);
    try {
      const response = await LeadsFetch.getById(slug);
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
        addedon: formatDateTimeToShort(data.addedon),
        addr1: data.addr1,
        city: data.city,
        companyname: data.companyname,
        createdby: data.createdby,
        createddate: formatDateToShort(data.createddate),
        email: data.email,
        id: data.id,
        leadid: data.leadid,
        name: data.name,
        owner: data.owner,
        ownername: data.ownername,
        phone: data.phone,
        stageid: data.stageid,
        state: data.state,
        status: data.status,
      },
    });
  };

  const [modalDelete, setModalDelete] = useState(false);

  const dropdownItems = [
    {
      key: "1",
      label: "Covert",
    },
    {
      key: "2",
      label: "Delete",
      danger: true,
    },
  ];

  function handleDropdown({ key }) {
    switch (key) {
      case "1":
        handleConvert();
        break;

      case "2":
        setModalDelete(true);
        break;

      default:
        break;
    }
  }

  async function handleDelete() {
    setIsLoadingSubmit(true);
    try {
      const response = await LeadsFetch.delete(data.id);

      const resData = deleteResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/sales-activity/${title}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  }

  async function handleConvert() {
    setIsLoadingSubmit(true);
    try {
      const response = await LeadsFetch.convert(data.id);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/sales-activity/${title}/${slug}`);
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
              Lead Detail
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/super-admin/sales-activity/${title}`);
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
                      <p className="w-full lg:text-lg">
                        {data.leadid} /{" "}
                        {data?.iscovert === "1" ? "Convert" : "Not Convert"}
                      </p>
                      <div>
                        <Tag
                          style={{
                            textTransform: "capitalize",
                            fontSize: "16px",
                          }}
                          color={
                            ["qualified"].includes(
                              data?.status?.toLowerCase() || ""
                            )
                              ? "green"
                              : [
                                  "engaged",
                                  "prospecting",
                                  "Negotiating",
                                ].includes(data?.status?.toLowerCase() || "")
                              ? "orange"
                              : ["closed"].includes(
                                  data?.status?.toLowerCase() || ""
                                )
                              ? "red"
                              : "default"
                          }
                        >
                          {data.status || "-"}
                        </Tag>
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                      <Button
                        icon={<EditOutlined />}
                        type={"primary"}
                        onClick={() => {
                          router.push(
                            `/super-admin/sales-activity/${title}/${
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
                        key: "ownername",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "email",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "phone",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "companyname",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "addr1",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "city",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "state",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "addedon",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={leadAliases}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
                    }}
                  />
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
            onClick={() => {
              setModalDelete(false);
              handleDelete();
            }}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this lead?</p>
      </Modal>
    </>
  );
}
