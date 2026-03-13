"use client";

import { Select, Spin } from "antd";
import { useEffect, useState, useCallback, useRef } from "react";
import CustomerFetch from "@/modules/salesApi/customer";
import {
  getByIdResponseHandler,
  getResponseHandler,
} from "@/utils/responseHandlers";
import useNotification from "@/hooks/useNotification";
import debounce from "lodash.debounce";

/**
 * Reusable component for filtering customers
 * - Lazy load with infinite scroll
 * - Debounced search
 */
export default function FilterCustomer({
  onChange,
  value,
  showLabel = true,
  allowClear = true,
  placeholder = "Select a customer",
  ...props
}) {
  const { notify } = useNotification();

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const limit = 50;
  const isFetchingRef = useRef(false);

  /**
   * Fetch customer list
   */
  const fetchCustomers = async (pageNum = 1, keyword = "", append = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);

      const response = await CustomerFetch.get(pageNum, limit, null, keyword);
      const resData = getResponseHandler(response, notify);

      if (resData) {
        const mapped = resData.list.map((data) => ({
          value: data.id, // primary key
          label: data.customerid || data.companyname,
          customerid: data.customerid,
          companyname: data.companyname,
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

  /**
   * Fetch customer by id
   */
  const fetchCustomerById = async (id) => {
    try {
      const response = await CustomerFetch.getById(id);
      const resData = getByIdResponseHandler(response, notify);

      if (resData) {
        const mapped = {
          value: resData.id,
          label: resData.customerid || resData.companyname,
          customerid: resData.customerid,
          companyname: resData.companyname,
        };

        setOptions((prev) => {
          const exists = prev.some((opt) => opt.value === mapped.value);
          if (exists) return prev;

          return [mapped, ...prev];
        });
      }
    } catch (err) {
      notify("error", "Error", err?.message || "Failed to fetch customer");
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    fetchCustomers(1);
  }, []);

  /**
   * Ensure selected value exists in options
   */
  useEffect(() => {
    if (!value) return;

    const exists = options.some((opt) => opt.value === value);

    if (!exists) {
      fetchCustomerById(value);
    }
  }, [value]);

  /**
   * Infinite scroll
   */
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    const isBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isBottom && hasMore && !isLoading) {
      const nextPage = page + 1;

      setPage(nextPage);

      fetchCustomers(nextPage, searchTerm, true);
    }
  };

  /**
   * Debounced search
   */
  const debouncedSearch = useCallback(
    debounce((word) => {
      setPage(1);
      fetchCustomers(1, word, false);
    }, 500),
    [],
  );

  const handleSearch = (val) => {
    setSearchTerm(val);
    debouncedSearch(val);
  };

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <label className="text-sm font-semibold leading-none">
          Customer ID
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
        filterOption={false}
        notFoundContent={isLoading ? <Spin size="small" /> : "No data"}
        loading={isLoading && options.length === 0}
        options={options}
        style={{ minWidth: 250 }}
        {...props}
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
