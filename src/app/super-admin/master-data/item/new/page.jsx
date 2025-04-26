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
import HeaderContent from '@/components/superAdmin/masterData/HeaderContent';
import BodyContent from '@/components/superAdmin/masterData/BodyContent';
import { itemAliases } from '@/utils/aliases';
import LoadingSpin from '@/components/superAdmin/LoadingSpin';
import InputForm from '@/components/superAdmin/masterData/InputForm';
import { createResponseHandler } from '@/utils/responseHandlers';
import LoadingSpinProcessing from '@/components/superAdmin/LoadingSpinProcessing';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import ItemFetch from '@/modules/salesApi/item';

export default function CustomerNew() {
    const title = 'item'
  const { notify, contextHolder } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint('lg')

  const [payloadGeneral, setPayloadGeneral] = useState({
    "itemid": "",
    "displayname": "",
    "itemprocessfamily": "",
    "unitstype": "",
  });

  const [payloadPricing, setPayloadPricing] = useState({
    "price": 0,
    "discount": 0,
  });

  const unitstypeOptions = [
        { label: 'KG', value: 'kg' },
        { label: 'Bal', value: 'bal' },
    ]

    const itemprocessfamilyOptions = [
        { label: 'Assoy Cetak', value: 'Assoy Cetak' },
        { label: 'K-Item', value: 'K-Item' },
        { label: 'Emboss', value: 'Emboss' },
        { label: 'C-Item', value: 'C-Item' },
        { label: 'B-Item', value: 'B-Item' },
        { label: 'HD 35B', value: 'HD 35B' },
        { label: 'PP', value: 'PP' },
        { label: 'HDP', value: 'HDP' },
        { label: 'Assoy PE', value: 'Assoy PE' },
        { label: 'PE Gulungan', value: 'PE Gulungan' },
    ]

    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChangePayload = (type, payload) => {
            switch (type) {
            case 'general':
              setPayloadGeneral(payload);
              break;
            default:
              setPayloadPricing(payload);
              break;
          }
    }

      const handleSubmit = async () => {
        setIsLoadingSubmit(true);
        try {
          const payloadToInsert = {
            ...payloadGeneral,
            ...payloadPricing,
          };

            const {itemid, displayname, itemprocessfamily, price, unitstype} = payloadToInsert
            if (!itemid) {
                notify('error', 'Failed', `${itemAliases['itemid']} is required`);
                return;
              }
              
              if (!displayname) {
                notify('error', 'Failed', `${itemAliases['displayname']} is required`);
                return;
              }
            
              if (!itemprocessfamily) {
                notify('error', 'Failed', `${itemAliases['itemprocessfamily']} is required`);
                return;
              }
            
              if (!price) {
                notify('error', 'Failed', `price is required`);
                return;
              }
            
              if (!unitstype) {
                notify('error', 'Failed', `${itemAliases['unitstype']}`);
                return;
              }
    
          const response = await ItemFetch.add(payloadToInsert);
    
          const resData = createResponseHandler(response, notify);

          if (resData) {
            router.push(`/super-admin/master-data/${title}/${resData}`)
          }

        } catch (error) {
          notify('error', 'Error', error.message || 'Internal server error');
        } finally {
          setIsLoadingSubmit(false);
        }
      };

  return (
    <>
            <Layout pageTitle={`Add ${title}`}>
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
                                <p className='text-2xl font-semibold capitalize'>{title}</p>
                            </div>
                            <InputForm
                            type="general"
                            payload={payloadGeneral}
                            data={[
                                { key: 'itemid', input: 'input', isAlias: true },
                                { key: 'displayname', input: 'input', isAlias: true },
                                { key: 'itemprocessfamily', input: 'select', options: itemprocessfamilyOptions, isAlias: true },
                                { key: 'unitstype', input: 'select', options:unitstypeOptions, isAlias: true },
                            ]}
                            onChange={handleChangePayload}
                            aliases={itemAliases}
                            />
                            <InputForm
                                type="pricing"
                                payload={payloadPricing}
                                data={[
                                    { key: 'price', input: 'number', isAlias: false },
                                    { key: 'discount', input: 'number', isAlias: false },
                                ]}
                                onChange={handleChangePayload}
                                aliases={itemAliases}
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
