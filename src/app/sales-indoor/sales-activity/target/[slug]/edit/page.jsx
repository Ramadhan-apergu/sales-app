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
  Tag,
  Tooltip,
} from "antd";
import Layout from "@/components/salesIndoor/Layout";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  SaveOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CustomerFetch from "@/modules/salesApi/customer";
import {
  createResponseHandler,
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
import { paymentAliases, targetAliases } from "@/utils/aliases";
import { formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import TargetFetch from "@/modules/salesApi/crm/target";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import InputUser from "@/components/input/inputUser";

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "target";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSelected, setUserSelected] = useState({});

  const initialState = {
    payloadPrimary: {
      startdate: "",
      enddate: "",
      totaltarget: "",
      description: "",
      notes: "",
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
      const response = await TargetFetch.getById(slug);
      const resData = getResponseHandler(response);
      setData(resData);
      if (resData) {
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
        description: data.description,
        enddate: dayjs(data.enddate),
        notes: data.notes,
        startdate: dayjs(data.startdate),
        totaltarget: data.totaltarget,
      },
    });

    setUserSelected({
      value: data.salesid,
      role: data?.role ? data.role.replaceAll(" ", "-") : "",
      label: data.sales,
    });

    console.log({
      value: data.salesid,
      role: data?.role ? data.role.replaceAll(" ", "-") : "",
      label: data.sales,
    });
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
      };

      if (!userSelected.value) {
        throw new Error("User is required.");
      }

      payloadToInsert = { ...payloadToInsert, salesid: userSelected.value };

      if (!payloadToInsert.startdate) {
        throw new Error("Start date is required.");
      }

      if (!payloadToInsert.enddate) {
        throw new Error("End date is required.");
      }

      if (!payloadToInsert.totaltarget || payloadToInsert.totaltarget <= 0) {
        throw new Error("Total target is required and must be greater than 0.");
      }

      const response = await TargetFetch.update(data.id, payloadToInsert);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/sales-indoor/sales-activity/${title}/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit Target
            </p>
          </div>

          {!isLoading ? (
            <>
              {data?.id ? (
                <>
                  <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                    <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                      <div className="w-full lg:w-1/2 flex gap-1">
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => router.back()}
                        >
                          {isLargeScreen ? "Cancel" : ""}
                        </Button>
                      </div>
                      <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                        <Button
                          type={"primary"}
                          icon={<SaveOutlined />}
                          onClick={handleSubmit}
                        >
                          {isLargeScreen ? "Save" : ""}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Divider
                    style={{
                      margin: "0",
                      textTransform: "capitalize",
                      borderColor: "#1677ff",
                    }}
                    orientation="left"
                  >
                    User
                  </Divider>

                  <div className="w-full flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/2">
                      <InputUser
                        isRequired={true}
                        value={userSelected.value || undefined}
                        roleValue={userSelected.role || undefined}
                        onChange={(val, opt) => {
                          console.log(opt);
                          setUserSelected(opt);
                        }}
                      />
                    </div>
                    <span className="hidden lg:static"> </span>
                  </div>

                  <InputForm
                    title="primary"
                    type="SET_PRIMARY"
                    payload={state.payloadPrimary}
                    data={[
                      {
                        key: "startdate",
                        input: "date",
                        isAlias: true,
                      },
                      {
                        key: "enddate",
                        input: "date",
                        isAlias: true,
                      },
                      {
                        key: "totaltarget",
                        input: "number",
                        isAlias: true,
                      },
                      {
                        key: "description",
                        input: "text",
                        isAlias: true,
                      },
                      {
                        key: "notes",
                        input: "text",
                        isAlias: true,
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
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
