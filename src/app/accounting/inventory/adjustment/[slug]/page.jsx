"use client";

import React, { useEffect, useState } from "react";
import { Button, Divider, Dropdown, Modal, Table, Tag } from "antd";
import Layout from "@/components/accounting/Layout";
import { UnorderedListOutlined } from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import { customerAliases, stockAdjustmentAliases } from "@/utils/aliases";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import InputForm from "@/components/superAdmin/InputForm";
import { getByIdResponseHandler } from "@/utils/responseHandlers";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatDateToShort } from "@/utils/formatDate";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import StockAdjustmentFetch from "@/modules/salesApi/stockAdjustment";

export default function Detail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint("lg");
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await StockAdjustmentFetch.getById(slug);
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

  const title = "adjustment";

  const fieldGroups = {
    general: [
      "id",
      "tranid",
      "trandate",
      "gudang_id",
      "memo",
      "status",
      "createdby",
      "createddate",
      "approvedby",
      "approveddate",
    ],
  };

  const [general, setGeneral] = useState(
    Object.fromEntries(fieldGroups.general.map((key) => [key, ""]))
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
  }

  const keyTable = [
    "displayname",
    "itemcode",
    "price",
    "onhand",
    "qty",
    "stockreal",
    "units",
  ];

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Stock Adjustment Details
          </p>
          <Button
            icon={<UnorderedListOutlined />}
            type="link"
            onClick={() => {
              router.push(`/accounting/inventory/${title}`);
            }}
          >
            {isLargeScreen ? "List" : ""}
          </Button>
        </div>
        {!isLoading ? (
          <>
            {data ? (
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                  <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                    <p className="w-full lg:text-lg">{data.tranid}</p>
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
                              : "orange"
                          }
                        >
                          {data.status}
                        </Tag>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full flex flex-col gap-8">
                  <InputForm
                    isReadOnly={true}
                    type="primary"
                    payload={general}
                    data={[
                      { key: "createddate", input: "input", isAlias: true },
                      { key: "memo", input: "text", isAlias: true },
                    ]}
                    aliases={stockAdjustmentAliases.primary}
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
                      Stok Detail
                    </Divider>
                    <TableCustom
                      data={data?.stock_opname_det || []}
                      keys={keyTable}
                      aliases={stockAdjustmentAliases.adjustment}
                    />
                  </div>
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
      {contextNotify}
    </Layout>
  );
}

function TableCustom({ data, keys, aliases }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Hitung data yang akan ditampilkan di halaman aktif
  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Buat columns secara dinamis
  const columns = keys.map((key) => {
    return {
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
    };
  });

  return (
    <Table
      columns={columns}
      dataSource={paginatedData}
      rowKey="id"
      bordered
      pagination={{
        size: "small",
        current: currentPage,
        pageSize: pageSize,
        total: data.length,
        onChange: (page) => setCurrentPage(page),
        showSizeChanger: false,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }}
      scroll={{ x: "max-content" }}
    />
  );
}
