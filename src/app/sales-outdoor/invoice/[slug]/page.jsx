"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/salesOutdoor/Layout";
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import InvoiceFetch from "@/modules/salesApi/invoice";
import { Button, Table, Spin, Empty, Divider } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { formatDateToShort } from "@/utils/formatDate";
import { invoiceAliases } from "@/utils/aliases";
import InvoicePrint from "@/components/salesOutdoor/InvoicePrint";

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => {
      if (
        [
          "rate",
          "subtotal",
          "totaldiscount",
          "amount",
          "dpp",
          "taxvalue",
        ].includes(key)
      ) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "right",
          render: (text, record) => <p>{formatRupiah(text)}</p>,
        };
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "right",
        };
      }
    }),
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="lineid"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

const formatRupiah = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "Rp 0,-";
  const numberCurrency = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return numberCurrency + ",-";
};

export default function InvoiceDetail() {
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataTableItem, setDataTableItem] = useState([]);

  const keyTableItem = [
    "displayname",
    "memo",
    "location",
    "quantity",
    "quantity2",
    "rate",
    "subtotal",
    "totaldiscount",
    "amount",
    "taxrate",
    "dpp",
    "taxvalue",
  ];

  const getTableData = () => {
    return dataTableItem.map(item => ({
      ...item,
      // Tambahkan field baru khusus untuk tampilan tabel
      quantity: `${item.quantity} ${item.units || ''}`,
      quantity2: item.quantity2 
        ? `${item.quantity2} ${item.units2 || ''}` 
        : null,
    }));
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!params.slug) return;
      setLoading(true);
      try {
        const response = await InvoiceFetch.getById(params.slug);
        if (response.status_code === 200) {
          setInvoice(response.data);
          let updatedInvoiceItems = await Promise.all(
            response.data.invoice_items.map(async (invoiceItem) => {
              return {
                ...invoiceItem,
                lineid: crypto.randomUUID(),
              };
            })
          );
          setDataTableItem(updatedInvoiceItems);
        } else {
          setError(response.message || 'Gagal memuat detail invoice');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [params.slug]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => window.history.back();

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
        {/* Wrap FixedHeaderBar with a div to apply no-print class */}
        <div className="no-print">
          <FixedHeaderBar bgColor="bg-blue-6" />
        </div>
        <div className="w-full relative p-4 mt-10">
          <div className="max-w-3xl mx-auto">
            {loading && !invoice && (
              <div className="flex justify-center items-center p-8">
                <Spin size="large" />
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 rounded-lg">
                <Button onClick={handleBack} className="mb-4 no-print">← Kembali</Button> {/* Added no-print */}
                <div className="text-red-600">{error}</div>
              </div>
            )}
            {invoice && (
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="flex justify-between mb-2 no-print"> {/* Add no-print to buttons */}
                  <div>
                    <Button onClick={handleBack}>
                      ← Kembali
                    </Button>
                  </div>
                  <div>
                    <Button onClick={() => handlePrint()} icon={<PrinterOutlined />}>
                      Printout
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="">
                    <h3 className="font-semibold text-gray-700 mb-2 text-center text-2xl">Invoice Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{invoice.tranid} / {invoice.customer}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === 'Fulfilled' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
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
                        <span className="text-gray-500">Customer:</span>
                        <span className="text-right">{invoice.customer}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Sales Rep:</span>
                        <span className="text-right">{invoice.sales}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-right">{formatDateToShort(invoice.trandate)}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="text-right">{formatDateToShort(invoice.duedate)}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">No. SO:</span>
                        <span className="text-right">{invoice.so_numb}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">No. DO:</span>
                        <span className="text-right">{invoice.tranid}</span>
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
                        <span className="text-right">{invoice.shippingaddress}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Notes:</span>
                        <span className="text-right">{invoice.memo}</span>
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
                        <span className="text-gray-500">Billing Address:</span>
                        <span className="text-right">{invoice.billingaddress}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Term:</span>
                        <span className="text-right">{invoice.term} Days</span>
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
                  <TableCustom
                    data={getTableData()}
                    keys={keyTableItem}
                    aliases={invoiceAliases.item}
                  />
                </div>
                <div className="w-full p-4 border border-gray-5 gap-2 rounded-xl flex flex-col">
                  <div className="flex w-full border rounded-lg p-2 border-gray-300">
                    <p className="w-1/2 text-sm">Subtotal</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(invoice.totalamount)}
                    </p>
                  </div>
                  <div className="flex w-full border rounded-lg p-2 border-gray-300">
                    <p className="w-1/2 text-sm">Discount Item</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(invoice.discounttotal)}
                    </p>
                  </div>
                  <hr className="" />
                  <div className="flex w-full font-semibold border rounded-lg p-2 border-gray-300">
                    <p className="w-1/2 text-sm">Total</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(invoice.amount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!loading && !invoice && (
              <div className="p-4">
                <Button onClick={handleBack} className="mb-4 no-print">← Kembali</Button> {/* Added no-print */}
                <Empty description="Data invoice tidak ditemukan" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="to-print-invoice hidden print:block">
        <InvoicePrint data={invoice} dataTable={dataTableItem} />
      </div>
      <style jsx>{`
        @media print {
          /* Hide the main content of the page, as we only want to print InvoicePrint */
          /* This targets the div that contains the invoice details for screen display */
          .w-full.relative.p-4.mt-10 {
            display: none !important;
          }

          .ant-dropdown {
            display: none !important;
          }

          .to-print-invoice {
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: white;
            z-index: 99999;
          }

          /* Removed the problematic * { display: none !important; } from here */
        }
      `}</style>
    </Layout>
  );
}
