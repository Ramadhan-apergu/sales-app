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
import { itemAliases } from '@/utils/aliases';
import InputForm from '@/components/superAdmin/InputForm';
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
            case 'primary':
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
    <Layout pageTitle="">
        <div className='w-full flex flex-col gap-4'>
            <div className='w-full flex justify-between items-center'>
                <p className='text-xl lg:text-2xl font-semibold text-blue-6'>Add New Item</p>
            </div>
                <div className='w-full flex flex-col gap-4'>
                    <div className='w-full flex flex-col lg:flex-row justify-between items-start'>
                            <div className='w-full lg:w-1/2 flex gap-1'>
                                <Button icon={<LeftOutlined />} onClick={() => router.back()}>
                                    {isLargeScreen ? 'Back' : ''}
                                </Button>
                            </div>
                            <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                                <Button type={'primary'} icon={<CheckOutlined />} onClick={handleSubmit}>
                                    {isLargeScreen ? 'Submit' : ''}
                                </Button>
                        </div>
                    </div>
                    <div className='w-full flex flex-col gap-8'>
                    <InputForm
                        type="primary"
                        payload={payloadGeneral}
                        data={[
                            {
                            key: 'itemid',
                            input: 'input',
                            isAlias: true,
                            rules: [
                                { required: true, message: `${itemAliases['itemid']} is required` },
                            ],
                            },
                            {
                            key: 'displayname',
                            input: 'input',
                            isAlias: true,
                            rules: [
                                { required: true, message: `${itemAliases['displayname']} is required` },
                            ],
                            },
                            {
                            key: 'itemprocessfamily',
                            input: 'select',
                            options: itemprocessfamilyOptions,
                            isAlias: true,
                            rules: [
                                { required: true, message: `${itemAliases['itemprocessfamily']} is required` },
                            ],
                            },
                            {
                            key: 'unitstype',
                            input: 'select',
                            options: unitstypeOptions,
                            isAlias: true,
                            rules: [
                                { required: true, message: `${itemAliases['unitstype']} is required` },
                            ],
                            },
                        ]}
                        aliases={itemAliases}
                        onChange={handleChangePayload}
                        />

                        <InputForm
                        type="pricing"
                        payload={payloadPricing}
                        data={[
                            {
                            key: 'price',
                            input: 'number',
                            isAlias: false,
                            rules: [
                                { required: true, message: `Price is required` },
                            ],
                            },
                            {
                            key: 'discount',
                            input: 'number',
                            isAlias: false,
                            rules: [], // Optional, tidak ada validasi required
                            },
                        ]}
                        aliases={itemAliases}
                        onChange={handleChangePayload}
                        />
                    </div>
                </div>
        </div>
    </Layout>
    {isLoadingSubmit && (
        <LoadingSpinProcessing/>
    )}
{contextHolder}
</>
    // <>
    //         <Layout pageTitle={`Add ${title}`}>
    //             <HeaderContent justify='between'>
    //                 <Button icon={<LeftOutlined />} onClick={() => router.back()}>
    //                 {isLargeScreen ? 'Back' : ''}
    //                 </Button>
    //                 <Button type={'primary'} icon={<CheckOutlined />} onClick={handleSubmit}>
    //                     {isLargeScreen ? 'Submit' : ''}
    //                 </Button>
    //             </HeaderContent>
    //             <BodyContent>
    //                 {!isLoading ? (
    //                     <div className='w-full h-full flex flex-col gap-8'>
    //                         <div className='w-full flex flex-col px-4'>
    //                             <p className='text-2xl font-semibold capitalize'>{title}</p>
    //                         </div>

    //                     </div>
    //                 ) : (
    //                     <LoadingSpin/>
    //                 )}
                    
    //             </BodyContent>
    //         </Layout>
    //         {isLoadingSubmit && (
    //             <LoadingSpinProcessing/>
    //         )}
    //     {contextHolder}
    // </>
  );
}
