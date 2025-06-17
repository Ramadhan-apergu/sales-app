"use client";

import React, { useEffect, useState } from "react";
import { Button, Divider, Table, Modal, Select, Dropdown } from "antd";
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
import { agreementAliases, applyAgreementAliases } from "@/utils/aliases";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import InputForm from "@/components/superAdmin/InputForm";
import {
  createResponseHandler,
  deleteResponseHandler,
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
    // {
    //   title: "Action",
    //   key: "action",
    //   align: "right",
    //   render: (_, record) => (
    //     <Button type="link" onClick={() => onDelete(record)}>
    //       Delete
    //     </Button>
    //   ),
    // },
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
    // const fetchDataCusomer = async () => {
    //   try {
    //     const response = await CustomerFetch.get(0, 10000, "active");

    //     const resData = getResponseHandler(response, notify);

    //     if (resData) {
    //       console.log(resData);
    //       setDataCustomer(
    //         resData.list.map((customer) => ({
    //           ...customer,
    //           label: customer.companyname,
    //           value: customer.id,
    //         }))
    //       );
    //     }
    //   } catch (error) {
    //     notify("error", "Error", error?.message || "Internal Server error");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchDataCusomer();

    // const fetchDataAgreement = async () => {
    //   try {
    //     const response = await AgreementFetch.get(0, 10000, "active");

    //     const resData = getResponseHandler(response, notify);

    //     if (resData) {
    //       setDataAgreement(
    //         resData.list.map((agreement) => ({
    //           ...agreement,
    //           label: agreement.agreementname,
    //           value: agreement.id,
    //         }))
    //       );
    //     }
    //   } catch (error) {
    //     notify("error", "Error", error?.message || "Internal Server error");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchDataAgreement();
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
        customerid: payloadCustomer.customer,
        agreement_list: payloadAgreementList.map((agreement) => {
          return {
            id: agreement.id,
          };
        }),
      };

      const response = await AgreementFetch.addAgreementApply(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}`);
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

  const deleteModal = () => {
    modal.confirm({
      title: `Delete ${title} "${data.customer}"?`,
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: () => {
        handleDelete(data.customerid);
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await AgreementFetch.deleteApplyAgreement(id);

      const resData = deleteResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}`);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    }
  };

  const items = [
    // {
    //   key: '1',
    //   label: 'Approve'
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
        notify("success", "Approve Boongan", ":P");
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
              Apply Agreement Details
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/super-admin/master-data/${title}`);
              }}
            >
              {isLargeScreen ? "List" : ""}
            </Button>
          </div>
          {!isLoading ? (
            <>
              {data && data.customerid ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                    <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                      <p className="w-full lg:text-lg">
                        {data.customercode + " / " + data.customer}
                      </p>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                      <Button
                        icon={<EditOutlined />}
                        type={"primary"}
                        onClick={() => {
                          router.push(
                            `/super-admin/master-data/${title}/${encodeURIComponent(data.customercode) || ""}/edit`
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
