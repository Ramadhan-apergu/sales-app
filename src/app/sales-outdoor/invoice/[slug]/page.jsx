// app/sales-outdoor/sales-order/[slug]/page.js
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/salesOutdoor/Layout';
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import InvoiceFetch from "@/modules/salesApi/invoice";
import { Button, Table, Spin, Empty, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

export default function InvoiceDetail() {
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format Rupiah (untuk UI saja)
  function formatRupiah(number) {
    return number?.toLocaleString("id-ID").replace(/,00$/, "") + ",00";
  }

  // Format Tanggal ke DD-MM-YYYY
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Format Angka: 5,020,000.00
  function formatNumberWithCommas(number) {
    const num = parseFloat(number) || 0;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Fungsi Print
  const handlePrint = (inv) => {
    if (!inv || !Array.isArray(inv.invoice_items)) {
      console.error("invoice_items tidak tersedia atau bukan array");
      return;
    }

    // Hitung total qty1 dan qty2
    const totalQty1 = inv.invoice_items
      .reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0)
      .toFixed(2);

    const totalQty2 = inv.invoice_items
      .reduce((sum, item) => sum + parseFloat(item.quantity2 || 0), 0)
      .toFixed(2);

    // Hitung total subtotal, diskon, total
    const subtotal = formatNumberWithCommas(inv.subtotal || 0);
    const discount = formatNumberWithCommas(inv.discounttotal || 0);
    const taxtotal = formatNumberWithCommas(inv.taxtotal || 0);
    const total = formatNumberWithCommas(inv.amount || 0);

    // Looping untuk Surat Jalan
    const suratJalanRows = inv.invoice_items
      .map((item, index) => `
        <tr>
          <td>${index + 1}.</td>
          <td>${item.item}</td>
          <td>${item.displayname}</td>
          <td style="text-align:right;">${formatNumberWithCommas(item.quantity)}</td>
          <td>${item.units}</td>
          <td style="text-align:right;">${formatNumberWithCommas(item.quantity2)}</td>
          <td>${item.units2}</td>
          <td>${item.memo || ""}</td>
        </tr>
      `).join("");

    const totalRowSJ = `
      <tr>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="text-align:right;">${formatNumberWithCommas(totalQty1)}</td>
        <td style="border: 0px;"></td>
        <td style="text-align:right;">${formatNumberWithCommas(totalQty2)}</td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
      </tr>
    `;

    // Looping untuk Faktur Jual
    const fakturJualRows = inv.invoice_items
      .map((item, index) => {
        const harga = formatNumberWithCommas(item.rate || 0);
        const diskon = formatNumberWithCommas(item.totaldiscount || 0);
        const jumlah = formatNumberWithCommas(item.amount || 0);

        return `
          <tr>
            <td>${index + 1}.</td>
            <td>${item.item}</td>
            <td>${item.displayname}</td>
            <td style="text-align:right;">${formatNumberWithCommas(item.quantity)}</td>
            <td>${item.units}</td>
            <td style="text-align:right;">${formatNumberWithCommas(item.quantity2)}</td>
            <td>${item.units2}</td>
            <td style="text-align:right;">${harga}</td>
            <td style="text-align:right;">${diskon}</td>
            <td>${item.memo || ""}</td>
            <td style="text-align:right;">${jumlah}</td>
          </tr>
        `;
      }).join("");

    // Template HTML
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Surat Jalan & Faktur Jual</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #777;
      font-family: Arial, sans-serif;
    }
    .page {
      background: white;
      width: 793px;
      height: 1122px;
      margin: 10px auto;
      padding: 40px;
      box-sizing: border-box;
      position: relative;
    }
    .header {
      text-align: right;
      margin-bottom: 6px;
    }
    .header h1 {
      font-size: 24px;
    }
    .flex-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start; 
      margin-bottom: 16px;
    }
    .info-table {
      border: 1px solid #000;
      border-collapse: collapse;
      font-size: 12px;
      table-layout: auto; 
      min-width: 200px;
    }
    .info-table td {
      border: 1px solid #000;
      padding: 8px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12px;
    }
    .table th, .table td {
      border: 1px solid #000;
      padding: 4px;
      vertical-align: center;
    }
    .table th {
      background: #f0f0f0;
      font-weight: bold;
    }
    .keterangan {
      border: 1px solid #000;
      padding: 6px;
      font-size: 12px;
      width: 25%;
    }
    .signature-container {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      font-size: 12px;
    }
    .signature-box {
      width: 15%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 70px;
      width: 100%;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <!-- SURAT JALAN -->
  <div class="page">
    <div class="header"><h1>SURAT JALAN</h1></div>
    <div class="flex-container">
      <div>
        <table class="info-table" style="margin-bottom: 10px;">
          <tr><td rowspan="2" style="white-space: nowrap; vertical-align: top;"><strong>To</strong></td><td>${inv?.customer}</td></tr>
          <tr><td>${inv?.billingaddress}</td></tr>
        </table>
        <table class="info-table">
          <tr><td style="width: 10%;"><strong>Sales</strong></td><td>${inv?.sales}</td></tr>
        </table>
      </div>
      <table class="info-table">
        <tr><td><strong>No. SJ</strong></td><td>${inv?.tranid}</td></tr>
        <tr><td><strong>Tgl SJ</strong></td><td>${formatDate(inv?.trandate)}</td></tr>
        <tr><td><strong>No. SO</strong></td><td>${inv?.so_numb}</td></tr>
        <tr><td><strong>Tgl SO</strong></td><td>${formatDate(inv?.so_trandate)}</td></tr>
      </table>
    </div>
    <table class="table">
      <tr>
        <th width="4%">No</th>
        <th width="15%">Kode</th>
        <th width="34%">Nama Barang</th>
        <th width="10%">Qty1</th>
        <th width="5%">Satuan1</th>
        <th width="10%">Qty2</th>
        <th width="5%">Satuan2</th>
        <th width="16%">Memo</th>
      </tr>
      ${suratJalanRows}
      ${totalRowSJ}
    </table>
    <div class="signature-container">
      <div class="signature-box">
        Dibuat oleh,<br>
        <div class="signature-line"></div>
      </div>
      <div class="signature-box">
        Disetujui oleh,<br>
        <div class="signature-line"></div>
      </div>
      <div class="signature-box">
        Dikirim oleh,<br>
        <div class="signature-line"></div>
      </div>
      <div class="signature-box">
        Diterima oleh,<br>
        <div class="signature-line"></div>
      </div>
      <div class="keterangan">
        Keterangan:<br>
        ${inv?.memo || ''}
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; font-size:12px; margin-top:10px;">
      [${formatDate(new Date())}]
    </div>
  </div>

  <!-- FAKTUR JUAL -->
  <div class="page page-break">
    <div class="header"><h1>FAKTUR JUAL</h1></div>
    <div class="flex-container">
      <div>
        <table class="info-table" style="margin-bottom: 10px;">
          <tr><td rowspan="2" style="white-space: nowrap; vertical-align: top;"><strong>To</strong></td><td>${inv?.customer}</td></tr>
          <tr><td>${inv?.billingaddress}</td></tr>
        </table>
        <table class="info-table">
          <tr><td style="width: 10%;"><strong>Sales</strong></td><td>${inv?.sales}</td></tr>
          <tr><td style="width: 10%;"><strong>Termin</strong></td><td>${inv?.term || "-"}</td></tr>
        </table>
      </div>
      <table class="info-table">
        <tr><td><strong>No. Faktur</strong></td><td>${inv?.tranid}</td></tr>
        <tr><td><strong>Tgl Faktur</strong></td><td>${formatDate(inv?.trandate)}</td></tr>
        <tr><td><strong>No. SO</strong></td><td>${inv?.so_numb}</td></tr>
        <tr><td><strong>Tgl SO</strong></td><td>${formatDate(inv?.so_trandate)}</td></tr>
      </table>
    </div>
    <table class="table">
      <tr>
        <th width="3%">No</th>
        <th width="11%">Kode</th>
        <th width="19%">Nama Barang</th>
        <th width="7%">Qty1</th>
        <th width="4%">Satuan1</th>
        <th width="7%">Qty2</th>
        <th width="4%">Satuan2</th>
        <th width="12%">Harga</th>
        <th width="9%">Diskon</th>
        <th width="12%">Memo</th>
        <th width="12%">Jumlah</th>
      </tr>
      ${fakturJualRows}
      <tr>
        <td colspan="3">Total</td>
        <td style="text-align:right;">${formatNumberWithCommas(totalQty1)}</td>
        <td>KG</td>
        <td style="text-align:right;">${formatNumberWithCommas(totalQty2)}</td>
        <td>BAL</td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td>Jumlah</td>
        <td style="text-align:right;">${subtotal}</td>
      </tr>
      <tr>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td>Diskon</td>
        <td style="text-align:right;">${discount}</td>
      </tr>
      <tr>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td style="border: 0px;"></td>
        <td>Total</td>
        <td style="text-align:right;">${total}</td>
      </tr>
    </table>
    <div class="signature-container">
      <div class="signature-box">
        Dibuat oleh,<br>
        <div class="signature-line"></div>
      </div>
      <div class="signature-box">
        Disetujui oleh,<br>
        <div class="signature-line"></div>
      </div>
      <div class="signature-box">
        Dikirim oleh,<br>
        <div class="signature-line"></div>
      </div>
      <div class="signature-box">
        Diterima oleh,<br>
        <div class="signature-line"></div>
      </div>
      <div class="keterangan">
        Keterangan:<br>
        ${inv?.memo || ''}
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; font-size:12px; margin-top:10px;">
      [${formatDate(new Date())}]
    </div>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
  };

  // Fetch Data
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!params.slug) return;
      setLoading(true);
      try {
        const response = await InvoiceFetch.getById(params.slug);
        if (response.status_code === 200) {
          setInvoice(response.data);
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

  // Tombol Kembali
  const handleBack = () => window.history.back();

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
        <FixedHeaderBar bgColor="bg-blue-6" />
        <div className="w-full relative p-4 mt-10">
          <div className="max-w-3xl mx-auto">
            {loading && !invoice && (
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
            {invoice && (
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <Button onClick={handleBack}>
                      ← Kembali
                    </Button>
                  </div>
                  <div>
                    <Button onClick={() => handlePrint(invoice)} icon={<PrinterOutlined />}>
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
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer:</span>
                        <span className="text-right">{invoice.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">SO Id:</span>
                        <span className="text-right">{invoice.salesorderid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fulfillment Id:</span>
                        <span className="text-right">{invoice.fulfillmentid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Entity:</span>
                        <span className="text-right">{invoice.entity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trandate:</span>
                        <span className="text-right">{new Date(invoice.trandate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Salesordernum:</span>
                        <span className="text-right">{invoice.salesordernum}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fulfillmentnum:</span>
                        <span className="text-right">{invoice.fulfillmentnum}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Memo:</span>
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
                      Shipping
                    </Divider>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping Address:</span>
                        <span className="text-right">{invoice.shippingaddress}</span>
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
                      <div className="flex justify-between">
                        <span className="text-gray-500">Term:</span>
                        <span className="text-right">{invoice.term}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Billing Address:</span>
                        <span className="text-right">{invoice.billingaddress}</span>
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
                      columns={[
                        { title: 'Display Name', dataIndex: 'displayname', key: 'displayname' },
                        { title: 'Item', dataIndex: 'item', key: 'item' },
                        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', align: 'right' },
                        { title: 'Units', dataIndex: 'units', key: 'units' },
                        { title: 'Quantity2', dataIndex: 'quantity2', key: 'quantity2', align: 'right' },
                        { title: 'Units2', dataIndex: 'units2', key: 'units2' },
                        { title: 'Rate', dataIndex: 'rate', key: 'rate', align: 'right' },
                        { title: 'Subtotal', dataIndex: 'subtotal', key: 'subtotal', align: 'right' },
                        { title: 'Discount', dataIndex: 'totaldiscount', key: 'totaldiscount', align: 'right' },
                        { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
                        { title: 'Tax Rate', dataIndex: 'taxrate', key: 'taxrate', align: 'right' },
                        { title: 'Tax Value', dataIndex: 'taxvalue', key: 'taxvalue', align: 'right' },
                        { title: 'Memo', dataIndex: 'memo', key: 'memo' },
                      ]}
                      dataSource={invoice.invoice_items}
                      pagination={false}
                      rowKey="id"
                      bordered
                      size="small"
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                </div>
                <div className="w-full p-4 border border-gray-5 gap-2 rounded-xl flex flex-col">
                  <div className="flex w-full">
                    <p className="w-1/2 text-sm">Subtotal</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(invoice.totalamount)}
                    </p>
                  </div>
                  <div className="flex w-full">
                    <p className="w-1/2 text-sm">Discount Item</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(invoice.discounttotal)}
                    </p>
                  </div>
                  <div className="flex w-full">
                    <p className="w-1/2 text-sm">Subtotal (After Discount)</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(invoice.subtotal)} Incl. PPN
                    </p>
                  </div>
                  <div className="flex w-full">
                    <p className="w-1/2 text-sm">Tax Total</p>
                    <p className="w-1/2 text-end text-sm text-right">
                      {formatRupiah(invoice.taxtotal)}
                    </p>
                  </div>
                  <hr className="border-gray-5" />
                  <div className="flex w-full font-semibold">
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
                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                <Empty description="Data invoice tidak ditemukan" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}