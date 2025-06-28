"use client";

import React, { useState } from "react";
import { Button } from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CheckOutlined, LeftOutlined } from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import CustomerFetch from "@/modules/salesApi/customer";
import { customerAliases } from "@/utils/aliases";
import InputForm from "@/components/superAdmin/InputForm";
import { createResponseHandler } from "@/utils/responseHandlers";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export default function CustomerNew() {
  const { notify, contextHolder } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");

  const [payloadGeneral, setPayloadGeneral] = useState({
    companyname: "",
    customerid: "",
    salesrep: "",
  });

  const [payloadContact, setPayloadContact] = useState({
    email: "",
    phone: "",
    altphone: "",
  });

  const [payloadAddress, setPayloadAddress] = useState({
    state: "",
    city: "",
    addr1: "",
    zip: "",
  });

  const [payloadFinancial, setPayloadFinancial] = useState({
    terms: "7",
    creditlimit: 0,
    resalenumber: "",
  });

  const termOptions = [
    { label: "7 Days", value: "7" },
    { label: "14 Days", value: "14" },
    { label: "30 Days", value: "30" },
  ];

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePayload = (type, payload) => {
    switch (type) {
      case "primary":
        setPayloadGeneral(payload);
        break;
      case "contact":
        setPayloadContact(payload);
        break;
      case "address":
        setPayloadAddress(payload);
        break;
      default:
        setPayloadFinancial(payload);
        break;
    }
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      const payloadToInsert = {
        ...payloadGeneral,
        ...payloadContact,
        ...payloadAddress,
        ...payloadFinancial,
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

      const response = await CustomerFetch.add(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/customer/${resData}`);
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
              Add New Customer
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
                payload={payloadGeneral}
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
                payload={payloadContact}
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
                    rules: [{ required: true, message: "Phone is required" }],
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
                payload={payloadAddress}
                data={[
                  {
                    key: "addr1",
                    input: "input",
                    isAlias: true,
                    rules: [{ required: true, message: "Address is required" }],
                  },
                  {
                    key: "city",
                    input: "input",
                    isAlias: false,
                    rules: [{ required: true, message: "City is required" }],
                  },
                  {
                    key: "state",
                    input: "input",
                    isAlias: true,
                    rules: [{ required: true, message: "State is required" }],
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
                payload={payloadFinancial}
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
                      {
                        required: true,
                        message: `${customerAliases["resalenumber"]} is required`,
                      },
                    ],
                  },
                ]}
                onChange={handleChangePayload}
                aliases={customerAliases}
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
