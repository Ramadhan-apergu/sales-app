"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal, Tag } from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import CustomerFetch from "@/modules/salesApi/customer";
import { customerAliases } from "@/utils/aliases";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import InputForm from "@/components/superAdmin/InputForm";
import {
  getByIdResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatDateToShort } from "@/utils/formatDate";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";

export default function Detail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint("lg");
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await CustomerFetch.getById(slug);
        const resData = getByIdResponseHandler(response, notify);
        setData(resData);

        if (resData) {
          mapingGroup(resData);
        }
      } catch (error) {
        const message =
          error?.message ||
          "Login failed! Server error, please try again later.";
        notify("error", "Error", message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const title = "customer";

  const fieldGroups = {
    general: ["companyname", "category", "customerid", "salesrep"],
    contact: ["phone", "altphone", "email"],
    address: ["addr1", "city", "state", "zip"],
    financial: ["creditlimit", "resalenumber", "terms"],
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      const payloadToInsert = {
        ...general,
        ...contact,
        ...address,
        ...financial,
      };

      const {
        companyname,
        email,
        phone,
        terms,
        creditlimit,
        state,
        city,
        resalenumber,
        addr1,
      } = payloadToInsert;
      if (!companyname) {
        notify(
          "error",
          "Failed",
          `${customerAliases["companyname"]} is required`
        );
        return;
      }

      if (!customerid) {
        notify(
          "error",
          "Failed",
          `${customerAliases["customerid"]} is required`
        );
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (email && !emailRegex.test(email)) {
        notify("error", "Failed", "Email format is invalid");
        return;
      }

      if (!phone) {
        notify("error", "Failed", `Phone is required`);
        return;
      }

      if (!state) {
        notify("error", "Failed", `State is required`);
        return;
      }

      if (!city) {
        notify("error", "Failed", `City is required`);
        return;
      }

      if (!addr1) {
        notify("error", "Failed", `Address is required`);
        return;
      }

      if (!terms) {
        notify("error", "Failed", `${customerAliases["terms"]} is required`);
        return;
      }

      if (!resalenumber) {
        notify(
          "error",
          "Failed",
          `${customerAliases["resalenumber"]} cannot be empty`
        );
        return;
      }

      if (resalenumber.length != 16) {
        notify(
          "error",
          "Failed",
          `${customerAliases["resalenumber"]} must be exactly 16 characters long`
        );
        return;
      }

      if (creditlimit <= 0) {
        notify(
          "error",
          "Failed",
          `${customerAliases["creditlimit"]} must be zero or positive`
        );
        return;
      }

      const response = await CustomerFetch.update(data.id, payloadToInsert);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/customer/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const [general, setGeneral] = useState(
    Object.fromEntries(fieldGroups.general.map((key) => [key, ""]))
  );
  const [contact, setContact] = useState(
    Object.fromEntries(fieldGroups.contact.map((key) => [key, ""]))
  );
  const [address, setAddress] = useState(
    Object.fromEntries(fieldGroups.address.map((key) => [key, ""]))
  );
  const [financial, setFinancial] = useState(
    Object.fromEntries(fieldGroups.financial.map((key) => [key, ""]))
  );

  function mapingGroup(data) {
    const pick = (keys) =>
      keys.reduce((obj, k) => {
        if (k == "createddate") {
          obj[k] = data[k] != null ? formatDateToShort(data[k]) : "";
        } else {
          obj[k] = data[k] != null ? data[k] : "";
        }
        return obj;
      }, {});

    setGeneral(pick(fieldGroups.general));
    setContact(pick(fieldGroups.contact));
    setAddress(pick(fieldGroups.address));
    setFinancial(pick(fieldGroups.financial));
  }

  const handleChangePayload = (type, payload) => {
    switch (type) {
      case "primary":
        setGeneral(payload);
        break;
      case "contact":
        setContact(payload);
        break;
      case "address":
        setAddress(payload);
        break;
      default:
        setFinancial(payload);
        break;
    }
  };

  const termOptions = [
    { label: "Net 30", value: "Net 30" },
    { label: "Net 90", value: "Net 90" },
    { label: "Net 120", value: "Net 120" },
  ];

  return (
    <>
      <Layout pageTitle="Edit Customer">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit Customer
            </p>
          </div>
          {!isLoading ? (
            <>
              {data ? (
                <div className="w-full flex flex-col gap-4">
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
                  <div className="w-full flex flex-col gap-8">
                    <InputForm
                      type="primary"
                      payload={general}
                      data={[
                        {
                          key: "customerid",
                          input: "input",
                          isAlias: true,
                          rules: [
                            {
                              required: true,
                              message: `${customerAliases["customerid"]} is required`,
                            },
                          ],
                        },
                        {
                          key: "companyname",
                          input: "input",
                          isAlias: true,
                          rules: [
                            {
                              required: true,
                              message: `${customerAliases["companyname"]} is required`,
                            },
                          ],
                        },
                        {
                          key: "salesrep",
                          input: "input",
                          isAlias: true,
                        },
                      ]}
                      onChange={handleChangePayload}
                      aliases={customerAliases}
                    />

                    <InputForm
                      type="contact"
                      payload={contact}
                      data={[
                        {
                          key: "email",
                          input: "input",
                          isAlias: false,
                          rules: [
                            {
                              pattern: /^\S+@\S+\.\S+$/,
                              message: "Email format is invalid",
                            },
                          ],
                        },
                        {
                          key: "phone",
                          input: "input",
                          isAlias: false,
                          rules: [
                            { required: true, message: "Phone is required" },
                          ],
                        },
                        {
                          key: "altphone",
                          input: "input",
                          isAlias: true,
                          rules: [],
                        },
                      ]}
                      onChange={handleChangePayload}
                      aliases={customerAliases}
                    />

                    <InputForm
                      type="address"
                      payload={address}
                      data={[
                        {
                          key: "addr1",
                          input: "input",
                          isAlias: true,
                          rules: [
                            { required: true, message: "Address is required" },
                          ],
                        },
                        {
                          key: "city",
                          input: "input",
                          isAlias: false,
                          rules: [
                            { required: true, message: "City is required" },
                          ],
                        },
                        {
                          key: "state",
                          input: "input",
                          isAlias: false,
                          rules: [
                            { required: true, message: "State is required" },
                          ],
                        },
                        {
                          key: "zip",
                          input: "input",
                          isAlias: false,
                          rules: [],
                        },
                      ]}
                      onChange={handleChangePayload}
                      aliases={customerAliases}
                    />

                    <InputForm
                      type="financial"
                      payload={financial}
                      data={[
                        {
                          key: "terms",
                          input: "select",
                          options: termOptions,
                          isAlias: true,
                          rules: [
                            {
                              required: true,
                              message: `${customerAliases["terms"]} is required`,
                            },
                          ],
                        },
                        {
                          key: "creditlimit",
                          input: "number",
                          isAlias: true,
                          rules: [
                            {
                              required: true,
                              message: `${customerAliases["creditlimit"]} is required`,
                            },
                            {
                              type: "number",
                              min: 0,
                              message: `${customerAliases["creditlimit"]} must be zero or positive`,
                            },
                          ],
                        },
                        {
                          key: "resalenumber",
                          input: "input",
                          isAlias: true,
                          rules: [
                            { required: true, message: "NPWP/NIK is required" },
                          ],
                        },
                      ]}
                      onChange={handleChangePayload}
                      aliases={customerAliases}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-96">
                  <EmptyCustom />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-96">
              <LoadingSpin />
            </div>
          )}
        </div>
      </Layout>
      {contextNotify}
      {isLoadingSubmit && <LoadingSpinProcessing />}
    </>
  );
}
