"use client";
import Layout from "@/components/superAdmin/Layout";
import { EditOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useContainerHeight from "@/hooks/useContainerHeight";
import CustomerFetch from "@/modules/salesApi/customer";
import { Button, Dropdown, Modal, Pagination, Table, Tag } from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import HeaderContent from "@/components/superAdmin/masterData/HeaderContent";
import BodyContent from "@/components/superAdmin/masterData/BodyContent";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { deleteResponseHandler, getResponseHandler } from "@/utils/responseHandlers";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import { formatDateToShort } from "@/utils/formatDate";
import FullfillmentFetch from "@/modules/salesApi/itemFullfillment";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function SalesOrder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");
  const { containerRef, containerHeight } = useContainerHeight();

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);
  const offset = (page - 1) * limit;

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const title = 'delivery-order'
  const { notify, contextHolder: notificationContextHolder } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await FullfillmentFetch.get(offset, limit, statusFilter);

        const resData = getResponseHandler(response, notify)
        console.log(resData)

        if (resData) {
            setDatas(resData.list)
            setTotalItems(resData.total_items)
        }

      } catch (error) {
        notify('error', 'Error', error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [page, limit, pathname, statusFilter]);


  const handleEdit = (record) => {
    router.push(`/super-admin/${title}/${record.id}/edit`);
  };

  const handleStatusChange = ({key}) => {
    dropdownItems.forEach(item => {
        if (item.key == key) {
            const label = item.label.toLocaleLowerCase()
            if (label != statusFilter.toLocaleLowerCase()) {
                switch (label) {
                    case 'all status':
                        setStatusFilter('all')
                        break;
                    // case 'pending approval':
                    //     setStatusFilter('pending')
                    //     break;
                    default:
                        setStatusFilter(item.label)
                }
            }
        }
    })
  }

  const dropdownItems = [
    {
      key: '1',
      label: 'All Status'
    },
    {
      key: '2',
      label: 'Open'
    },
    {
      key: '3',
      label: 'Shipped '
    },
  ];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'trandate',
      key: 'trandate',
      render: (text) => (
        <p>{formatDateToShort(text)}</p>
      )
    },
    {
      title: 'Document Number',
      dataIndex: 'createdfrom',
      key: 'createdfrom',
      fixed: isLargeScreen ? 'left' : '',
      render: (text, record) => (
        <Link href={`/super-admin/${title}/${record.id}`}>
          {text}
        </Link>)
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (text, record) => (
    //     <Tag color={record.status.toLocaleLowerCase() == 'open' ? 'green' : 'error'}>
    //         {text}
    //     </Tag>
    //   )
    // },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      align: 'right',
      width: 87,
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
              <Button 
                  type={'link'}
                  size="small"  
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(record)}
              >
                {isLargeScreen? 'Edit' : ''}
              </Button>
                {contextHolder}
        </div>
      ),
    }
  ];

  return (
    <Layout pageTitle='Delivery Order List'>
        <HeaderContent justify="between">
            <div className="flex justify-start items-center">
            </div>
            <div className="flex justify-end items-center gap-2 lg:gap-4">
                <Dropdown
                    menu={{ items: dropdownItems, onClick: handleStatusChange, style: { textAlign: "right" } }}
                    placement="bottomRight"
                   >
                       <Button icon={<FilterOutlined />} style={{ textTransform: "capitalize" }}>
                        {isLargeScreen ? (statusFilter == "all" ? "all status" : statusFilter) : ""}
                    </Button>
                 </Dropdown>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.push(`/super-admin/${title}/new`)}
                >
                    {isLargeScreen ? `Add` : ""}
                </Button>
            </div>
        </HeaderContent>
        <BodyContent gap="0">
            {!isLoading ? (
                <>
                    <div ref={containerRef} className="w-full h-[92%]">
                        <Table
                                rowKey={(record) => record.id}
                                size="small" pagination={false}
                                columns={columns}
                                dataSource={datas}
                                scroll={{y: containerHeight - 50, x: 'max-content'}}
                                bordered
                                tableLayout="auto"
                            />
                        </div>
                        <div className="w-full h-[8%] flex justify-end items-end overflow-hidden">
                        <Pagination
                            total={totalItems}
                            defaultPageSize={limit}
                            defaultCurrent={page}
                            onChange={(newPage, newLimit) => {
                                router.push(
                                `/super-admin/${title}?page=${newPage}&limit=${newLimit}`
                                )
                            }}
                            size='small'
                            align={'end'}
                        />
                    </div>
                </>
            ) : (
            <LoadingSpin/>
            )}

        </BodyContent>
        {notificationContextHolder}
    </Layout>
  );
}

export default function SalesOrderPage() {
    return (
      <Suspense
        fallback={
          <LoadingSpinProcessing/>
        }
      >
        <SalesOrder/>
      </Suspense>
    );
  }