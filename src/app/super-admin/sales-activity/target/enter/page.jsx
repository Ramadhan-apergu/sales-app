"use client";

import { useReducer, useState } from "react";
import { Button, Divider } from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CheckOutlined, UnorderedListOutlined } from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { createResponseHandler } from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";

import dayjs from "dayjs";

import TargetFetch from "@/modules/salesApi/crm/target";
import InputUser from "@/components/input/inputUser";
import { targetAliases } from "@/utils/aliases";

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "target";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [userSelected, setUserSelected] = useState({});

  const initialState = {
    payloadPrimary: {
      startdate: dayjs(new Date()),
      enddate: dayjs(new Date()).add(1, "day"),
      totaltarget: 0,
      description: "",
      notes: "",
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

      if (payloadToInsert.enddate <= payloadToInsert.startdate) {
        throw new Error("End date must be later than start date.");
      }

      if (!payloadToInsert.totaltarget || payloadToInsert.totaltarget <= 0) {
        throw new Error("otal target is required and must be greater than 0.");
      }

      const response = await TargetFetch.create(payloadToInsert);

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

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Target Enter
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
                rules: [{ required: true, message: `Start date is required` }],
              },
              {
                key: "enddate",
                input: "date",
                isAlias: true,
                rules: [{ required: true, message: `End date is required` }],
              },
              {
                key: "totaltarget",
                input: "number",
                isAlias: true,
                rules: [
                  { required: true, message: `Total Target is required` },
                ],
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
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
