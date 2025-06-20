"use client";

import React, { useEffect, useState } from "react";
import { Button, Divider, Table, Modal, Select, Dropdown } from "antd";
import Layout from "@/components/superAdmin/Layout";
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
import { agreementAliases, applyAgreementAliases } from "@/utils/aliases";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import InputForm from "@/components/superAdmin/InputForm";
import {
  createResponseHandler,
  getResponseHandler,
} from "@/utils/responseHandlers";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import ItemFetch from "@/modules/salesApi/item";
import Search from "antd/es/input/Search";
import AgreementFetch from "@/modules/salesApi/agreement";
import CustomerFetch from "@/modules/salesApi/customer";
import { formatDateToShort } from "@/utils/formatDate";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => ({
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
      align: "right",
    })),
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button type="link" onClick={() => onDelete(record)}>
          Delete
        </Button>
      ),
    },
  ];

  const dataWithKey = data.map((item, idx) => ({
    ...item,
    _key: `row-${idx}`,
  }));

  return (
    <Table
      columns={columns}
      dataSource={dataWithKey}
      rowKey="_key"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

export default function AgreementApplyDetail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const [modal, contextHolder] = Modal.useModal();
  const title = "apply-agreement";
  const [payloadCustomer, setPayloadCustomer] = useState({
    customer: "",
    customercode: "",
    customerid: "",
  });
  const [payloadAgreementList, setpayloadAgreementList] = useState([]);
  const [isModal, setIsModal] = useState(false);

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [dataAgreement, setDataAgreement] = useState([]);
  const [agreementSelectedTemp, setAgreementSelectedTemp] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { slug } = useParams();
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchDataApplyAgreement = async () => {
      try {
        const response = await AgreementFetch.getByCustCode(decodeURIComponent(slug) || '');

        const resData = getResponseHandler(response, notify);

        setData(resData);
        if (resData) {
          setPayloadCustomer({
            customer: resData.customer,
            customercode: resData.customercode,
            customerid: resData.customerid,
          });

          setpayloadAgreementList(resData.agreement_list);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataApplyAgreement();

    const fetchDataAgreement = async () => {
      try {
        const response = await AgreementFetch.get(0, 10000, "active");

        const resData = getResponseHandler(response, notify);

        if (resData) {
          setDataAgreement(
            resData.list.map((agreement) => ({
              ...agreement,
              label: agreement.agreementname,
              value: agreement.id,
            }))
          );
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataAgreement();
  }, []);

  const handleChangePayload = (type, payload) => {
    switch (type) {
      case "customer":
        setPayloadCustomer(payload);
        break;
    }
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      if (payloadCustomer.customer == "") {
        throw new Error("Customer is required");
      }

      if (payloadAgreementList.length == 0) {
        throw new Error("Agreement list is required");
      }

      const payloadToInsert = {
        agreement_list: payloadAgreementList.map((agreement) => {
          return {
            id: agreement.id,
          };
        }),
      };

      const response = await AgreementFetch.updateApplyAgreement(
        data.customerid,
        payloadToInsert
      );

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}/${slug}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };
  const formOptions = {
    1: "Discount Percentage (%)",
    2: "Special Price (Rp)",
    3: "Payment Method",
    4: "Free Item",
    5: "Discount Group",
  };

  function handleModalAgreementOk() {
    setpayloadAgreementList((prev) => [...prev, agreementSelectedTemp]);
    setAgreementSelectedTemp(null);
    setIsModal(false);
  }

  function handleModalAgreementCancel() {
    setAgreementSelectedTemp(null);
    setIsModal(false);
  }

  const items = [
    {
      key: "1",
      label: "Delete",
      danger: true,
    },
  ];

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit Apply Agreement
            </p>
          </div>
          {!isLoading ? (
            <>
              {data && data.customerid ? (
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
                  <InputForm
                    type="customer"
                    title="Customer"
                    payload={payloadCustomer}
                    data={[
                      {
                        key: "customer",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "customercode",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={applyAgreementAliases.customer}
                  />
                  <div className="w-full flex flex-col gap-4">
                    <Divider
                      style={{
                        margin: "0",
                        textTransform: "capitalize",
                        borderColor: "#1677ff",
                      }}
                      orientation="left"
                    >
                      Agreement List
                    </Divider>
                    <div className="flex justify-end">
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsModal(true);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <TableCustom
                      onDelete={(agreement) => {
                        setpayloadAgreementList((prev) =>
                          prev.filter(
                            (prevAgreement) => prevAgreement.id != agreement.id
                          )
                        );
                      }}
                      data={payloadAgreementList}
                      keys={["agreementcode", "agreementname", "effectivedate"]}
                      aliases={applyAgreementAliases.agreement}
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
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextHolder}
      {contextNotify}

      <Modal
        open={isModal}
        onOk={handleModalAgreementOk}
        onCancel={handleModalAgreementCancel}
        width={850}
        cancelText="Cancel"
      >
        <div className="w-full mt-6">
          <div className="w-full flex flex-col gap-4 mt-6">
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
                  Agreement
                </Divider>
                <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                  <p>Agreement Name</p>
                  <Select
                    value={agreementSelectedTemp?.value || null}
                    showSearch
                    placeholder="Select an item"
                    optionFilterProp="label"
                    onChange={(_, agreement) => {
                      const findAgreementExisting = payloadAgreementList.find(
                        (itemAgreement) => itemAgreement.id == agreement.id
                      );
                      if (!findAgreementExisting) {
                        setAgreementSelectedTemp({
                          ...agreement,
                          effectivedate: formatDateToShort(
                            agreement.effectivedate
                          ),
                          enddate: formatDateToShort(agreement.enddate),
                          form: formOptions[agreement.customform],
                        });
                      } else {
                        notify("error", "Error", "Agreement has been added");
                        setAgreementSelectedTemp(null);
                      }
                    }}
                    onSearch={{}}
                    options={dataAgreement}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
            <InputForm
              key={agreementSelectedTemp?.agreementcode || "empty"}
              title="Agreement Details"
              type="agreementSelected"
              payload={agreementSelectedTemp}
              data={[
                {
                  key: "agreementcode",
                  input: "input",
                  isAlias: true,
                  isRead: true,
                },
                {
                  key: "form",
                  input: "input",
                  isAlias: true,
                  isRead: true,
                },
                {
                  key: "effectivedate",
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
              ]}
              aliases={[]}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
