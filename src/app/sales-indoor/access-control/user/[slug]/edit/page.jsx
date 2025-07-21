"use client";

import React, { useEffect, useState } from "react";
import { Button, Dropdown, Tag } from "antd";
import Layout from "@/components/salesIndoor/Layout";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LeftOutlined,
  MoreOutlined,
  SaveOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import InputForm from "@/components/superAdmin/InputForm";
import {
  createResponseHandler,
  getByIdResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import UserManageFetch from "@/modules/salesApi/userManagement";
import { userAliasesEdit } from "@/utils/aliases";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";

export default function UserDetails() {
  const { notify, contextHolder } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const { slug } = useParams();

  const [payload, setPayload] = useState({
    name: "",
    email: "",
    address: "",
    username: "",
    password: "",
    roleid: "b412115a-4f15-49af-a4f4-c4c073032c04",
  });

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await UserManageFetch.getById(slug);

        const resData = getByIdResponseHandler(response, notify);

        if (resData) {
          setData(resData);
          mappingData(resData);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  function mappingData(data) {
    setPayload({
      name: data.name,
      email: data.email,
      address: data.address,
      username: data.username,
      password: data.password,
      roleid: data.roleid,
    });
  }

  const roleOptions = [
    { label: "Sales Outdoor", value: "b412115a-4f15-49af-a4f4-c4c073032c04" },
    { label: "Sales Indoor", value: "9df500fd-afa2-4c6e-94ed-eccbf82ef142" },
    { label: "Admin", value: "e6844731-f2fa-4449-9940-99a80a6276af" },
  ];

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      const { username, email, name, roleid, password } = payload;
      if (!username) {
        notify("error", "Failed", `${userAliasesEdit["username"]} is required`);
        return;
      }

      if (!name) {
        notify("error", "Failed", `${userAliasesEdit["name"]} is required`);
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (email && !emailRegex.test(email)) {
        notify("error", "Failed", `${userAliasesEdit["email"]} is required`);
        return;
      }

      if (!roleid) {
        notify("error", "Failed", `${userAliasesEdit["roleid"]} is required`);
        return;
      }

      if (!password) {
        notify("error", "Failed", `${userAliasesEdit["password"]} is required`);
        return;
      }

      const response = await UserManageFetch.update(slug, payload);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/sales-indoor/access-control/user/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const items = [
    // {
    //   key: "1",
    //   label: "Approve",
    //   disabled: data?.status.toLowerCase() == "active",
    // },
    {
      key: "2",
      label: "Delete",
      danger: true,
    },
  ];

  const handleClickAction = ({ key }) => {
    switch (key) {
      case "1":
        handleApproval();
        break;
      case "2":
        deleteModal();
        break;
      default:
        console.warn("Unhandled action:", key);
    }
  };

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit User
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/sales-indoor/access-control/${title}`);
              }}
            >
              {isLargeScreen ? "List" : ""}
            </Button>
          </div>
          {data && data.id ? (
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                  <div className="w-full lg:w-1/2 flex gap-1">
                    <Button
                      icon={<CloseOutlined />}
                      variant={"outlined"}
                      onClick={() => {
                        router.back();
                      }}
                    >
                      {isLargeScreen ? "Cancel" : ""}
                    </Button>
                    {contextHolder}
                  </div>
                  <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                    <Button
                      icon={<SaveOutlined />}
                      type={"primary"}
                      onClick={handleSubmit}
                    >
                      {isLargeScreen ? "Save" : ""}
                    </Button>
                  </div>
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
                          message: `${userAliasesEdit["username"]} is required`,
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
                          message: `${userAliasesEdit["name"]} is required`,
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
                          message: `${userAliasesEdit["roleid"]} is required`,
                        },
                      ],
                    },
                    {
                      key: "password",
                      input: "password",
                      isAlias: true,
                    },
                  ]}
                  onChange={(type, payload) => {
                    setPayload(payload);
                  }}
                  aliases={userAliasesEdit}
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-96">
              <EmptyCustom />
            </div>
          )}
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextHolder}
    </>
  );
}
