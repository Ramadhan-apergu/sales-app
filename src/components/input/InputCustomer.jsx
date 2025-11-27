"use client";

import { Select, Spin } from "antd";
import { useEffect, useState, useCallback, useRef } from "react";
import CustomerFetch from "@/modules/salesApi/customer";
import { getResponseHandler } from "@/utils/responseHandlers";
import useNotification from "@/hooks/useNotification";
import debounce from "lodash.debounce";

/**
 * Reusable component for filtering customers
 * - Lazy load with infinite scroll
 * - Debounced search
 * - Show required asterisk (without Antd Form.Item)
 */
export default function InputCustomer({
  onChange,
  value,
  showLabel = true,
  label = "Customer ID",
  allowClear = true,
  placeholder = "Select a customer",
  isRequired = false, // <-- tanda mandatory
}) {
  const { notify } = useNotification();

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const limit = 50;
  const isFetchingRef = useRef(false);

  const fetchCustomers = async (pageNum = 1, keyword = "", append = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const response = await CustomerFetch.get(pageNum, limit, null, keyword);
      const resData = getResponseHandler(response, notify);

      if (resData) {
        const mapped = resData.list.map((data) => ({
          value: data.customerid,
          label: data.customerid || data.companyname,
          companyname: data.companyname,
          id: data.id,
        }));

        setOptions((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore(mapped.length === limit);
      }
    } catch (err) {
      notify("error", "Error", err?.message || "Failed to fetch customers");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Initial load
  useEffect(() => {
    fetchCustomers(1);
  }, []);

  // Handle scroll to bottom for infinite load
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isBottom && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCustomers(nextPage, searchTerm, true);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((word) => {
      setPage(1);
      fetchCustomers(1, word, false);
    }, 500),
    []
  );

  const handleSearch = (val) => {
    setSearchTerm(val);
    debouncedSearch(val);
  };

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <label className="leading-none">
          {isRequired && <span className="text-red-500 mr-0.5">*</span>}
          {label}
        </label>
      )}

      <Select
        showSearch
        allowClear={allowClear}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onSearch={handleSearch}
        onPopupScroll={handleScroll}
        filterOption={false} // supaya tidak filter client-side
        notFoundContent={isLoading ? <Spin size="small" /> : "No data"}
        loading={isLoading && options.length === 0}
        options={options}
        style={{ minWidth: 250 }}
        popupRender={(menu) => (
          <>
            {menu}
            {isLoading && options.length > 0 && (
              <div className="text-center py-2 text-gray-500 text-sm">
                <Spin size="small" /> Loading more...
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}
