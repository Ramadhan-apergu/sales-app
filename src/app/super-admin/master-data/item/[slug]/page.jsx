'use client';

import React, {useEffect, useState } from 'react';
import { Button, Dropdown, Modal } from 'antd';
import Layout from '@/components/superAdmin/Layout';
import {
  EditOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import useNotification from '@/hooks/useNotification';
import { useParams, useRouter } from 'next/navigation';
import { itemAliases } from '@/utils/aliases';
import LoadingSpin from '@/components/superAdmin/LoadingSpin';
import InputForm from '@/components/superAdmin/InputForm';
import { deleteResponseHandler, getByIdResponseHandler } from '@/utils/responseHandlers';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatDateToShort } from '@/utils/formatDate';
import EmptyCustom from '@/components/superAdmin/EmptyCustom';
import ItemFetch from '@/modules/salesApi/item';

export default function Detail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint('lg')
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    async function fetchData() {
        try {
            setIsLoading(true)
            const response = await ItemFetch.getById(slug)
            const resData = getByIdResponseHandler(response, notify)

            setData(resData)
            
            if (resData) {
                mapingGroup(resData)
            }

        } catch (error) {
            const message =
            error?.message ||
            "Login failed! Server error, please try again later.";
          notify('error', 'Error', message);
        } finally {
            setIsLoading(false)
        }
    }
    fetchData()
  }, [])

  const title = 'item'

  const fieldGroups = {
    general:  [
        "id",
        "itemid",
        "displayname",
        "itemprocessfamily",
        "saleunit",
        "stockunit",
        "unitstype",
        "createdby",
        "createddate",
      ],
    pricing: [
      "price","discount"
    ],
  }

  const handleEdit = () => {
    router.push(`/super-admin/master-data/${title}/${data.id}/edit`);
  };
  
  const deleteModal = () => {
    modal.confirm({
      title: `Delete ${title} "${data.displayname}"?`,
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: () => {
        handleDelete(data.id)
      },
    });
  };

    const handleDelete = async (id) => {
      try {
          const response = await ItemFetch.delete(id)

          const resData = deleteResponseHandler(response, notify)
  
          if (resData) {
            router.push(`/super-admin/master-data/${title}`);
          }
  
      } catch (error) {
          notify('error', 'Error', error?.message || "Internal Server error");
      }
    }

  const [general, setGeneral] = useState(
    Object.fromEntries(fieldGroups.general.map(key => [key, '']))
  )
  const [pricing, setPricing] = useState(
    Object.fromEntries(fieldGroups.pricing.map(key => [key, '']))
  )

  function mapingGroup(data) {
    const pick = (keys) => 
      keys.reduce((obj, k) => {
        if (k == 'createddate') {
            obj[k] = data[k] != null ? formatDateToShort(data[k]) : ''
        } else {
            obj[k] = data[k] != null ? data[k] : ''
        }
        return obj
      }, {})

    setGeneral(pick(fieldGroups.general))
    setPricing(pick(fieldGroups.pricing))
  }

  const items = [
    {
      key: '1',
      label: 'Delete',
      danger: true
    },
  ];

  const handleClickAction = ({ key }) => {
    switch (key) {
      case '1':
        deleteModal();
        break;
      default:
        console.warn('Unhandled action:', key);
    }
  };

  return (
        <Layout>
        <div className='w-full flex flex-col gap-4'>
            <div className='w-full flex justify-between items-center'>
                <p className='text-xl lg:text-2xl font-semibold text-blue-6'>Item Details</p>
                <Button icon={<UnorderedListOutlined />} type='link' onClick={() => {router.push(`/super-admin/master-data/${title}`);}}>
                    {isLargeScreen ? 'List' : ''}
                </Button>
            </div>
                {!isLoading ? (
                    <>
                        {data ? (
                                    <div className='w-full flex flex-col gap-4'>
                                        <div className='w-full flex flex-col lg:flex-row justify-between items-start'>
                                                <div className='w-full lg:w-1/2 flex gap-1 flex-col'>
                                                    <p className='w-full lg:text-lg'>
                                                        {data.displayname + ' / ' + data.itemid}
                                                    </p>
                                                    {/* <div>
                                                        <Tag style={{textTransform: 'capitalize', fontSize: '16px'}} color={data.status =='active' ? 'green' : 'red'}>{data.status}</Tag>
                                                    </div> */}
                                                </div>
                                                <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                                                    <Button icon={<EditOutlined />} type={'primary'} onClick={handleEdit}>{isLargeScreen ? 'Edit' : ''}</Button>
                                                    {contextHolder}
                                                    <Dropdown menu={{ items, onClick: handleClickAction }} placement="bottomRight">
                                                        <Button icon={!isLargeScreen ? <MoreOutlined/> : null} >{isLargeScreen ? 'Action' : ''}</Button>
                                                    </Dropdown>
                                            </div>
                                        </div>
                                        <div className='w-full flex flex-col gap-8'>
                                        <InputForm
                                        isReadOnly={true}
                                        type="primary"
                                        payload={general}
                                        data={[
                                            { key: 'displayname', input: 'input', isAlias: true },
                                            { key: 'id', input: 'input', isAlias: true },
                                            { key: 'itemid', input: 'input', isAlias: true },
                                            { key: 'itemprocessfamily', input: 'input', isAlias: true },
                                            { key: 'saleunit', input: 'input', isAlias: true },
                                            { key: 'stockunit', input: 'input', isAlias: true },
                                            { key: 'unitstype', input: 'input', isAlias: true },
                                            { key: 'createdby', input: 'input', isAlias: true },
                                            { key: 'createddate', input: 'input', isAlias: true },
                                        ]}
                                        aliases={itemAliases}
                                    />
                                    <InputForm
                                        isReadOnly={true}
                                        type="pricing"
                                        payload={pricing}
                                        data={[
                                            { key: 'price', input: 'input', isAlias: false },
                                            { key: 'discount', input: 'input', isAlias: false },
                                        ]}
                                        aliases={itemAliases}
                                    />
                                        </div>
                                    </div>
                        ) : (
                            <div className='w-full h-96'>
                                <EmptyCustom/>
                            </div>
                        )}
                    </>
                ) : (
                        <div className='w-full h-96'>
                            <LoadingSpin/>
                        </div>
                )}
        </div>
        {contextNotify}
    </Layout>
    // <Layout pageTitle={`Detail ${title}`}>
    //             <HeaderContent justify='between'>
    //                 <Button icon={<UnorderedListOutlined />} variant={'outlined'} onClick={() => {router.push(`/super-admin/master-data/${title}`);}}>
    //                     {isLargeScreen ? 'List' : ''}
    //                 </Button>
    //                 {data && (
    //                     <div className="flex justify-center items-center gap-2">
    //                         <Button icon={<EditOutlined />} type={'primary'} onClick={handleEdit}>{isLargeScreen ? 'Edit' : ''}</Button>
    //                         <Dropdown menu={{ items, onClick: handleClickAction }} placement="bottomRight">
    //                             <Button icon={!isLargeScreen ? <MoreOutlined/> : null} >{isLargeScreen ? 'Action' : ''}</Button>
    //                         </Dropdown>
    //                         {contextHolder}
    //                     </div>
    //                 )}
    //             </HeaderContent>
    //             <BodyContent gap='12'>
    //                 {!isLoading ? (
    //                     <>
    //                         {data ? (
    //                             <div className='w-full h-full flex flex-col gap-8'>
    //                                 <div className='w-full flex flex-col px-4'>
    //                                     <p className='text-2xl font-semibold'>Item Details</p>
    //                                     <div className='w-full flex lg:text-lg'>
    //                                         <p className='w-full'>
    //                                             {data.displayname + ' / ' + data.itemid}
    //                                         </p>
    //                                     </div>
    //                                 </div>
                                    
    //                             </div>
    //                         ) : (
    //                             <EmptyCustom/>
    //                         )}
    //                     </>
    //                 ) : (
    //                     <LoadingSpin/>
    //                 )}
    //             </BodyContent>
    //     {contextNotify}
    // </Layout>
  );
}
