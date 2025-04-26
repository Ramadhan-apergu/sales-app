'use client';

import React, {useState } from 'react';
import { Button } from 'antd';
import Layout from '@/components/superAdmin/Layout';
import {
    CheckOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import useNotification from '@/hooks/useNotification';
import { useRouter } from 'next/navigation';
import CustomerFetch from '@/modules/salesApi/customer';
import HeaderContent from '@/components/superAdmin/masterData/HeaderContent';
import BodyContent from '@/components/superAdmin/masterData/BodyContent';
import { customerAliases } from '@/utils/aliases';
import LoadingSpin from '@/components/superAdmin/LoadingSpin';
import InputForm from '@/components/superAdmin/masterData/InputForm';
import { createResponseHandler } from '@/utils/responseHandlers';
import LoadingSpinProcessing from '@/components/superAdmin/LoadingSpinProcessing';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function CustomerNew() {
  const { notify, contextHolder } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint('lg')

  const [payloadGeneral, setPayloadGeneral] = useState({
    "companyname": ""
  });

  const [payloadContact, setPayloadContact] = useState({
    "email": "",
    "phone": "",
    "altphone": "",
    "addressee": ""
  });

  const [payloadAddress, setPayloadAddress] = useState({
    "state": "",
    "city": "",
    "addr1": "",
    "zip": ""
  });

  const [payloadFinancial, setPayloadFinancial] = useState({
    "terms": "",
    "creditlimit": 0,
    "resalenumber": 0
  });

  const termOptions = [
        { label: 'Net 30', value: 'net30' },
        { label: 'Net 31', value: 'net31' },
        { label: 'Net 32', value: 'net32' },
    ]

    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChangePayload = (type, payload) => {
            switch (type) {
            case 'general':
              setPayloadGeneral(payload);
              break;
            case 'contact':
              setPayloadContact(payload);
              break;
            case 'address':
              setPayloadAddress(payload);
              break;
            default:
              setPayloadFinancial(payload);
              break;
          }
    }

      const handleSubmit = async () => {
        setIsLoadingSubmit(true);
        try {
          const payloadToInsert = {
            ...payloadGeneral,
            ...payloadContact,
            ...payloadAddress,
            ...payloadFinancial,
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
    
          const response = await CustomerFetch.add(payloadToInsert);
    
          const resData = createResponseHandler(response, notify);

          if (resData) {
            router.push(`/super-admin/master-data/customer/${resData}`)
          }

        } catch (error) {
          notify('error', 'Error', error.message || 'Internal server error');
        } finally {
          setIsLoadingSubmit(false);
        }
      };

  return (
    <>
            <Layout pageTitle="Add New Customer">
                <HeaderContent justify='between'>
                    <Button icon={<LeftOutlined />} onClick={() => router.back()}>
                    {isLargeScreen ? 'Back' : ''}
                    </Button>
                    <Button type={'primary'} icon={<CheckOutlined />} onClick={handleSubmit}>
                        {isLargeScreen ? 'Submit' : ''}
                    </Button>
                </HeaderContent>
                <BodyContent>
                    {!isLoading ? (
                        <div className='w-full h-full flex flex-col gap-8'>
                            <div className='w-full flex flex-col px-4'>
                                <p className='text-2xl font-semibold'>Customer</p>
                            </div>
                            <InputForm
                            type="general"
                            payload={payloadGeneral}
                            data={[
                                { key: 'companyname', input: 'input', isAlias: true },
                            ]}
                            onChange={handleChangePayload}
                            aliases={customerAliases}
                            />
                            <InputForm
                                type="contact"
                                payload={payloadContact}
                                data={[
                                    { key: 'email', input: 'input', isAlias: false },
                                    { key: 'phone', input: 'input', isAlias: false },
                                    { key: 'altphone', input: 'input', isAlias: true },
                                    { key: 'addressee', input: 'input', isAlias: true },
                                ]}
                                onChange={handleChangePayload}
                                aliases={customerAliases}
                            />
                            <InputForm
                                type="address"
                                payload={payloadAddress}
                                data={[
                                    { key: 'addr1', input: 'input', isAlias: true },
                                    { key: 'city', input: 'input', isAlias: false },
                                    { key: 'state', input: 'input', isAlias: false },
                                    { key: 'zip', input: 'input', isAlias: false },
                                ]}
                                onChange={handleChangePayload}
                                aliases={customerAliases}
                            />
                            <InputForm
                                type="financial"
                                payload={payloadFinancial}
                                data={[
                                    { key: 'terms', input: 'select', options: termOptions, isAlias: true },
                                    { key: 'creditlimit', input: 'number', isAlias: true },
                                    { key: 'resalenumber', input: 'number', isAlias: true },
                                ]}
                                onChange={handleChangePayload}
                                aliases={customerAliases}
                            />
                        </div>
                    ) : (
                        <LoadingSpin/>
                    )}
                    
                </BodyContent>
            </Layout>
            {isLoadingSubmit && (
                <LoadingSpinProcessing/>
            )}
        {contextHolder}
    </>
  );
}
