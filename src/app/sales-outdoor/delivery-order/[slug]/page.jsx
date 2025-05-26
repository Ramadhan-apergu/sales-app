// app/sales-outdoor/sales-order/[slug]/page.js
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/salesOutdoor/Layout';
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import DeliveryOrderFetch from '@/modules/salesApi/deliveryOrder';
import { Button, Spin, Empty, Divider, } from 'antd';

export default function DeliveryOrderDetail() {
  const params = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch detail delivery
  useEffect(() => {
    const fetchDelivery = async () => {
      if (!params.slug) return;

      setLoading(true);
      try {
        const response = await DeliveryOrderFetch.getById(params.slug);
        if (response.status_code === 200) {
          setDelivery(response.data);
        } else {
          setError(response.message || 'Gagal memuat detail delivery order');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [params.slug]);

  // Fungsi untuk tombol kembali
  const handleBack = () => {
    window.history.back();
  };

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
        <FixedHeaderBar bgColor="bg-blue-6" />

        <div className="w-full relative p-4 mt-10">
          <div className="max-w-3xl mx-auto">
            {loading && !delivery && (
              <div className="flex justify-center items-center p-8">
                <Spin size="large" />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 rounded-lg">
                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                <div className="text-red-600">{error}</div>
              </div>
            )}

            {delivery && (
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <Button onClick={handleBack} className="mb-2">← Kembali</Button>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-700 mb-2 text-center text-2xl">Delivery Order Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{delivery.delivery_id} / {delivery.customer}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        delivery.delivery_status === 'Fulfilled' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {delivery.delivery_status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Divider
                        style={{
                        marginBottom: "8px",
                        textTransform: "capitalize",
                        borderColor: "#1677ff",
                        }}
                        orientation="left"
                    >
                        Primary
                    </Divider>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tranid:</span>
                        <span className="text-right">{delivery.delivery_numb}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trandate:</span>
                        <span className="text-right">{new Date(delivery.delivery_date).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer:</span>
                        <span className="text-right">{delivery.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery Status:</span>
                        <span className="text-right">{delivery.delivery_status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Display Name:</span>
                        <span className="text-right">{delivery.displayname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Itemid:</span>
                        <span className="text-right">{delivery.itemid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Qty:</span>
                        <span className="text-right">{delivery.qty_delivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Qty SO:</span>
                        <span className="text-right">{delivery.qty_so}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">SO Number:</span>
                        <span className="text-right">{delivery.so_numb}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">SO Date:</span>
                        <span className="text-right">{new Date(delivery.so_date).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">SO Status:</span>
                        <span className="text-right">{delivery.so_status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unit Delivery:</span>
                        <span className="text-right">{delivery.unit_delivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unit SO:</span>
                        <span className="text-right">{delivery.unit_so}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !delivery && (
              <div className="p-4">
                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                <Empty description="Data delivery order tidak ditemukan" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
