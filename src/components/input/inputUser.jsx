"use client";

import { Select, Spin } from "antd";
import { useEffect, useState, useCallback, useRef } from "react";
import userManagement from "@/modules/salesApi/userManagement";
import { getResponseHandler } from "@/utils/responseHandlers";
import useNotification from "@/hooks/useNotification";
import debounce from "lodash.debounce";

export default function InputUser({
  onChange,
  value,
  showLabel = true,
  label = "User",
  allowClear = true,
  placeholder = "Select user",
  isRequired = false,
}) {
  const { notify } = useNotification();

  const [options, setOptions] = useState([]);
  const [roles, setRoles] = useState([{ label: "All", value: "" }]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const limit = 50;
  const isFetchingRef = useRef(false);

  // 🔹 fetch users
  const fetchUsers = async (
    offsetVal = 0,
    keyword = "",
    role = "",
    append = false,
  ) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const response = await userManagement.get(
        offsetVal,
        limit,
        "",
        role,
        keyword,
      );
      const resData = getResponseHandler(response, notify);

      if (resData) {
        const mapped = resData.list.map((user) => ({
          value: user.id,
          label: `${user.username} (${user.name})`,
          role: user.role_name,
        }));

        setOptions((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore(mapped.length === limit);
      }
    } catch (err) {
      notify("error", "Error", err?.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // 🔹 fetch roles
  const fetchRoles = async () => {
    const response = await userManagement.getRoles();
    const resData = getResponseHandler(response, notify);
    console.log(resData);
    if (resData && resData.list) {
      const mapped = resData.list.map((r) => ({
        label: r.name,
        value: r.name,
      }));

      setRoles([{ label: "All", value: "" }, ...mapped]);
    }
  };

  // initial load
  useEffect(() => {
    fetchUsers(0);
    fetchRoles();
  }, []);

  // infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      hasMore &&
      !isLoading
    ) {
      const nextOffset = offset + limit;
      setOffset(nextOffset);
      fetchUsers(nextOffset, searchTerm, selectedRole, true);
    }
  };

  // debounced search
  const debouncedSearch = useCallback(
    debounce((word) => {
      setOffset(0);
      fetchUsers(0, word, selectedRole, false);
    }, 500),
    [selectedRole],
  );

  const handleSearch = (val) => {
    setSearchTerm(val);
    debouncedSearch(val);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setOffset(0);
    fetchUsers(0, searchTerm, role, false);
    onChange?.("", {});
  };

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <label className="leading-none">
          {isRequired && <span className="text-red-500 mr-0.5">*</span>}
          {label}
        </label>
      )}

      <div className="flex gap-2">
        {/* Role Filter */}
        <Select
          value={selectedRole}
          onChange={handleRoleChange}
          options={roles}
          style={{ width: "30%" }}
        />

        {/* User Select */}
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
          style={{ width: "70%", flex: 1 }}
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
    </div>
  );
}
