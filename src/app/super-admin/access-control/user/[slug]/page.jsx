"use client";

import React, { useEffect, useState } from "react";
import { Button, Dropdown, Tag, Modal } from "antd";
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  EditOutlined,
  LeftOutlined,
  MoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import InputForm from "@/components/superAdmin/InputForm";
import {
  createResponseHandler,
  deleteResponseHandler,
  getByIdResponseHandler,
} from "@/utils/responseHandlers";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import UserManageFetch from "@/modules/salesApi/userManagement";
import { userAliases } from "@/utils/aliases";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";

export default function UserDetails() {
  const { notify, contextHolder } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const { slug } = useParams();
  const [modal, context] = Modal.useModal();
  const title = "user";

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

  async function mappingData(data) {
    const roles = await getRoles();

    setPayload({
      name: data.name,
      email: data.email,
      address: data.address,
      username: data.username,
      password: data.password,
      roleid: roles.find((role) => role.value == data.roleid).label || "",
    });
  }

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
        return (
          response.data.list.map((role) => ({
            value: role.id,
            label: role.name,
          })) || []
        );
      }

      return [];
    } catch (error) {
      notify("error", "Error", "Failed fetch roles");
      throw error;
    }
  }

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

  const deleteModal = () => {
    modal.confirm({
      title: `Delete ${title} "${data.username}"?`,
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: () => {
        handleDelete(data.id);
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await UserManageFetch.delete(id);

      const resData = deleteResponseHandler(response, notify);

      if (resData) {
        window.location.reload();
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    }
  };

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
      {context}
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              User Details
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/super-admin/access-control/${title}`);
              }}
            >
              {isLargeScreen ? "List" : ""}
            </Button>
          </div>
          {data && data.id ? (
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                  <p className="w-full lg:text-lg">
                    {data.username + " / " + data.name}
                  </p>
                  {data && data.status && (
                    <div>
                      <Tag
                        style={{
                          textTransform: "capitalize",
                          fontSize: "16px",
                        }}
                        color={
                          data.status.toLowerCase() == "active"
                            ? "green"
                            : data?.status.toLowerCase() == "inactive"
                            ? "red"
                            : "default"
                        }
                      >
                        {data.status}
                      </Tag>
                    </div>
                  )}
                </div>
                <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                  <Button
                    icon={<EditOutlined />}
                    type={"primary"}
                    onClick={() => {
                      router.push(
                        `/super-admin/access-control/user/${slug}/edit`
                      );
                    }}
                  >
                    {isLargeScreen ? "Edit" : ""}
                  </Button>
                  {contextHolder}
                  <Dropdown
                    menu={{ items, onClick: handleClickAction }}
                    placement="bottomRight"
                  >
                    <Button icon={!isLargeScreen ? <MoreOutlined /> : null}>
                      {isLargeScreen ? "Action" : ""}
                    </Button>
                  </Dropdown>
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
                      isRead: true,
                    },
                    {
                      key: "name",
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
                      key: "address",
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
                  ]}
                  onChange={(type, payload) => {
                    setPayload(payload);
                  }}
                  aliases={userAliases}
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
