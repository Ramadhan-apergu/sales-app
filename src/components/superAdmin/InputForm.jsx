"use client";

import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { EyeOutlined } from "@ant-design/icons";

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

  // Set initial form values when payload changes
  useEffect(() => {
    form.setFieldsValue(payload);
  }, [payload, form]);

  // Listen for form value changes using onValuesChange
  const handleValuesChange = (changedValues, allValues) => {
    if (onChange) {
      onChange(type, allValues); // Pass the whole form values to onChange
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
              props = {},
              rules = [],
              disabled = false,
              isRead = false,
              placeholder = undefined,
              hidden = false,
              cursorDisable = false,
              accounting = false,
            },
            i
          ) => {
            const label = isAlias ? aliases[key] || key : key;

            let inputComponent;
            switch (input) {
              case "number":
                inputComponent = (
                  <InputNumber
                    {...props}
                    style={{ width: "100%" }}
                    readOnly={isReadOnly}
                    disabled={disabled}
                    placeholder={placeholder}
                    formatter={(value) => {
                      if (accounting) {
                        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      } else {
                        return value;
                      }
                    }}
                    parser={(value) => {
                      if (accounting) {
                        return value.replace(/\$\s?|(,*)/g, "");
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
                  />
                );
                break;
              case "date":
                inputComponent = (
                  <DatePicker
                    {...props}
                    style={{ width: "100%" }}
                    format={props?.format || "YYYY-MM-DD"}
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
                            color: visibleStates[i] ? "#1677ff" : "#bfbfbf", // antd primary vs grey
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

                        // Update state untuk icon
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
                // initialValue={input === "select" ? payload[key] : undefined}
                label={<span className="capitalize">{label}</span>}
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
    </div>
  );
}
