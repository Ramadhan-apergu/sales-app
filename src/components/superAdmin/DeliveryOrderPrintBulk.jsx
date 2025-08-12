import { formatDateStartDay } from "@/utils/formatDate";
import { useEffect, useState } from "react";

export default function DeliveryOrderPrintBulk({ datas }) {
  if (datas.length == 0) {
    return null;
  }

  console.log(datas)

  return (
    <div>
      {datas.map((data) => {
        const dataTable = data.fulfillment_items;

        const currentDate = new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        });

        // Hitung total langsung di variabel biasa
        const count = dataTable.reduce(
          (acc, item) => ({
            qty: acc.qty + (item.quantity || 0),
            qty2: acc.qty2 + (item.quantity2 || 0),
          }),
          { qty: 0, qty2: 0 }
        );

        return (
          <div
            className="w-full flex flex-col gap-8 print-do-bulk"
            style={{ pageBreakAfter: "always" }}
            key={data.id}
          >
            <section className="w-full flex flex-col items-end gap-8">
              <div className="w-full flex justify-between">
                <div className="flex flex-col items-start">
                  <h3 className="font-bold text-2xl tracking-wide">
                    CV. Sukses Mandiri
                  </h3>
                  <p>
                    Jl. Raya Medan – Lubuk Pakam Km 22,5 Medan – 20362,
                    Indonesia
                  </p>
                </div>
                <h3 className="font-bold text-2xl tracking-wide">
                  SURAT JALAN
                </h3>
              </div>
              <div className="w-full flex justify-between table-padding">
                <div className="w-1/2">
                  <div className="w-full flex">
                    <p className="w-3/12 break-words whitespace-normal font-semibold">
                      To :
                    </p>
                    <p className="w-8/12 border  break-words whitespace-normal">
                      {data.customer}
                    </p>
                  </div>
                  <div className="w-full flex">
                    <p className="w-3/12 break-words whitespace-normal font-semibold">
                      Address :
                    </p>
                    <p className="w-8/12 border-x border-b break-words whitespace-normal">
                      {data.shippingaddress}
                    </p>
                  </div>
                  <div className="w-full flex">
                    <p className="w-3/12 break-words whitespace-normal font-semibold">
                      Notes :
                    </p>
                    <p className="w-8/12 border-x border-b break-words whitespace-normal">
                      {data.notes}
                    </p>
                  </div>
                  <br />
                  <div className="w-full flex">
                    <p className="w-3/12 break-words whitespace-normal font-semibold">
                      Sales :
                    </p>
                    <p className="w-8/12 border break-words whitespace-normal">
                      {data.salesrep || ""}
                    </p>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="w-full flex justify-end">
                    <p className="w-2/12 break-words whitespace-normal font-semibold border-l border-y">
                      No. SJ
                    </p>
                    <p className="w-8/12 border  break-words whitespace-normal">
                      {data.tranid || "-"}
                    </p>
                  </div>
                  <div className="w-full flex justify-end">
                    <p className="w-2/12 break-words whitespace-normal font-semibold border-l border-b">
                      Tgl SJ
                    </p>
                    <p className="w-8/12 border-x border-b break-words whitespace-normal">
                      {formatDateStartDay(data.trandate) || "-"}
                    </p>
                  </div>
                  <div className="w-full flex justify-end">
                    <p className="w-2/12 break-words whitespace-normal font-semibold border-l border-b">
                      No. SO
                    </p>
                    <p className="w-8/12 border-x border-b break-words whitespace-normal">
                      {data.numso || "-"}
                    </p>
                  </div>
                  <div className="w-full flex justify-end">
                    <p className="w-2/12 break-words whitespace-normal font-semibold border-l border-b">
                      Tgl SO
                    </p>
                    <p className="w-8/12 border-x border-b break-words whitespace-normal">
                      {formatDateStartDay(data.dateso) || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="w-full">
              <div className="w-full flex border table-padding font-semibold">
                <p className="border-r break-words whitespace-normal w-[5%]">
                  No
                </p>
                <p className="border-r break-words whitespace-normal w-[25%]">
                  Kode
                </p>
                <p className="border-r break-words whitespace-normal w-[20%]">
                  Nama Barang
                </p>
                <p className="border-r break-words whitespace-normal w-[20%]">
                  Memo
                </p>
                <p className="border-r break-words whitespace-normal w-[15%] text-right">
                  Qty (Kq)
                </p>
                <p className="border-r break-words whitespace-normal w-[15%] text-right">
                  Qty (Bal)
                </p>
              </div>
              {dataTable &&
                dataTable.length > 0 &&
                dataTable.map((item, i) => (
                  <div
                    key={i}
                    className="w-full flex border-x border-b table-padding"
                  >
                    <p className="border-r break-words whitespace-normal w-[5%] text-right">
                      {i + 1}
                    </p>
                    <p className="border-r break-words whitespace-normal w-[25%]">
                      {item.itemid || "-"}
                    </p>
                    <p className="border-r break-words whitespace-normal w-[20%]">
                      {item.displayname || "-"}
                    </p>
                    <p className="border-r break-words whitespace-normal w-[20%]">
                      {item.memo || "-"}
                    </p>
                    <p className="border-r break-words whitespace-normal w-[15%] text-right">
                      {item.quantity || 0}
                    </p>
                    <p className="border-r break-words whitespace-normal w-[15%] text-right">
                      {item.quantity2 || 0}
                    </p>
                  </div>
                ))}
              <div className="w-full flex table-padding border-r border-white">
                <p className="break-words whitespace-normal w-[5%] text-right"></p>
                <p className="break-words whitespace-normal w-[25%]"></p>
                <p className="break-words whitespace-normal w-[20%]"></p>
                <p className="break-words whitespace-normal w-[20%]"></p>
                <p className="border-x border-b break-words whitespace-normal w-[15%] text-right">
                  {count.qty}
                </p>
                <p className="border-x border-b break-words whitespace-normal w-[15%] text-right">
                  {count.qty2}
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

              .print-do-bulk {
                page-break-after: always;
                break-after: page;
              }

              @media print {
                .print-do-bulk {
                  font-size: 0.8rem;
                }

                @page {
                  size: A4;
                }

                @media print and (max-width: 595px) {
                  .print-do-bulk {
                    font-size: 0.55rem;
                  }
                }

                @media print and (min-width: 595px) and (max-width: 842px) {
                  .print-do-bulk {
                    font-size: 0.675rem;
                  }
                }
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
}
