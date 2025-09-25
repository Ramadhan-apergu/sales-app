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
import Layout from "@/components/superAdmin/Layout";
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
import { leadAliases, paymentAliases, targetAliases } from "@/utils/aliases";
import { formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import TargetFetch from "@/modules/salesApi/crm/target";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import LeadsFetch from "@/modules/salesApi/crm/leads";
import UserManageFetch from "@/modules/salesApi/userManagement";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "leads";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataUser, setDataUser] = useState([]);
  const [dataUserSelected, setDataUserSelected] = useState({});
  const [roleSelected, setRoleSelected] = useState("sales_indoor");
  const [stageOptions, setStageOptions] = useState([]);

  const initialState = {
    payloadPrimary: {
      addedon: "",
      addr1: "",
      city: "",
      companyname: "",
      email: "",
      name: "",
      owner: "",
      phone: "",
      state: "",
      name: "",
    },
    payloadUser: {
      owner: "",
      ownername: "",
      ownerrole: "",
    },
  };

  const roleOptions = [
    { label: "Sales Indoor", value: "sales_indoor" },
    { label: "Sales Outdoor", value: "sales_outdoor" },
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
      case "SET_USER":
        return {
          ...state,
          payloadUser: {
            ...state.payloadUser,
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
    fetchStage();
  }, []);

  const mappingDataPayload = (data) => {
    dispatch({
      type: "SET_PRIMARY",
      payload: {
        addedon: dayjs.utc(data.addedon),
        addr1: data.addr1,
        city: data.city,
        companyname: data.companyname,
        createdby: data.createdby,
        createddate: dayjs(data.createddate),
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
        name: data.name,
      },
    });
    dispatch({
      type: "SET_USER",
      payload: {
        owner: data.owner,
        ownername: data.ownername,
        ownerrole: data.ownerrole?.replaceAll("-", "_"),
      },
    });

    setDataUserSelected({
      label: data.ownername,
      value: data.owner,
      id: data.owner,
    });

    fetchDataUser(data.ownerrole?.replaceAll("-", "_"));
    setRoleSelected(data.ownerrole?.replaceAll("-", "_"));
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      console.log(dataUserSelected);
      if (!dataUserSelected?.id) {
        throw new Error("Owner is required.");
      }

      let payloadToInsert = {
        ...state.payloadPrimary,
        owner: dataUserSelected.id,
      };

      if (!payloadToInsert.email) {
        throw new Error("Email date is required.");
      }

      if (!payloadToInsert.phone) {
        throw new Error("Phone Number is required.");
      }

      if (!payloadToInsert.companyname) {
        throw new Error("Company is required.");
      }

      const response = await LeadsFetch.update(data.id, payloadToInsert);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/sales-activity/${title}/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  async function fetchDataUser(roleSelected, isInit) {
    try {
      const response = await UserManageFetch.get(
        0,
        10000,
        "active",
        roleSelected
      );
      const resData = getResponseHandler(response);
      if (resData) {
        const dataUserMap =
          resData?.list.map((user) => {
            return { ...user, label: user.name, value: user.id };
          }) || [];
        setDataUser(dataUserMap);
      }
    } catch (error) {
      console.log(error);
      notify("error", "Error", "Failed get data customer");
    }
  }

  async function fetchStage() {
    try {
      const response = await LeadsFetch.getStages();
      const resData = getResponseHandler(response);
      if (resData) {
        const dataMap = resData.map((stage) => ({
          ...stage,
          value: stage.id,
          label: stage.name,
        }));

        setStageOptions(dataMap);
      }
    } catch (error) {
      console.log(error);
      notify("error", "Error", "Failed get data customer");
    }
  }

  function handleUserChange(user) {
    setDataUserSelected(user);
  }

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit Lead
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
                        Owner
                      </Divider>
                      <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                        <Form layout="vertical">
                          <Form.Item
                            label={<span className="capitalize">Owner</span>}
                            style={{ margin: 0 }}
                            className="w-full"
                            labelCol={{ style: { padding: 0 } }}
                            required
                          >
                            <Select
                              showSearch
                              placeholder="Select an owner"
                              optionFilterProp="label"
                              value={dataUserSelected?.value || undefined}
                              onChange={(_, user) => {
                                handleUserChange(user);
                              }}
                              options={dataUser}
                              style={{ width: "75%", paddingRight: 4 }}
                            />

                            <Select
                              showSearch
                              placeholder="Select an owner"
                              optionFilterProp="label"
                              value={roleSelected || undefined}
                              onChange={(_, option) => {
                                setRoleSelected(option.value);
                                setDataUserSelected({});
                                fetchDataUser(option.value);
                              }}
                              options={roleOptions}
                              style={{ width: "25%", paddingLeft: 4 }}
                            />
                          </Form.Item>
                        </Form>
                      </div>
                    </div>
                  </div>

                  <InputForm
                    title="primary"
                    type="SET_PRIMARY"
                    payload={state.payloadPrimary}
                    data={[
                      {
                        key: "name",
                        input: "input",
                        isAlias: true,
                        rules: [
                          { required: true, message: `Name is required` },
                        ],
                      },
                      {
                        key: "email",
                        input: "input",
                        isAlias: true,
                        rules: [
                          { required: true, message: `Email is required` },
                        ],
                      },
                      {
                        key: "phone",
                        input: "input",
                        isAlias: true,
                        rules: [
                          {
                            required: true,
                            message: `Phone Number is required`,
                          },
                        ],
                      },
                      {
                        key: "companyname",
                        input: "input",
                        isAlias: true,
                        rules: [
                          { required: true, message: `Company is required` },
                        ],
                      },
                      {
                        key: "stageid",
                        input: "select",
                        options: stageOptions,
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
                        input: "datetime",
                        isAlias: true,
                        rules: [
                          { required: true, message: `Added on is required` },
                        ],
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
    </>
  );
}
