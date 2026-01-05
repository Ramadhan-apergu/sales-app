import { formatDateStartDay } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import { useEffect, useState } from "react";

export default function InvoicePrint({ data, dataTable }) {
  const [currentDate, setCurrentDate] = useState("");
  const [count, setCount] = useState({
    amount: 0,
    quantity: 0,
    quantity2: 0,
    dpp: 0,
    taxvalue: 0,
    totaldiscount: 0,
    subtotal: 0,
  });
  const [mergeDataTable, setMergeDataTable] = useState([]);

  useEffect(() => {
    const date = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
    setCurrentDate(date);

    // const mergedData = Object.values(
    //   dataTable.reduce((acc, curr) => {
    //     const key = curr.item;

    //     if (!acc[key]) {
    //       acc[key] = { ...curr };
    //     } else {
    //       // pastikan default 0
    //       acc[key].quantity = (acc[key].quantity || 0) + (curr.quantity || 0);
    //       acc[key].quantity2 =
    //         (acc[key].quantity2 || 0) + (curr.quantity2 || 0);

    //       // kalau curr.isfree === 1 → tambah 0
    //       const subtotalToAdd = curr.isfree ? 0 : curr.subtotal || 0;
    //       acc[key].subtotal = (acc[key].subtotal || 0) + subtotalToAdd;

    //       // gabungkan memo dengan koma, hindari koma dobel
    //       const existingMemo = acc[key].memo?.trim();
    //       const newMemo = curr.memo?.trim();
    //       if (newMemo) {
    //         acc[key].memo = existingMemo
    //           ? `${existingMemo}, ${newMemo}`
    //           : newMemo;
    //       }
    //     }

    //     return acc;
    //   }, {})
    // );

    setMergeDataTable(dataTable);

    const total = dataTable.reduce(
      (acc, item) => {
        const isFree = item.isfree == 1;

        return {
          amount: acc.amount + (isFree ? 0 : Number(item.amount) || 0),
          quantity: acc.quantity + (Number(item.quantity) || 0),
          quantity2: acc.quantity2 + (Number(item.quantity2) || 0),
          dpp: acc.dpp + (isFree ? 0 : Number(item.dpp) || 0),
          taxvalue: acc.taxvalue + (isFree ? 0 : Number(item.taxvalue) || 0),
          subtotal: acc.subtotal + (isFree ? 0 : Number(item.subtotal) || 0),
        };
      },
      {
        amount: 0,
        quantity: 0,
        quantity2: 0,
        dpp: 0,
        taxvalue: 0,
        subtotal: 0,
      }
    );

    // Hitung ulang subtotal dikurangi totaldiscount
    setCount({ ...total, totaldiscount: data?.discounttotal || 0 });
  }, [dataTable]);

  return (
    <div id="print-invoice" className="w-full flex flex-col gap-8">
      <section className="w-full flex flex-col items-end gap-8">
        <div className="w-full flex justify-between">
          <div className="flex flex-col items-start">
            <h3 className="font-bold text-2xl tracking-wide">
              CV. Sukses Mandiri
            </h3>
            <p>Jl. Raya Medan – Lubuk Pakam Km 22,5 Medan – 20362, Indonesia</p>
          </div>
          <h3 className="font-bold text-2xl tracking-wide">FAKTUR JUAL</h3>
        </div>
        <div className="w-full flex justify-between table-padding">
          <div className="w-1/2">
            <div className="w-full flex">
              <p className="w-3/12 font-semibold break-words whitespace-normal">
                Kepada :
              </p>
              <p className="w-8/12 border  break-words whitespace-normal">
                {data?.customer || "-"}
              </p>
            </div>
            <div className="w-full flex">
              <p className="w-3/12 font-semibold break-words whitespace-normal">
                Alamat :
              </p>
              <p className="w-8/12 border-x border-b break-words whitespace-normal">
                {data?.shippingaddress || "-"}
              </p>
            </div>
            <br />
            <div className="w-full flex">
              <p className="w-3/12 font-semibold break-words whitespace-normal">
                Sales :
              </p>
              <p className="w-8/12 border  break-words whitespace-normal">
                {data?.sales || "-"}
              </p>
            </div>
            <div className="w-full flex">
              <p className="w-3/12 font-semibold break-words whitespace-normal">
                Termin :
              </p>
              <p className="w-8/12 border-x border-b break-words whitespace-normal">
                {data?.term ? data.term + " Hari" || "- Hari" : "COD"}
              </p>
            </div>
          </div>
          <div className="w-1/2">
            <div className="w-full flex justify-end">
              <p className="w-3/12 font-semibold break-words whitespace-normal border-l border-y">
                No. Faktur
              </p>
              <p className="w-7/12 border  break-words whitespace-normal">
                {data?.tranid || "-"}
              </p>
            </div>
            <div className="w-full flex justify-end">
              <p className="w-3/12 font-semibold break-words whitespace-normal border-l border-b">
                Tgl Faktur
              </p>
              <p className="w-7/12 border-x border-b break-words whitespace-normal">
                {formatDateStartDay(data?.trandate) || "-"}
              </p>
            </div>
            <div className="w-full flex justify-end">
              <p className="w-3/12 font-semibold break-words whitespace-normal border-l border-b">
                No. SO
              </p>
              <p className="w-7/12 border-x border-b break-words whitespace-normal">
                {data?.so_numb || "-"}
              </p>
            </div>
            <div className="w-full flex justify-end">
              <p className="w-3/12 font-semibold break-words whitespace-normal border-l border-b">
                Tgl SO
              </p>
              <p className="w-7/12 border-x border-b break-words whitespace-normal">
                {formatDateStartDay(data?.so_trandate) || "-"}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="w-full flex border table-padding font-semibold">
          <p className="border-r break-words whitespace-normal w-[7%]">No</p>
          <p className="border-r break-words whitespace-normal w-[28%]">
            Nama Barang
          </p>
          <p className="border-r break-words whitespace-normal w-[10%] text-right">
            Qty
          </p>
          <p className="border-r break-words whitespace-normal w-[10%] text-right">
            Unit
          </p>
          <p className="border-r break-words whitespace-normal w-[14%] text-right">
            Harga
          </p>
          <p className="border-r break-words whitespace-normal w-[14%] text-right">
            Potongan
          </p>
          <p className="break-words whitespace-normal w-[17%] text-right">
            Jumlah
          </p>
        </div>

        {mergeDataTable &&
          mergeDataTable.length > 0 &&
          mergeDataTable.map((item, i) => (
            <div
              key={i}
              className="w-full flex border-x border-b table-padding"
            >
              <p className="border-r break-words whitespace-normal w-[7%] text-right">
                {i + 1}
              </p>
              <p className="border-r break-words whitespace-normal w-[28%]">
                {item.displayname || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[10%] text-right">
                {item.quantity || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[10%] text-right">
                {item.units || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[14%] text-right">
                {formatRupiah(item.rate) || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[14%] text-right">
                {formatRupiah(item.discountsatuan) || "-"}
              </p>
              <p className="break-words whitespace-normal w-[17%] text-right">
                {formatRupiah(item.subtotal) || "-"}
              </p>
            </div>
          ))}

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[7%] text-right"></p>
          <p className="break-words whitespace-normal w-[28%]"></p>
          <p className="border-b border-x break-words whitespace-normal w-[10%] text-right">
            {count.quantity}
          </p>
          <p className="break-words whitespace-normal w-[10%] text-right border-b">
            KG
          </p>
          <p className="break-words whitespace-normal w-[14%] text-right border-l"></p>
          <p className="border-r break-words whitespace-normal w-[14%] text-right">
            ADD DISC
          </p>
          <p className="break-words border-b whitespace-normal w-[17%] text-right">
            {formatRupiah(count.totaldiscount)}
          </p>
        </div>

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[7%] text-right"></p>
          <p className="break-words whitespace-normal w-[28%]"></p>
          <p className="break-words whitespace-normal w-[10%] text-right"></p>
          <p className="break-words whitespace-normal w-[10%] text-right"></p>

          <p className="break-words whitespace-normal w-[14%] text-right"></p>
          <p className="border-r break-words whitespace-normal w-[14%] text-right">
            DPP
          </p>
          <p className="break-words border-b whitespace-normal w-[17%] text-right">
            {formatRupiah(count.dpp)}
          </p>
        </div>

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[44%] border">
            Pembayaran Transfer Ke:
          </p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>

          <p className="break-words whitespace-normal w-[9%] text-right"></p>
          <p className="border-r break-words whitespace-normal w-[14%] text-right">
            PPN
          </p>
          <p className="break-words border-b whitespace-normal w-[17%] text-right">
            {formatRupiah(count.taxvalue)}
          </p>
        </div>

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[44%] border-x border-b">
            Bank BCA: 383-148-7788 a.n CV Sukses Mandiri
          </p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[9%] text-right"></p>
          <p className="border-r break-words whitespace-normal w-[14%] text-right">
            Total
          </p>
          <p className="break-words border-b whitespace-normal w-[17%] text-right">
            {formatRupiah(count.subtotal)}
          </p>
        </div>
      </section>

      <section className="w-full flex flex-col items-end gap-4">
        <div className="w-full flex gap-8">
          <div className="w-[75%] flex gap-8">
            <div className="w-1/4 h-20 flex flex-col justify-between items-center">
              <p>Dibuat oleh,</p>
              <hr className="w-full border-b" />
            </div>
            <div className="w-1/4 h-20 flex flex-col justify-between items-center">
              <p>Disetujui oleh,</p>
              <hr className="w-full border-b" />
            </div>
            <div className="w-1/4 h-20 flex flex-col justify-between items-center">
              <p>Dikirim oleh,</p>
              <hr className="w-full border-b" />
            </div>
            <div className="w-1/4 h-20 flex flex-col justify-between items-center">
              <p>Diterima oleh,</p>
              <hr className="w-full border-b" />
            </div>
          </div>
          <div className="w-[25%] border min-h-20 flex flex-col px-1">
            <p>
              Memo:
              <br />
              <span className="text-xs">{data?.memo}</span>
            </p>
          </div>
        </div>
        <p>{`[${currentDate}]`}</p>
      </section>
      <style jsx>{`
        .table-padding p {
          padding: 0 0.5rem;
        }

        @media print {
          #print-invoice {
            font-size: 1rem; /* Default */
          }

          /* A4: approx width ~ 595px to 842px */
          @page {
            size: A4;
          }

          @media print and (max-width: 595px) {
            #print-invoice {
              font-size: 0.65rem; /* text-xs */
            }
          }

          @media print and (min-width: 595px) and (max-width: 842px) {
            #print-invoice {
              font-size: 0.775rem; /* text-sm */
            }
          }
        }
      `}</style>
    </div>
  );
}
