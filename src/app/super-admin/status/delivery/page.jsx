"use client";
import Layout from "@/components/superAdmin/Layout";
import { EditOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useContainerHeight from "@/hooks/useContainerHeight";
import {
  Button,
  Modal,
  Pagination,
  Table,
  Tag,
  Select,
  DatePicker,
} from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import { formatDateToShort } from "@/utils/formatDate";
import CustomerFetch from "@/modules/salesApi/customer";
import useNavigateWithParams from "@/hooks/useNavigateWithParams";
import dayjs from "dayjs";
import Search from "antd/es/input/Search";
import DeliveryStatusFetch from "@/modules/salesApi/report/deliveryStatus";
import InputForm from "@/components/superAdmin/InputForm";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function SalesOrder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");
  const { RangePicker } = DatePicker;

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);
  const customer = searchParams.get("customer");
  const startdate = searchParams.get("startdate");
  const enddate = searchParams.get("enddate");
  const so_numb = searchParams.get("so_numb");
  const offset = page - 1;

  const [datas, setDatas] = useState([]);
  const [dataDetail, setDataDetail] = useState({});
  const [dataCustomer, setDataCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);
  const title = "delivery-order";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  const navigate = useNavigateWithParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const page = parseInt(
          searchParams.get("page") || `${DEFAULT_PAGE}`,
          10
        );
        const limit = parseInt(
          searchParams.get("limit") || `${DEFAULT_LIMIT}`,
          10
        );
        const customer = searchParams.get("customer");
        const startdate = searchParams.get("startdate");
        const enddate = searchParams.get("enddate");
        const so_numb = searchParams.get("so_numb");
        const offset = page - 1;

        const response = await DeliveryStatusFetch.get(
          offset,
          limit,
          customer,
          startdate,
          enddate,
          so_numb
        );

        const resData = getResponseHandler(response, notify);

        if (resData) {
          setDatas(
            resData.list.map((item, i) => ({
              ...item,
              key: i,
            }))
          );
          setTotalItems(resData.total_items);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [
    page,
    limit,
    pathname,
    statusFilter,
    customer,
    startdate,
    enddate,
    so_numb,
  ]);

  async function fetchDetail(id) {
    try {
      const response = await DeliveryStatusFetch.getById(id);
      const resData = getResponseHandler(response, notify);

      if (resData) {
        setDataDetail({
          ...resData,
          delivery_date: formatDateToShort(resData.delivery_date),
          so_date: formatDateToShort(resData.so_date),
        });
      }
    } catch (error) {
      notify("error", "Error", "Failed get data customer");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await CustomerFetch.get(0, 10000, null);

        const resData = getResponseHandler(response, notify);

        if (resData) {
          const mapingCustomerOption = resData.list.map((data) => {
            return {
              ...data,
              value: data.id,
              label: data.companyname,
            };
          });
          setDataCustomer(mapingCustomerOption);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (record) => {
    router.push(`/super-admin/transaction/${title}/${record.id}/edit`);
  };

  const baseUrl = "/super-admin/status/delivery";

  const columns = [
    {
      title: "SO Date",
      dataIndex: "so_date",
      key: "so_date",
      render: (text) => <p>{formatDateToShort(text)}</p>,
    },
    {
      title: "SO Num",
      dataIndex: "so_numb",
      key: "so_numb",
      fixed: isLargeScreen ? "left" : "",
      render: (text, record) => (
        <p
          className="cursor-pointer text-blue-6"
          onClick={() => {
            fetchDetail(record.delivery_id);
            setIsOpenModal(true);
          }}
        >
          {text || "-"}
        </p>
      ),
    },
    {
      title: "SO Status",
      dataIndex: "so_status",
      key: "so_status",
      render: (text, record) => (
        <Tag
          color={
            ["open", "fulfilled", "closed"].includes(
              record.so_status ? record.so_status.toLowerCase() : ""
            )
              ? "green"
              : ["partially fulfilled", "pending approval"].includes(
                  record.so_status ? record.so_status.toLowerCase() : ""
                )
              ? "orange"
              : ["credit hold", "canceled"].includes(
                  record.so_status ? record.so_status.toLowerCase() : ""
                )
              ? "red"
              : "default"
          }
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Item",
      dataIndex: "itemid",
      key: "itemid",
    },
    {
      title: "Display Name",
      dataIndex: "displayname",
      key: "displayname",
    },
    {
      title: "Qty",
      dataIndex: "qty_so",
      key: "qty_so",
    },
    {
      title: "Units",
      dataIndex: "unit_so",
      key: "unit_so",
    },
    {
      title: "Qty Delivered",
      dataIndex: "qty_delivery",
      key: "qty_delivery",
    },
    {
      title: "Back Ordered",
      dataIndex: "back_ordered",
      key: "back_ordered",
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   fixed: "right",
    //   align: "right",
    //   width: isLargeScreen ? 87 : 30,
    //   render: (_, record) => (
    //     <div className="flex justify-center items-center gap-2">
    //       <Button
    //         type={"link"}
    //         size="small"
    //         icon={<EditOutlined />}
    //         onClick={() => handleEdit(record)}
    //       >
    //         {isLargeScreen ? "Edit" : ""}
    //       </Button>
    //       {contextHolder}
    //     </div>
    //   ),
    // },
  ];

  return (
    <>
      <Layout>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Delivery Status List
            </p>
          </div>
          <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
            <div className="flex gap-2">
              <div className="hidden lg:flex flex-col justify-start items-start gap-1">
                <label className="text-sm font-semibold leading-none">
                  No. SO
                </label>

                <Search
                  placeholder="Input SO Number"
                  onSearch={(value) => {
                    navigate(`${baseUrl}`, {
                      customer,
                      startdate,
                      enddate,
                      page,
                      limit,
                      so_numb: value,
                    });
                  }}
                  value={so_numb}
                  enterButton
                  allowClear
                />
              </div>
              <div className="flex gap-2">
                <div className="hidden lg:flex flex-col justify-start items-start gap-1">
                  <label className="text-sm font-semibold leading-none">
                    Customer Name
                  </label>
                  <Select
                    showSearch
                    value={customer || undefined}
                    placeholder="Select a person"
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={dataCustomer}
                    styles={{
                      popup: {
                        root: {
                          minWidth: 250,
                          whiteSpace: "nowrap",
                        },
                      },
                    }}
                    onChange={(value, option) => {
                      navigate(`${baseUrl}`, {
                        customer: option?.companyname,
                        startdate,
                        enddate,
                        page,
                        limit,
                        so_numb,
                      });
                    }}
                    allowClear
                  />
                </div>
                <div className="flex flex-col justify-start items-start gap-1">
                  <label className="hidden lg:block text-sm font-semibold leading-none">
                    Date
                  </label>
                  <div className="flex justify-center items-start gap-2">
                    <RangePicker
                      showTime={false}
                      format="YYYY-MM-DD"
                      value={[
                        startdate ? dayjs(startdate) : null,
                        enddate ? dayjs(enddate) : null,
                      ]}
                      onChange={(value, dateString) => {
                        navigate(`${baseUrl}`, {
                          customer,
                          startdate: dateString[0],
                          enddate: dateString[1],
                          page,
                          limit,
                          so_numb,
                        });
                      }}
                      //   onOk={(val) => {
                      //     console.log(val);
                      //   }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex lg:hidden flex-col justify-start items-start gap-1">
                <Select
                  showSearch
                  placeholder="Select a person"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={dataCustomer}
                  styles={{
                    popup: {
                      root: {
                        minWidth: 250,
                        whiteSpace: "nowrap",
                      },
                    },
                  }}
                  onChange={(value, option) => {
                    setSearchName(option?.companyname || "");
                  }}
                  allowClear
                  dropdownAlign={{ points: ["tr", "br"] }}
                />
              </div>
            </div>
          </div>
          {!isLoading ? (
            <>
              <div>
                <Table
                  rowKey="key"
                  size="small"
                  pagination={false}
                  columns={columns}
                  dataSource={datas}
                  scroll={{ x: "max-content" }}
                  bordered
                  tableLayout="auto"
                />
              </div>
              <div>
                <Pagination
                  total={totalItems}
                  defaultPageSize={limit}
                  defaultCurrent={page}
                  onChange={(newPage, newLimit) => {
                    //   router.push(
                    //     `/super-admin/transaction/${title}?page=${newPage}&limit=${newLimit}`
                    //   );
                    navigate(`${baseUrl}`, {
                      customer,
                      startdate,
                      enddate,
                      page: newPage,
                      limit: newLimit,
                      so_numb,
                    });
                  }}
                  size="small"
                  align={"end"}
                />
              </div>
            </>
          ) : (
            <div className="w-full h-96">
              <LoadingSpin />
            </div>
          )}
        </div>
        {notificationContextHolder}
      </Layout>
      {contextHolder}
      <Modal
        open={isOpenModal}
        width={850}
        onCancel={() => {
          setIsOpenModal(false);
          setDataDetail({});
        }}
        footer={() => <></>}
      >
        <div className="w-full flex flex-col gap-4 mt-4">
          <InputForm
            isReadOnly={true}
            type="primary"
            payload={dataDetail}
            data={[
              { key: "customer", input: "input", isAlias: true, isRead: true },
            ]}
            aliases={[]}
          />
          <InputForm
            isReadOnly={true}
            type="Sales Order"
            payload={dataDetail}
            data={[
              { key: "so_numb", input: "input", isAlias: true, isRead: true },
              { key: "so_date", input: "input", isAlias: true, isRead: true },
              {
                key: "displayname",
                input: "input",
                isAlias: true,
                isRead: true,
              },
              { key: "itemid", input: "input", isAlias: true, isRead: true },
              { key: "qty_so", input: "input", isAlias: true, isRead: true },
              { key: "so_status", input: "input", isAlias: true, isRead: true },
              { key: "unit_so", input: "input", isAlias: true, isRead: true },
            ]}
            aliases={[]}
          />
          <InputForm
            isReadOnly={true}
            type="Delivery Order"
            payload={dataDetail}
            data={[
              {
                key: "delivery_numb",
                input: "input",
                isAlias: true,
                isRead: true,
              },
              {
                key: "delivery_date",
                input: "input",
                isAlias: true,
                isRead: true,
              },
              {
                key: "displayname",
                input: "input",
                isAlias: true,
                isRead: true,
              },
              {
                key: "delivery_status",
                input: "input",
                isAlias: true,
                isRead: true,
              },
              {
                key: "unit_delivery",
                input: "input",
                isAlias: true,
                isRead: true,
              },
              {
                key: "back_ordered",
                input: "input",
                isAlias: true,
                isRead: true,
              },
            ]}
            aliases={[]}
          />
        </div>
      </Modal>
    </>
  );
}

export default function SalesOrderPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <SalesOrder />
    </Suspense>
  );
}
