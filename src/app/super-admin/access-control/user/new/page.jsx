"use client";

import React, { useEffect, useState } from "react";
import { Button } from "antd";
import Layout from "@/components/superAdmin/Layout";
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
    roleid: "",
  });

  const [roleoptions, setRoleoption] = useState([]);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      const { username, email, name, roleid, password } = payload;
      if (!username) {
        notify("error", "Failed", `${userAliases["username"]} is required`);
        return;
      }

      if (!name) {
        notify("error", "Failed", `${userAliases["name"]} is required`);
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
        router.push(`/super-admin/access-control/user/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  async function getRoles() {
    try {
      const response = await UserManageFetch.getRoles();
      if (response.data && response.data.list) {
        setRoleoption(
          response.data.list.map((role) => ({
            value: role.id,
            label: role.name,
          })) || []
        );

        setPayload((prev) => ({
          ...prev,
          roleid: response.data.list[0].id || "",
        }));
      }
    } catch (error) {
      notify("error", "Error", "Failed fetch roles");
      throw error;
    }
  }

  useEffect(() => {
    getRoles();
  }, []);

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
                    options: roleoptions,
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
