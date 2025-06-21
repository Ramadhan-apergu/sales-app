export default function InvoicePrint({ data, dataTable }) {
  return (
    <div
      id="invoice-print"
      className="font-sans p-8 max-w-5xl mx-auto bg-white text-black"
    >
      <h1 className="text-2xl font-bold text-center mb-10">INVOICE</h1>

      <div className="flex justify-between mb-6 text-sm">
        <div className="w-1/4">
          <p>
            <strong>No. Invoice:</strong> {data?.tranid || "-"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {data?.status
              ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
              : "-"}
          </p>
          <p>
            <strong>Customer:</strong> {data?.customer || "-"}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {data?.trandate
              ? new Date(data.trandate).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </p>
        </div>
        <div className="w-1/4" />
        <div className="w-1/4" />
        <div className="w-1/4">
          <p>
            <strong>No. SO:</strong> {data?.so_numb || "-"}
          </p>
          <p>
            <strong>Sales:</strong> {data?.sales || "-"}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-10 mb-2">Shipping</h3>
      <div className="flex justify-between text-sm mb-6">
        <div className="w-1/2">
          <p>
            <strong>Shipping Address:</strong>
          </p>
          <p>{data?.shippingaddress || "-"}</p>
        </div>
        <div className="w-1/2">
          <p>
            <strong>Notes:</strong>
          </p>
          <p>{data?.memo?.trim() || "-"}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-10 mb-2">Billing</h3>
      <div className="flex justify-between text-sm mb-6">
        <div className="w-1/2">
          <p>
            <strong>Term:</strong>
          </p>
          <p>{data?.term || "-"}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-10 mb-2">Item</h3>
      {/* <table className="w-full border border-collapse text-sm flex flex-col">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-right">Display Name</th>
            <th className="border px-2 py-1 text-right">Item</th>
            <th className="border px-2 py-1 text-right">Qty 1</th>
            <th className="border px-2 py-1 text-right">Unit 1</th>
            <th className="border px-2 py-1 text-right">Qty 2</th>
            <th className="border px-2 py-1 text-right">Unit 2</th>
            <th className="border px-2 py-1 text-right">Rate</th>
            <th className="border px-2 py-1 text-right">Total Amount</th>
            <th className="border px-2 py-1 text-right">Total Discount</th>
            <th className="border px-2 py-1 text-right">
              Total Amount (After Discount)
            </th>
            <th className="border px-2 py-1 text-right">Tax Rate</th>
            <th className="border px-2 py-1 text-right">Tax Value</th>
            <th className="border px-2 py-1 text-right">Memo</th>
          </tr>
        </thead>
        <tbody>
          {dataTable?.length > 0 ? (
            dataTable.map((item) => (
              <tr key={item.id}>
                <td className="border px-2 py-1 text-right">
                  {item.displayname || "-"}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.item || "-"}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.quantity ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.units || "-"}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.quantity2 ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.units2 || "-"}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.rate?.toLocaleString("id-ID") ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.subtotal?.toLocaleString("id-ID") ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.totaldiscount?.toLocaleString("id-ID") ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.amount?.toLocaleString(
                    "id-ID"
                  ) ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.taxrate ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.taxvalue?.toLocaleString("id-ID") ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.memo || "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={13} className="border px-2 py-2 text-center">
                No items available
              </td>
            </tr>
          )}
        </tbody>
      </table> */}

      <div className="overflow-auto">
        {/* Header */}
        <div className="grid grid-cols-13 bg-gray-100 text-sm font-semibold border-t border-x">
          {[
            "Display Name",
            "Item",
            "Qty 1",
            "Unit 1",
            "Qty 2",
            "Unit 2",
            "Rate",
            "Total Amount",
            "Total Discount",
            "Total After Discount",
            "Tax Rate",
            "Tax Value",
            "Memo",
          ].map((header, idx) => (
            <div
              key={idx}
              className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden"
            >
              {header}
            </div>
          ))}
        </div>

        {/* Data Rows */}
        {dataTable?.length > 0 ? (
          dataTable.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-13 text-sm border-x border-b"
            >
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.displayname || "-"}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.item || "-"}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.quantity ?? 0}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.units || "-"}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.quantity2 ?? 0}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.units2 || "-"}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.rate?.toLocaleString("id-ID") ?? 0}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.subtotal?.toLocaleString("id-ID") ?? 0}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.totaldiscount?.toLocaleString("id-ID") ?? 0}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.amount?.toLocaleString("id-ID") ?? 0}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.taxrate ?? 0}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.taxvalue?.toLocaleString("id-ID") ?? 0}
              </div>
              <div className="border px-2 py-1 text-right whitespace-normal break-words overflow-hidden">
                {item.memo || "-"}
              </div>
            </div>
          ))
        ) : (
          <div className="border px-2 py-2 text-center text-sm">
            No items available
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mt-10 mb-2">Summary</h3>
      <div className="mt-10 text-sm max-w-sm ml-auto space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{(data?.subtotal ?? 0).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>{(data?.discounttotal ?? 0).toLocaleString("id-ID")}</span>
        </div>
        <hr />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{(data?.totalamount ?? 0).toLocaleString("id-ID")}</span>
        </div>
      </div>

      <p className="mt-10 text-xs text-gray-500">
        Generated on:{" "}
        {data?.createddate
          ? new Date(data.createddate).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-"}
      </p>
    </div>
  );
}
