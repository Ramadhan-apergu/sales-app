'use client';

import React, {useEffect, useState } from 'react';
import { Button, Divider, Dropdown, Modal, Tag } from 'antd';
import Layout from '@/components/superAdmin/Layout';
import {
  EditOutlined,
  MoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import useNotification from '@/hooks/useNotification';
import { useParams, useRouter } from 'next/navigation';
import CustomerFetch from '@/modules/salesApi/customer';
import HeaderContent from '@/components/superAdmin/masterData/HeaderContent';
import BodyContent from '@/components/superAdmin/masterData/BodyContent';
import { customerAliases } from '@/utils/aliases';
import LoadingSpin from '@/components/superAdmin/LoadingSpin';
import InputForm from '@/components/superAdmin/masterData/InputForm';
import { deleteResponseHandler, getByIdResponseHandler } from '@/utils/responseHandlers';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatDateToShort } from '@/utils/formatDate';
import EmptyCustom from '@/components/superAdmin/masterData/EmptyCustom';
import SalesOrderFetch from '@/modules/salesApi/salesOrder';
import EditableTable from '@/components/superAdmin/masterData/EditableTable';
import FullfillmentFetch from '@/modules/salesApi/itemFullfillment';

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
            const response = await FullfillmentFetch.getById(slug)
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

  const title = 'delivery-order'

  const fieldGroups = {
    general: [
        'id',
        'salesorderid',
        'refno',
        'entity',
        'createdfrom',
        'shipstatus',
        'trandate',
        'memo',
        'createdby',
        'createddate',
        'customer',
        'dateso',
        'numso',
      ],
    item: [
        "fulfillment_items"
    ],
    shipping: [
        "shippingoption",
        "shippingaddress",
    ]
  }

  const handleEdit = () => {
    router.push(`/super-admin/master-data/${title}/${data.id}/edit`);
  };
  
  const deleteModal = () => {
    modal.confirm({
      title: `Delete ${title} "${data.companyname}"?`,
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
          const response = await CustomerFetch.delete(id)

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
  const [item, setItem] = useState(
    Object.fromEntries(fieldGroups.item.map(key => [key, '']))
  )
  const [shipping, setShipping] = useState(
    Object.fromEntries(fieldGroups.shipping.map(key => [key, '']))
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
    setItem(pick(fieldGroups.item))
    setShipping(pick(fieldGroups.shipping))
  }

  const items = [
    {
      key: '1',
      label: 'Approve'
    },
    {
      key: '2',
      label: 'Delete',
      danger: true
    },
  ];

  const handleClickAction = ({ key }) => {
    switch (key) {
      case '1':
        notify('success', 'Approve Boongan', ':P');
        break;
      case '2':
        deleteModal();
        break;
      default:
        console.warn('Unhandled action:', key);
    }
  };

  return (
    <Layout pageTitle="Delivery Order Details">
                <HeaderContent justify='between'>
                    <Button icon={<UnorderedListOutlined />} variant={'outlined'} onClick={() => {router.push(`/super-admin/${title}`);}}>
                        {isLargeScreen ? 'List' : ''}
                    </Button>
                    {data && (
                        <div className="flex justify-center items-center gap-2">
                            {/* <Button icon={<DeleteOutlined />} danger type={'primary'} onClick={deleteModal}>{isLargeScreen ? 'Delete' : ''}</Button> */}
                            <Button icon={<EditOutlined />} type={'primary'} onClick={handleEdit}>{isLargeScreen ? 'Edit' : ''}</Button>
                            {contextHolder}
                            <Dropdown menu={{ items, onClick: handleClickAction }} placement="bottomRight">
                                <Button icon={!isLargeScreen ? <MoreOutlined/> : null} >{isLargeScreen ? 'Action' : ''}</Button>
                            </Dropdown>
                        </div>
                    )}
                </HeaderContent>
                <BodyContent gap='12'>
                    {!isLoading ? (
                        <>
                            {data ? (
                                <div className='w-full h-full flex flex-col gap-8'>
                                    <div className='w-full flex flex-col px-4'>
                                        <p className='text-2xl font-semibold'>Sales Order</p>
                                        <div className='w-full flex lg:text-lg'>
                                            <p className='w-2/3 lg:w-1/2'>
                                                {data.createdfrom + ' / ' + data.customer}
                                            </p>
                                            <div className='w-1/3 lg:w-1/2 flex justify-end'>
                                            </div>
                                        </div>
                                    </div>
                                    <InputForm
                                        isReadOnly={true}
                                        type="general"
                                        payload={general}
                                        data={[
                                            { key: "id", input: "input", isAlias: false },
                                            { key: "salesorderid", input: "input", isAlias: false },
                                            { key: "refno", input: "input", isAlias: false },
                                            { key: "entity", input: "input", isAlias: false },
                                            { key: "createdfrom", input: "input", isAlias: false },
                                            { key: "shipstatus", input: "input", isAlias: false },
                                            { key: "trandate", input: "input", isAlias: false },
                                            { key: "memo", input: "input", isAlias: false },
                                            { key: "createdby", input: "input", isAlias: false },
                                            { key: "createddate", input: "input", isAlias: false },
                                            { key: "customer", input: "input", isAlias: false },
                                            { key: "dateso", input: "input", isAlias: false },
                                            { key: "numso", input: "input", isAlias: false }
                                          ]}
                                        aliases={customerAliases}
                                    />
                                    <div className='w-full flex flex-col gap-2'>
                                        <Divider
                                            style={{ margin: '0', textTransform: 'capitalize', borderColor: '#1677ff' }}
                                            orientation="left"
                                            >
                                            Item
                                        </Divider>
                                        <EditableTable
                                        data={item.fulfillment_items}
                                        onChange={(e) => {console.log(e)}}
                                        isReadOnly={true}
                                        />
                                    </div>
                                    <InputForm
                                        isReadOnly={true}
                                        type="shipping"
                                        payload={shipping}
                                        data={[
                                            { key: "shippingoption", input: "input", isAlias: false },
                                            { key: "shippingaddress", input: "input", isAlias: false }
                                        ]}
                                        aliases={customerAliases}
                                    />
                                </div>
                            ) : (
                                <EmptyCustom/>
                            )}
                        </>
                    ) : (
                        <LoadingSpin/>
                    )}
                </BodyContent>
        {contextNotify}
    </Layout>
  );
}
