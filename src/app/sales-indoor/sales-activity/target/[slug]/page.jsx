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
import { paymentAliases, targetAliases } from "@/utils/aliases";
import { formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import TargetFetch from "@/modules/salesApi/crm/target";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import LayoutSalesIndoor from "@/components/salesIndoor/Layout";

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "target";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialState = {
    payloadPrimary: {
      createdby: "",
      createddate: "",
      description: "",
      enddate: "",
      id: "",
      notes: "",
      roleid: "",
      startdate: "",
      status: "",
      targetid: "",
      totaltarget: "",
    },
  };

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
      const response = await TargetFetch.getById(slug);
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
        createdby: data.createdby,
        createddate: data.createddate,
        description: data.description,
        enddate: formatDateToShort(data.enddate),
        id: data.id,
        notes: data.notes,
        roleid:
          data.roleid == "sales-indoor" ? "Sales Indoor" : "Sales Outdoor",
        startdate: formatDateToShort(data.startdate),
        status: data.status,
        targetid: data.targetid,
        totaltarget: data.totaltarget,
      },
    });
  };

  return (
    <>
      <LayoutSalesIndoor pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Target Detail
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
                      <p className="w-full lg:text-lg">{data.targetid}</p>
                      <div>
                        <Tag
                          style={{
                            textTransform: "capitalize",
                            fontSize: "16px",
                          }}
                          color={
                            ["open"].includes(data?.status.toLowerCase())
                              ? "green"
                              : ["pending"].includes(data?.status.toLowerCase())
                              ? "orange"
                              : ["closed"].includes(data?.status.toLowerCase())
                              ? "red"
                              : "default"
                          }
                        >
                          {data.status || "-"}
                        </Tag>
                      </div>
                    </div>
                  </div>
                  <InputForm
                    title="primary"
                    type="SET_PRIMARY"
                    payload={state.payloadPrimary}
                    data={[
                      {
                        key: "startdate",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "enddate",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "totaltarget",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "description",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "roleid",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "notes",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={targetAliases}
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
      </LayoutSalesIndoor>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
