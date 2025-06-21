export default function DeliveryOrderPrint({ data, dataTable }) {
  return (
    <div
      id="delivery-order-print"
      className="font-sans p-8 max-w-5xl mx-auto bg-white text-black"
    >
      <h1 className="text-2xl font-bold text-center mb-10">DELIVERY ORDER</h1>

      <div className="flex justify-between mb-6 text-sm">
        <div className="w-1/4">
          <p>
            <strong>No. DO:</strong> {data?.tranid || "-"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {data?.shipstatus ? data.shipstatus.charAt(0).toUpperCase() + data.shipstatus.slice(1) : "-"}
          </p>
          <p>
            <strong>Customer:</strong> {data?.customer || "-"}
          </p>
        </div>
        <div className="w-1/4"/>
        <div className="w-1/4"/>
        <div className="w-1/4">
          <p>
            <strong>No. SO:</strong> {data?.createdfrom || "-"}
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
          <p>{data?.notes?.trim() || "-"}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-10 mb-2">Item</h3>
      <table className="w-full border border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">Item</th>
            <th className="border px-2 py-1 text-left">Display Name</th>
            <th className="border px-2 py-1 text-left">Description</th>
            <th className="border px-2 py-1 text-left">Location</th>
            <th className="border px-2 py-1 text-right">Remaining</th>
            <th className="border px-2 py-1 text-right">Qty (Kg)</th>
            <th className="border px-2 py-1 text-left">Unit 1</th>
            <th className="border px-2 py-1 text-right">Qty (Bal)</th>
            <th className="border px-2 py-1 text-left">Unit 2</th>
          </tr>
        </thead>
        <tbody>
          {dataTable?.length > 0 ? (
            dataTable.map((item) => (
              <tr key={item.item}>
                <td className="border px-2 py-1">{item.item || "-"}</td>
                <td className="border px-2 py-1">{item?.displayname || "-"}</td>
                <td className="border px-2 py-1">{item.memo || "-"}</td>
                <td className="border px-2 py-1">{item.location || "-"}</td>
                <td className="border px-2 py-1 text-right">
                  {item.quantityremaining ?? 0}
                </td>
                <td className="border px-2 py-1 text-right">
                  {item.quantity ?? 0}
                </td>
                <td className="border px-2 py-1">{item.unit1 || "-"}</td>
                <td className="border px-2 py-1 text-right">
                  {item.quantity2 ?? 0}
                </td>
                <td className="border px-2 py-1">{item.unit2 || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="border px-2 py-2 text-center">
                No items available
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
