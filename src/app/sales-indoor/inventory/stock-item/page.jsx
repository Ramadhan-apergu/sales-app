"use client";
import Layout from "@/components/salesIndoor/Layout";
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
  Input,
} from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import UserManageFetch from "@/modules/salesApi/userManagement";
import StockAdjustmentFetch from "@/modules/salesApi/stockAdjustment";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function StockItem() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);
  const offset = page - 1;

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const [searchItem, setSearchItem] = useState("");
  const [searchItemTemp, setSearchItemTemp] = useState("");
  const title = "user";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await StockAdjustmentFetch.getStockStatus(
          offset,
          limit,
          searchItem
        );

        const resData = getResponseHandler(response, notify);

        if (resData) {
          setDatas(resData.list);
          setTotalItems(resData.total_items);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [page, limit, pathname, searchItem]);

  const columns = [
    {
      title: "Item Name/Number",
      dataIndex: "itemid",
      key: "itemid",
      fixed: isLargeScreen ? "left" : "",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: "Display Name/Code",
      dataIndex: "displayname",
      key: "displayname",
      onHeaderCell: () => ({
        style: { minWidth: 180 },
      }),
      onCell: () => ({
        style: { minWidth: 180 },
      }),
    },
    {
      title: "Item Process Family",
      dataIndex: "itemprocessfamily",
      key: "itemprocessfamily",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
      render: (text) => (
        <p>{typeof text == 'number' ? text.toLocaleString('en') : parseFloat(text).toLocaleString('en')}</p>
      )
    },
  ];
  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Stock Item List
          </p>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2 flex-col md:flex-row">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden md:block text-sm font-semibold leading-none">
                Item Name/Number
              </label>
              <Input
                placeholder="Search User"
                styles={{
                  popup: {
                    root: {
                      minWidth: 150,
                      whiteSpace: "nowrap",
                    },
                  },
                }}
                value={searchItemTemp}
                onChange={(e) => {
                  if (e.target.value.length == 0) {
                    setSearchItem("");
                  }
                  setSearchItemTemp(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchItem(searchItemTemp);
                  }
                }}
              />
            </div>
          </div>
        </div>
        {!isLoading ? (
          <>
            <div>
              <Table
                rowKey={(record) => record.id}
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
                  router.push(
                    `/sales-indoor/access-control/${title}?page=${newPage}&limit=${newLimit}`
                  );
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
  );
}

export default function StockItemPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <StockItem />
    </Suspense>
  );
}
