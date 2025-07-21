"use client";

import React, { useState } from "react";
import { Button } from "antd";
import Layout from "@/components/salesIndoor/Layout";
import { CheckOutlined, LeftOutlined } from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import InputForm from "@/components/superAdmin/InputForm";
import { createResponseHandler } from "@/utils/responseHandlers";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import UserManageFetch from "@/modules/salesApi/userManagement";
import { userAliases } from "@/utils/aliases";

export default function UserNew() {
  const { notify, contextHolder } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");

  const [payload, setPayload] = useState({
    name: "",
    email: "",
    address: "",
    username: "",
    password: "",
    roleid: "b412115a-4f15-49af-a4f4-c4c073032c04",
  });

  const roleOptions = [
    { label: "Sales Outdoor", value: "b412115a-4f15-49af-a4f4-c4c073032c04" },
    { label: "Sales Indoor", value: "9df500fd-afa2-4c6e-94ed-eccbf82ef142" },
    { label: "Admin", value: "e6844731-f2fa-4449-9940-99a80a6276af" },
  ];

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {

      const {
        username,
        email,
        name,
        roleid,
        password,
      } = payload;
      if (!username) {
        notify(
          "error",
          "Failed",
          `${userAliases["username"]} is required`
        );
        return;
      }

      if (!name) {
        notify(
          "error",
          "Failed",
          `${userAliases["name"]} is required`
        );
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (email && !emailRegex.test(email)) {
        notify("error", "Failed", `${userAliases["email"]} is required`);
        return;
      }

      if (!roleid) {
        notify("error", "Failed", `${userAliases["roleid"]} is required`);
        return;
      }

      if (!password) {
        notify("error", "Failed", `${userAliases["password"]} is required`);
        return;
      }

      const response = await UserManageFetch.add(payload);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/sales-indoor/access-control/user/${resData}`);
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
              Add New User
            </p>
          </div>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col lg:flex-row justify-between items-start">
              <div className="w-full lg:w-1/2 flex gap-1">
                <Button icon={<LeftOutlined />} onClick={() => router.back()}>
                  {isLargeScreen ? "Back" : ""}
                </Button>
              </div>
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
            <div className="w-full flex flex-col gap-8">
              <InputForm
                type="primary"
                payload={payload}
                data={[
                  {
                    key: "username",
                    input: "input",
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${userAliases["username"]} is required`,
                      },
                    ],
                  },
                  {
                    key: "name",
                    input: "input",
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${userAliases["name"]} is required`,
                      },
                    ],
                  },
                  {
                    key: "email",
                    input: "input",
                    isAlias: true,
                  },
                  {
                    key: "address",
                    input: "text",
                    isAlias: true,
                  },
                  {
                    key: "roleid",
                    input: "select",
                    isAlias: true,
                    options: roleOptions,
                    rules: [
                      {
                        required: true,
                        message: `${userAliases["roleid"]} is required`,
                      },
                    ],
                  },
                  {
                    key: "password",
                    input: "password",
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${userAliases["password"]} is required`,
                      },
                    ],
                  },
                ]}
                onChange={(type, payload) => {
                  setPayload(payload);
                }}
                aliases={userAliases}
              />
            </div>
          </div>
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextHolder}
    </>
  );
}
