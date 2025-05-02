'use client';

import React, {useEffect, useState } from 'react';
import { Button, Dropdown, Modal, Tag } from 'antd';
import Layout from '@/components/superAdmin/Layout';
import {
  EditOutlined,
  MoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import useNotification from '@/hooks/useNotification';
import { useParams, useRouter } from 'next/navigation';
import CustomerFetch from '@/modules/salesApi/customer';
import { customerAliases } from '@/utils/aliases';
import LoadingSpin from '@/components/superAdmin/LoadingSpin';
import InputForm from '@/components/superAdmin/InputForm';
import { deleteResponseHandler, getByIdResponseHandler } from '@/utils/responseHandlers';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatDateToShort } from '@/utils/formatDate';
import EmptyCustom from '@/components/superAdmin/EmptyCustom';

export default function Detail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint('lg')
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    async function fetchData() {
        try {
            setIsLoading(true)
            const response = await CustomerFetch.getById(slug)
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

  const title = 'customer'

  const fieldGroups = {
    general: [
      "id","internalid","entityid","companyname",
      "category","status","createdby","createddate"
    ],
    contact: [
      "addressee","phone","altphone","email"
    ],
    address: [
      "addr1","city","state","zip","defaultaddress"
    ],
    financial: [
      "creditlimit","overduebalance","currency",
      "resalenumber","terms"
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
  const [contact, setContact] = useState(
    Object.fromEntries(fieldGroups.contact.map(key => [key, '']))
  )
  const [address, setAddress] = useState(
    Object.fromEntries(fieldGroups.address.map(key => [key, '']))
  )
  const [financial, setFinancial] = useState(
    Object.fromEntries(fieldGroups.financial.map(key => [key, '']))
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
    setContact(pick(fieldGroups.contact))
    setAddress(pick(fieldGroups.address))
    setFinancial(pick(fieldGroups.financial))
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
    <Layout>
        <div className='w-full flex flex-col gap-4'>
            <div className='w-full flex justify-between items-center'>
                <p className='text-xl lg:text-2xl font-semibold text-blue-6'>Customer Details</p>
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
                                                        {data.internalid + ' / ' + data.companyname}
                                                    </p>
                                                    <div>
                                                        <Tag style={{textTransform: 'capitalize', fontSize: '16px'}} color={data.status =='active' ? 'green' : 'red'}>{data.status}</Tag>
                                                    </div>
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
                                                    { key: 'id', input: 'input', isAlias: true },
                                                    { key: 'internalid', input: 'input', isAlias: true },
                                                    { key: 'entityid', input: 'input', isAlias: true },
                                                    { key: 'companyname', input: 'input', isAlias: true },
                                                    { key: 'category', input: 'input', isAlias: false },
                                                    { key: 'createdby', input: 'input', isAlias: true },
                                                    { key: 'createddate', input: 'input', isAlias: true },
                                                ]}
                                                aliases={customerAliases}
                                            />
                                            <InputForm
                                                isReadOnly={true}
                                                type="contact"
                                                payload={contact}
                                                data={[
                                                    { key: 'email', input: 'input', isAlias: false },
                                                    { key: 'phone', input: 'input', isAlias: false },
                                                    { key: 'altphone', input: 'input', isAlias: true },
                                                    { key: 'addressee', input: 'input', isAlias: true },
                                                ]}
                                                aliases={customerAliases}
                                            />
                                            <InputForm
                                                isReadOnly={true}
                                                type="address"
                                                payload={address}
                                                data={[
                                                    { key: 'addr1', input: 'input', isAlias: true },
                                                    { key: 'city', input: 'input', isAlias: false },
                                                    { key: 'state', input: 'input', isAlias: false },
                                                    { key: 'zip', input: 'input', isAlias: false },
                                                    { key: 'defaultaddress', input: 'input', isAlias: true },
                                                ]}
                                                aliases={customerAliases}
                                            />
                                            <InputForm
                                                isReadOnly={true}
                                                type="financial"
                                                payload={financial}
                                                data={[
                                                    { key: 'creditlimit', input: 'input', isAlias: true },
                                                    { key: 'overduebalance', input: 'input', isAlias: true },
                                                    { key: 'currency', input: 'input', isAlias: false },
                                                    { key: 'resalenumber', input: 'input', isAlias: true },
                                                    { key: 'terms', input: 'input', isAlias: true },
                                                ]}
                                                aliases={customerAliases}
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
  );
}
