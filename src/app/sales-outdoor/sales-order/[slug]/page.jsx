// app/sales-outdoor/sales-order/[slug]/page.js
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/salesOutdoor/Layout';
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import SalesOrderFetch from '@/modules/salesApi/salesOrder';
import { Button, Table, Spin, Empty, Divider, Tooltip } from 'antd';

const formatRupiah = (value) => {
    const num = Number(value);
    if (isNaN(num)) return 'Rp 0,-';
    const numberCurrency = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);

    return numberCurrency + ",-";
};

export default function SalesOrderDetail() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const keyTableItem = [
    "displayname",
    "quantity",
    "units",
    "rate",
    "description",
    "discountname1",
    "value1",
    "discountvalue1",
    "perunit1",
    "discountname2",
    "value2",
    "discountvalue2",
    "perunit2",
    "discountname3",
    "value3",
    "discountvalue3",
    "perunit3",
    "subtotal",
    "totalamount",
    "totaldiscount",
    "qtyfree",
    "unitfree",
    "taxable",
    "taxrate",
    "taxvalue",
    "backordered",
  ];

  const itemColumns = keyTableItem.map((key) => {
    const isDisplayName = key === 'displayname';
    
    const column = {
      title: (isDisplayName ? 'Item Name' : key)
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase()),
      dataIndex: key,
      key,
      align: [
        'quantity',
        'rate',
        'value1',
        'discountvalue1',
        'perunit1',
        'value2',
        'discountvalue2',
        'perunit2',
        'value3',
        'discountvalue3',
        'perunit3',
        'subtotal',
        'totalamount',
        'totaldiscount',
        'qtyfree',
        'taxrate',
        'taxvalue',
        'backordered'
      ].includes(key) ? 'right' : 'left',
      onHeaderCell: () => ({
        className: 'text-sm text-center', 
        style: { textAlign: 'center' } 
      }),
      onCell: () => ({
        className: 'text-xs'
      }),
      render: (text) => {
        if (isDisplayName) {
          return (
            <Tooltip title={text}>
              <div className="truncate" style={{ 
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {text}
              </div>
            </Tooltip>
          );
        }
        
        const shouldFormat = [
          'rate',
          'value1',
          'discountvalue1',
          'value2',
          'discountvalue2',
          'value3',
          'discountvalue3',
          'subtotal',
          'totalamount',
          'totaldiscount',
          'taxvalue'
        ].includes(key);
        
        return shouldFormat ? formatRupiah(text) : text;
      }
    };

    // Hanya terapkan properti fixed dan width untuk kolom displayname
    if (isDisplayName) {
      column.fixed = 'left';
      column.width = 120;
      column.ellipsis = {
        showTitle: false // Nonaktifkan tooltip bawaan Antd
      };
    }

    return column;
  });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.slug) return;

      setLoading(true);
      try {
        const response = await SalesOrderFetch.getById(params.slug);
        if (response.status_code === 200) {
          setOrder(response.data);
        } else {
          setError(response.message || 'Gagal memuat detail order');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.slug]);

  const handleBack = () => {
    window.location.href = `/sales-outdoor/sales-order`;
  };

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
        <FixedHeaderBar bgColor="bg-blue-6" />

        <div className="w-full relative p-4 mt-10">
          <div className="max-w-3xl mx-auto">
            {loading && !order && (
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

            {order && (
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <Button onClick={handleBack} className="mb-2">← Kembali</Button>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-700 mb-2 text-center text-2xl">Sales Order Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{order.tranid} / {order.customer}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Fulfilled' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
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
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Customer ID:</span>
                        <span className="text-right">{order.customerid}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Customer Name:</span>
                        <span className="text-right">{order.customer}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Transaction Date:</span>
                        <span className="text-right">{new Date(order.trandate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Sales Rep:</span>
                        <span className="text-right">{order.salesrep}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Customer PO Number:</span>
                        <span className="text-right">{order.otherrefnum}</span>
                      </div>
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
                        Shipping
                    </Divider>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Shipping Address:</span>
                        <span className="text-right">{order.shippingaddress}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Notes:</span>
                        <span className="text-right">{order.notes}</span>
                      </div>
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
                        Billing
                    </Divider>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Term:</span>
                        <span className="text-right">
                          {order.term.toLowerCase().startsWith('net')
                            ? order.term
                            : `${order.term} Days`}
                        </span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Payment Option:</span>
                        <span className="text-right">{order.paymentoption}</span>
                      </div>
                    </div>
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
                    Item
                  </Divider>
                  <div className="overflow-x-auto">
                    <Table
                      columns={itemColumns}
                      dataSource={order.sales_order_items}
                      pagination={false}
                      rowKey="id"
                      bordered
                      size="small"
                      scroll={{ x: 'max-content' }}
                      tableLayout="auto" // Gunakan auto layout
                      className="sticky-table-container" // Tambahkan class untuk styling
                    />
                  </div>
                </div>

                <div className="w-full p-4 border border-gray-5 gap-2 rounded-xl flex flex-col">
                  <div className="flex w-full  border rounded-lg p-2 border-gray-300">
                    <p className="w-1/2 text-sm">Subtotal</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(order.subtotalbruto)}
                    </p>
                  </div>
                  <div className="flex w-full border rounded-lg p-2 border-gray-300">
                    <p className="w-1/2 text-sm">Discount Item</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(order.discounttotal)}
                    </p>
                  </div>
                  <hr className="" />
                  <div className="flex w-full font-semibold border rounded-lg p-2 border-gray-300">
                    <p className="w-1/2 text-sm">Total</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(order.total)} Incl.
                      PPN
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !order && (
              <div className="p-4">
                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                <Empty description="Data order tidak ditemukan" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tambahkan styling khusus untuk sticky header */}
      <style jsx global>{`
        .sticky-table-container .ant-table-thead > tr > th[colspan]:not([colspan="1"]) {
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .sticky-table-container .ant-table-cell-fix-left {
          z-index: 3 !important;
        }
      `}</style>
    </Layout>
  );
}