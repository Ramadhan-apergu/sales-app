"use client";

import {
  Button,
  ConfigProvider,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { EyeOutlined, InfoCircleOutlined } from "@ant-design/icons";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";

export default function InputForm({
  type,
  payload = {},
  data = [],
  onChange,
  isReadOnly = false,
  isLargeScreen = true,
  aliases = {},
  title = null,
  isSingleCol = false,
}) {
  const [form] = Form.useForm();
  const [visibleStates, setVisibleStates] = useState([]);

  useEffect(() => {
    dayjs.locale("id");
  }, []);

  // 🧠 Convert string date -> dayjs agar DatePicker bisa menampilkan nilai
  useEffect(() => {
    if (!payload || typeof payload !== "object") return;

    const convertedPayload = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => {
        const field = data.find((f) => f.key === key);
        if (
          (field?.input === "date" || field?.input === "datetime") &&
          typeof value === "string" &&
          dayjs(value).isValid()
        ) {
          return [key, dayjs(value)];
        }
        return [key, value];
      })
    );

    form.setFieldsValue(convertedPayload);
  }, [payload, data, form]);

  // 🧠 Pastikan hasil DatePicker tetap dalam waktu lokal tanpa geser 1 hari
  const handleValuesChange = (changedValues, allValues) => {
    const firstKey = Object.keys(changedValues)[0];

    const normalizedValues = Object.fromEntries(
      Object.entries(allValues).map(([key, value]) => {
        const field = data.find((f) => f.key === key);
        if (dayjs.isDayjs(value)) {
          const isDateTime = field?.input === "datetime";

          if (!isDateTime) {
            // Simpan tanggal tanpa geser timezone, jam di-set 00:00 lokal
            return [key, value.startOf("day").format("YYYY-MM-DDT00:00:00Z")];
          }

          // Untuk datetime, tetap simpan sesuai waktu lokal tanpa konversi UTC
          return [key, value.format("YYYY-MM-DDTHH:mm:ss")];
        }
        return [key, value];
      })
    );

    if (onChange) {
      onChange(type, normalizedValues, firstKey);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <Divider
        style={{
          margin: "0",
          textTransform: "capitalize",
          borderColor: "#1677ff",
        }}
        orientation="left"
      >
        {title ? title : type}
      </Divider>
      <ConfigProvider locale={idID}>
        <Form
          form={form}
          layout="vertical"
          className={`w-full grid grid-cols-1 ${
            isSingleCol ? "lg:grid-cols-1" : "lg:grid-cols-2"
          } px-4 gap-4`}
          onValuesChange={handleValuesChange}
        >
          {data.map(
            (
              {
                key,
                input,
                options = [],
                isAlias = false,
                labeled = null,
                props = {},
                rules = [],
                disabled = false,
                isRead = false,
                placeholder = undefined,
                hidden = false,
                cursorDisable = false,
                accounting = false,
                number = false,
                note = "",
              },
              i
            ) => {
              const label = labeled
                ? labeled
                : isAlias
                ? aliases[key] || key
                : key;

              let inputComponent;
              switch (input) {
                case "number":
                  inputComponent = (
                    <InputNumber
                      {...props}
                      style={{ width: "100%" }}
                      readOnly={isReadOnly || isRead}
                      disabled={disabled}
                      placeholder={placeholder}
                      formatter={(value) => {
                        if (accounting) {
                          if (!value) return "";
                          return `Rp ${String(value).replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            "."
                          )}`;
                        } else if (number) {
                          return `${value}`.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            "."
                          );
                        } else {
                          return value;
                        }
                      }}
                      parser={(value) => {
                        if (accounting) {
                          return value
                            ?.replace(/[Rp\s.]/g, "")
                            .replace(/[^\d]/g, "");
                        } else if (number) {
                          return `${value}`.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            "."
                          );
                        } else {
                          return value;
                        }
                      }}
                    />
                  );
                  break;
                case "select":
                  inputComponent = (
                    <Select
                      options={options}
                      {...props}
                      style={{ width: "100%" }}
                      readOnly={isReadOnly || isRead}
                      placeholder={placeholder}
                      disabled={cursorDisable}
                    />
                  );
                  break;
                case "date":
                  inputComponent = (
                    <DatePicker
                      {...props}
                      style={{ width: "100%" }}
                      format={props?.format || "DD-MM-YYYY"}
                      disabled={isReadOnly || disabled || isRead}
                      placeholder={placeholder}
                    />
                  );
                  break;
                case "datetime":
                  inputComponent = (
                    <DatePicker
                      {...props}
                      style={{ width: "100%" }}
                      showTime={{ format: "HH:mm" }}
                      format={props?.format || "DD-MM-YYYY HH:mm"}
                      disabled={isReadOnly || disabled || isRead}
                      placeholder={placeholder}
                    />
                  );
                  break;
                case "text":
                  inputComponent = (
                    <Input.TextArea
                      {...props}
                      readOnly={isReadOnly || isRead}
                      disabled={disabled}
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      placeholder={placeholder}
                      style={{
                        cursor: cursorDisable ? "not-allowed" : "default",
                      }}
                    />
                  );
                  break;
                case "password":
                  inputComponent = (
                    <div className="flex flex-1 items-center">
                      <Input
                        id={`${type}${i}`}
                        type={visibleStates[i] ? "text" : "password"}
                        {...props}
                        readOnly={isReadOnly || isRead}
                        disabled={disabled}
                        placeholder={placeholder}
                        style={{
                          cursor: cursorDisable ? "not-allowed" : "default",
                        }}
                      />
                      <Button
                        type="link"
                        icon={
                          <EyeOutlined
                            style={{
                              color: visibleStates[i] ? "#1677ff" : "#bfbfbf",
                            }}
                          />
                        }
                        onClick={() => {
                          const elPassword = document.getElementById(
                            `${type}${i}`
                          );
                          if (
                            elPassword &&
                            elPassword instanceof HTMLInputElement
                          ) {
                            elPassword.type =
                              elPassword.type === "password"
                                ? "text"
                                : "password";
                          }

                          setVisibleStates((prev) => {
                            const newStates = [...prev];
                            newStates[i] = !newStates[i];
                            return newStates;
                          });
                        }}
                      />
                    </div>
                  );
                  break;
                default:
                  inputComponent = (
                    <Input
                      {...props}
                      readOnly={isReadOnly || isRead}
                      disabled={disabled}
                      placeholder={placeholder}
                      style={{
                        cursor: cursorDisable ? "not-allowed" : "default",
                      }}
                    />
                  );
                  break;
              }

              return (
                <Form.Item
                  key={key}
                  label={
                    <div className="flex gap-1 items-center">
                      <span className="capitalize">{label}</span>
                      {note && (
                        <Tooltip title={note}>
                          <InfoCircleOutlined className="text-xs" />
                        </Tooltip>
                      )}
                    </div>
                  }
                  name={key}
                  rules={rules}
                  style={{ margin: 0, display: hidden ? "none" : "block" }}
                  className="w-full"
                  labelCol={{ style: { padding: 0 } }}
                >
                  {inputComponent}
                </Form.Item>
              );
            }
          )}
        </Form>
      </ConfigProvider>
    </div>
  );
}
