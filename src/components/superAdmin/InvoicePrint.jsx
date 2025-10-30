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

  useEffect(() => {
    const date = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
    setCurrentDate(date);

    const total = dataTable.reduce(
      (acc, item) => ({
        amount: acc.amount + (item.amount || 0),
        quantity: acc.quantity + (item.quantity || 0),
        quantity2: acc.quantity2 + (item.quantity2 || 0),
        dpp: acc.dpp + (item.dpp || 0),
        taxvalue: acc.taxvalue + (item.taxvalue || 0),
        totaldiscount:
          acc.totaldiscount + (item.isfree ? item.subtotal || 0 : 0),
        subtotal: acc.subtotal + (item.subtotal || 0),
      }),
      {
        amount: 0,
        quantity: 0,
        quantity2: 0,
        dpp: 0,
        taxvalue: 0,
        totaldiscount: 0,
        subtotal: 0,
      }
    );

    setCount(total);
  }, [dataTable]);

  console.log(data);

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
                TO :
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
                {data?.billingaddress || "-"}
              </p>
            </div>
            <div className="w-full flex">
              <p className="w-3/12 font-semibold break-words whitespace-normal">
                Note :
              </p>
              <p className="w-8/12 border-x border-b break-words whitespace-normal">
                {data?.memo || "-"}
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
            <br />
            <div className="w-full flex justify-end">
              <p className="w-3/12 font-semibold break-words whitespace-normal border-y border-l">
                Info Pembayaran
              </p>
              <p className="w-7/12 border break-words whitespace-normal">
                BCA : 123-456-7890 a.n CV Sukses Mandiri <br />
                CIMB : 987-654-3210 a.n CV Sukses Mandiri
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="w-full flex border table-padding font-semibold">
          <p className="border-r break-words whitespace-normal w-[8%]">No</p>
          <p className="border-r break-words whitespace-normal w-[18%]">Kode</p>
          <p className="border-r break-words whitespace-normal w-[18%]">
            Nama Barang
          </p>
          <p className="border-r break-words whitespace-normal w-[8%] text-right">
            Qty
          </p>
          <p className="border-r break-words whitespace-normal w-[8%] text-right">
            Satuan
          </p>
          <p className="border-r break-words whitespace-normal w-[15%] text-right">
            Harga
          </p>
          <p className="border-r break-words whitespace-normal w-[10%] text-right">
            Diskon
          </p>
          <p className=" break-words whitespace-normal w-[15%] text-right">
            Jumlah
          </p>
        </div>
        {dataTable &&
          dataTable.length > 0 &&
          dataTable.map((item, i) => (
            <div
              key={i}
              className="w-full flex border-x border-b table-padding"
            >
              <p className="border-r break-words whitespace-normal w-[8%] text-right">
                {i + 1}
              </p>
              <p className="border-r break-words whitespace-normal w-[18%]">
                {item.itemid || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[18%]">
                {item.displayname || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[8%] text-right">
                {item.quantity || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[8%] text-right">
                {item.units || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[15%] text-right">
                {formatRupiah(item.rate) || "-"}
              </p>
              <p className="border-r break-words whitespace-normal w-[10%] text-right">
                {formatRupiah(item.discountsatuan) || "-"}
              </p>
              <p className=" break-words whitespace-normal w-[15%] text-right">
                {formatRupiah(item.subtotal) || "-"}
              </p>
            </div>
          ))}

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[18%]"></p>
          <p className="break-words whitespace-normal w-[18%]"></p>
          <p className="border-b border-x break-words whitespace-normal w-[8%] text-right">
            {count.quantity}
          </p>
          <p className="break-words whitespace-normal w-[8%] text-right border-b border-r">
            KG
          </p>
          <p className="break-words whitespace-normal w-[15%] text-right"></p>
          <p className="border-r break-words whitespace-normal w-[10%] text-right">
            Jumlah
          </p>
          <p className="break-words border-b whitespace-normal w-[15%] text-right">
            {formatRupiah(count.amount)}
          </p>
        </div>

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[18%]"></p>
          <p className="break-words whitespace-normal w-[18%]"></p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>

          <p className="break-words whitespace-normal w-[10%] text-right"></p>
          <p className="border-r break-words whitespace-normal w-[15%] text-right">
            Diskon
          </p>
          <p className="break-words border-b whitespace-normal w-[15%] text-right">
            {formatRupiah(count.totaldiscount)}
          </p>
        </div>

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[18%]"></p>
          <p className="break-words whitespace-normal w-[18%]"></p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>

          <p className="break-words whitespace-normal w-[10%] text-right"></p>
          <p className="border-r break-words whitespace-normal w-[15%] text-right">
            DPP
          </p>
          <p className="break-words border-b whitespace-normal w-[15%] text-right">
            {formatRupiah(count.totaldiscount)}
          </p>
        </div>

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[44%] border">
            Pembayaran Transfer Ke:
          </p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>

          <p className="break-words whitespace-normal w-[10%] text-right"></p>
          <p className="border-r break-words whitespace-normal w-[15%] text-right">
            PPN
          </p>
          <p className="break-words border-b whitespace-normal w-[15%] text-right">
            {formatRupiah(count.taxvalue)}
          </p>
        </div>

        <div className="w-full flex border-r table-padding">
          <p className="break-words whitespace-normal w-[44%] border-x border-b">
            Bank BCA: 383-148-7788 a.n CV Sukses Mandiri
          </p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[8%] text-right"></p>
          <p className="break-words whitespace-normal w-[10%] text-right"></p>
          <p className="border-r break-words whitespace-normal w-[15%] text-right">
            Total
          </p>
          <p className="break-words border-b whitespace-normal w-[15%] text-right">
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
          <div className="w-[25%] border h-20 flex flex-col px-1">
            <p>Keterangan:</p>
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
