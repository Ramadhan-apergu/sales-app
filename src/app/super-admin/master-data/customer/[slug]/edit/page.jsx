'use client';

import React, {useEffect, useState } from 'react';
import { Button, Modal, Tag } from 'antd';
import Layout from '@/components/superAdmin/Layout';
import {
  CloseOutlined,
  SaveOutlined,
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
import { getByIdResponseHandler, updateResponseHandler } from '@/utils/responseHandlers';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatDateToShort } from '@/utils/formatDate';
import EmptyCustom from '@/components/superAdmin/masterData/EmptyCustom';
import LoadingSpinProcessing from '@/components/superAdmin/LoadingSpinProcessing';

export default function Detail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint('lg')
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
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
      "entityid","companyname","category"
    ],
    contact: [
      "addressee","phone","altphone","email"
    ],
    address: [
      "addr1","city","state","zip"
    ],
    financial: [
      "creditlimit","resalenumber","terms"
    ]
  }

      const handleSubmit = async () => {
        setIsLoadingSubmit(true);
        try {
          const payloadToInsert = {
            ...general,
            ...contact,
            ...address,
            ...financial,
          };

            const {companyname, email, phone, terms, creditlimit} = payloadToInsert
            if (!companyname) {
                notify('error', 'Failed', `${customerAliases['companyname']} is required`);
                return;
              }
              
              if (!email) {
                notify('error', 'Failed', `Email is required`);
                return;
              }
              const emailRegex = /^\S+@\S+\.\S+$/;
              if (!emailRegex.test(email)) {
                notify('error', 'Failed', 'Email format is invalid');
                return;
              }
            
              if (!phone) {
                notify('error', 'Failed', `Phone is required`);
                return;
              }
            
              if (!terms) {
                notify('error', 'Failed', `${customerAliases['terms']} is required`);
                return;
              }
            
              if (creditlimit < 0) {
                notify('error', 'Failed', `${customerAliases['creditlimit']} must be zero or positive`);
                return;
              }
    
          const response = await CustomerFetch.update(data.id, payloadToInsert);
    
          const resData = updateResponseHandler(response, notify);

          if (resData) {
            router.push(`/super-admin/master-data/customer/${resData}`)
          }

        } catch (error) {
          notify('error', 'Error', error.message || 'Internal server error');
        } finally {
          setIsLoadingSubmit(false);
        }
      };

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

  const handleChangePayload = (type, payload) => {
    switch (type) {
    case 'general':
      setGeneral(payload);
      break;
    case 'contact':
      setContact(payload);
      break;
    case 'address':
      setAddress(payload);
      break;
    default:
      setFinancial(payload);
      break;
  }
}

const termOptions = [
    { label: 'Net 30', value: 'net 30' },
    { label: 'Net 90', value: 'net 90' },
]

  return (
    <>    
        <Layout pageTitle="Edit Customer">
                    <HeaderContent justify='between'>
                        <div></div>
                        {data && (
                            <div className="flex justify-center items-center gap-2">
                                <Button icon={<CloseOutlined />} variant={'outlined'} onClick={() => {router.back()}}>{isLargeScreen ? 'Cancel' : ''}</Button>{contextHolder}
                                <Button icon={<SaveOutlined />} type={'primary'} onClick={handleSubmit}>{isLargeScreen ? 'Save' : ''}</Button>
                            </div>
                        )}
                    </HeaderContent>
                    <BodyContent gap='12'>
                        {!isLoading ? (
                            <>
                                {data ? (
                                    <div className='w-full h-full flex flex-col gap-8'>
                                        <div className='w-full flex flex-col px-4'>
                                            <p className='text-2xl font-semibold'>Customer</p>
                                            <div className='w-full flex lg:text-lg'>
                                                <p className='w-2/3 lg:w-1/2'>
                                                    {data.internalid + '-' + data.companyname}
                                                </p>
                                                <div className='w-1/3 lg:w-1/2 flex justify-end'>
                                                </div>
                                            </div>
                                        </div>
                                        <InputForm
                                            type="general"
                                            payload={general}
                                            data={[
                                                { key: 'entityid', input: 'input', isAlias: true },
                                                { key: 'companyname', input: 'input', isAlias: true },
                                                { key: 'category', input: 'input', isAlias: false },
                                            ]}
                                            aliases={customerAliases}
                                            onChange={handleChangePayload}
                                        />
                                        <InputForm
                                            type="contact"
                                            payload={contact}
                                            data={[
                                                { key: 'email', input: 'input', isAlias: false },
                                                { key: 'phone', input: 'input', isAlias: false },
                                                { key: 'altphone', input: 'input', isAlias: true },
                                                { key: 'addressee', input: 'input', isAlias: true },
                                            ]}
                                            aliases={customerAliases}
                                            onChange={handleChangePayload}
                                        />
                                        <InputForm
                                            type="address"
                                            payload={address}
                                            data={[
                                                { key: 'addr1', input: 'input', isAlias: true },
                                                { key: 'city', input: 'input', isAlias: false },
                                                { key: 'state', input: 'input', isAlias: false },
                                                { key: 'zip', input: 'input', isAlias: false },
                                            ]}
                                            aliases={customerAliases}
                                            onChange={handleChangePayload}
                                        />
                                        <InputForm
                                            type="financial"
                                            payload={financial}
                                            data={[
                                                { key: 'creditlimit', input: 'number', isAlias: true },
                                                { key: 'resalenumber', input: 'number', isAlias: true },
                                                { key: 'terms', input: 'select', options: termOptions, isAlias: true },
                                            ]}
                                            aliases={customerAliases}
                                            onChange={handleChangePayload}
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
        </Layout>
        {contextNotify}
        {isLoadingSubmit && (
            <LoadingSpinProcessing/>
        )}
    </>
  );
}
