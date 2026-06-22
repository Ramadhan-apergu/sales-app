"use client";

import { Select, Spin } from "antd";
import { useEffect, useState, useCallback, useRef } from "react";
import AgreementFetch from "@/modules/salesApi/agreement";
import { getResponseHandler } from "@/utils/responseHandlers";
import useNotification from "@/hooks/useNotification";
import debounce from "lodash.debounce";

export default function InputAgreement({
  onChange,
  value,
  showLabel = true,
  label = "Agreement",
  allowClear = true,
  placeholder = "Select an agreement",
  isRequired = false,
}) {
  const { notify } = useNotification();

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const limit = 50;
  const isFetchingRef = useRef(false);

  const fetchAgreements = async (pageNum = 1, keyword = "", append = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const response = await AgreementFetch.get(pageNum, limit, "", keyword);
      const resData = getResponseHandler(response, notify);

      if (resData) {
        const mapped = resData.list.map((data) => ({
          value: data.agreementcode,
          label: data.agreementname || data.agreementcode,
          id: data.id,
          data,
        }));

        setOptions((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore(mapped.length === limit);
      }
    } catch (err) {
      notify("error", "Error", err?.message || "Failed to fetch agreements");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchAgreements(1);
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isBottom && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAgreements(nextPage, searchTerm, true);
    }
  };

  const debouncedSearch = useCallback(
    debounce((word) => {
      setPage(1);
      fetchAgreements(1, word, false);
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
        filterOption={false}
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
