"use client";
import Layout from "@/components/superAdmin/Layout";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import ItemFetch from "@/modules/salesApi/item";
import { Button, Input, Modal, Pagination, Table } from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import Search from "antd/es/input/Search";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function Item() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);
  const offset = (page - 1) * limit;
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState();

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [modal, contextHolder] = Modal.useModal();
  const title = 'item'
  const { notify, contextHolder: notificationContextHolder } = useNotification();

    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsloading(true);
  
          const response = await ItemFetch.get(offset, limit);
  
          const resData = getResponseHandler(response, notify)
  
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
  
    if (!searchCode && searchName == "") {
        fetchData();
    }
    }, [page, limit, pathname, searchCode, searchName]);

  const fetchData = async () => {
    try {
      setIsloading(true);
      const response = await ItemFetch.get(offset, limit, searchName == '' ? null : searchName, !searchCode || searchCode == '' ? null : searchCode );
      const resData = getResponseHandler(response, notify)
  
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

  const handleEdit = (record) => {
    router.push(`/super-admin/master-data/${title}/${record.id}/edit`);
  };


  const columns = [
    // {
    //   title: 'Internal ID',
    //   dataIndex: 'id',
    //   key: 'id',
    //   onHeaderCell: () => ({
    //     style: { minWidth: 200 },
    //   }),
    //   onCell: () => ({
    //     style: { minWidth: 200 },
    //   }),
    // },
    {
      title: 'Item Name/Number',
      dataIndex: 'itemid',
      key: 'itemid',
      fixed: isLargeScreen ? 'left' : '',
      render: (text, record) => (
        <Link href={`/super-admin/master-data/${title}/${record.id}`}>
          {text || '-'}
        </Link>),
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: 'Display Name/Code',
      dataIndex: 'displayname',
      key: 'displayname',
      onHeaderCell: () => ({
        style: { minWidth: 180 },
      }),
      onCell: () => ({
        style: { minWidth: 180 },
      }),
    },
    {
      title: 'Item Process Family',
      dataIndex: 'itemprocessfamily',
      key: 'itemprocessfamily',
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      align: 'right',
      width: 87,
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
              <Button 
                  type="link"
                  size="small"  
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(record)}
              >
                {isLargeScreen? 'Edit' : ''}
              </Button>
                {contextHolder}
        </div>
      ),
      onHeaderCell: () => ({
        style: { minWidth: 80 },
      }),
      onCell: () => ({
        style: { minWidth: 80 },
      }),
    }
  ];

  const handleEnter = (e, type) => {
    if (e.key === "Enter") {
        fetchData()
    }
  };

  return (
    <Layout pageTitle={title}>
            <div className='w-full flex flex-col gap-4'>
                <div className='w-full flex justify-between items-center'>
                    <p className='text-xl lg:text-2xl font-semibold text-blue-6'>Item List</p>
                        <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => router.push(`/super-admin/master-data/${title}/new`)}
                    >
                        {isLargeScreen ? `New` : ""}
                    </Button>
                </div>
                    <div className='w-full flex justify-between items-start p-2 bg-gray-2 border border-gray-4 rounded-lg'>
                        <div className='flex gap-2'>
                            <div className='flex flex-col justify-start items-start gap-1'>
                                <label className='hidden lg:block text-sm font-semibold leading-none'>Code</label>
                                <Input
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    onKeyDown={(e) => handleEnter(e)}
                                    placeholder={isLargeScreen? '' : 'Code'}
                                    allowClear/>
                            </div>
                            <div className='flex flex-col justify-start items-start gap-1'>
                                <label className='hidden lg:block text-sm font-semibold leading-none'>Display Name</label>
                                <Search placeholder={isLargeScreen? '' : 'Name'} width={'100%'} allowClear value={searchName} onChange={(e) => {setSearchName(e.target.value); handleEnter(e, 'name')}} onSearch={fetchData}/>
                            </div>  
                        </div>
                        <div className='flex gap-2'>
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
                                scroll={{x: 'max-content'}}
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
                                    `/super-admin/${title}?page=${newPage}&limit=${newLimit}`
                                    )
                                }}
                                size='small'
                                align={'end'}
                            />
                        </div>
                    </>
                ) : (
                    <div className="w-full h-96">                    
                        <LoadingSpin/>
                    </div>
                )}
            </div>
          {notificationContextHolder}
    </Layout>
  );
}

export default function ItemPage() {
    return (
      <Suspense
        fallback={
          <LoadingSpinProcessing/>
        }
      >
        <Item/>
      </Suspense>
    );
  }