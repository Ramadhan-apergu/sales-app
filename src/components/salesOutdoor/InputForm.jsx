'use client';

import { DatePicker, Divider, Form, Input, InputNumber, Select, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

export default function InputForm({
  type,
  payload = {},
  data = [],
  onChange,
  isReadOnly = false,
  isLargeScreen = true,
  aliases = {},
  title = null,
  isSingleCol = false
}) {
  const [form] = Form.useForm();

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
          margin: '0',
          textTransform: 'capitalize',
          borderColor: '#1677ff',
        }}
        orientation="left"
      >
        {title ? title : type}
      </Divider>

      <Form
        form={form}
        layout="vertical"
        className={`w-full grid grid-cols-1 ${isSingleCol ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} px-4 gap-4`}
        onValuesChange={handleValuesChange}
      >
        {data.map(({ key, input, options = [], isAlias = false, props = {}, rules = [], disabled = false, isRead = false, placeholder = undefined, hidden = false,
          labeled = null, note = null, accounting = false }) => {
          const label = labeled ? labeled : isAlias ? aliases[key] || key : key;

          // Build label with tooltip if note is provided
          const labelContent = note ? (
            <span className="capitalize flex items-center gap-1">
              {label}
              <Tooltip title={note}>
                <InfoCircleOutlined style={{ color: '#1677ff', cursor: 'pointer' }} />
              </Tooltip>
            </span>
          ) : (
            <span className="capitalize">{label}</span>
          );

          let inputComponent;
          switch (input) {
            case 'number':
              inputComponent = (
                <InputNumber
                  {...props}
                  style={{ width: '100%' }}
                  readOnly={isReadOnly || isRead}
                  disabled={disabled}
                  placeholder={placeholder}
                  prefix={accounting ? "Rp" : undefined}
                  formatter={accounting ? (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : undefined}
                  parser={accounting ? (value) => value.replace(/Rp\s?|(,*)/g, '') : undefined}
                />
              );
              break;
            case 'select':
              inputComponent = (
                <Select options={options} {...props} style={{ width: '100%' }} readOnly={isReadOnly || isRead} placeholder={placeholder} />
              );
              break;
            case 'date':
              inputComponent = (
                <DatePicker
                  {...props}
                  style={{ width: '100%' }}
                  format={props?.format || 'YYYY-MM-DD'}
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
            case 'text':
              inputComponent = (
                <Input.TextArea
                  {...props}
                  readOnly={isReadOnly || isRead}
                  disabled={disabled}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  placeholder={placeholder}
                />
              );
              break;
            case 'input':
            default:
              inputComponent = (
                <Input {...props} readOnly={isReadOnly || isRead} disabled={disabled} placeholder={placeholder} />
              );
              break;
          }

          return (
            <Form.Item
              key={key}
              label={labelContent}
              name={key}
              rules={rules}
              style={{ margin: 0, display: hidden ? "none" : "block" }}
              className="w-full"
              labelCol={{ style: { padding: 0 } }}
            >
              {inputComponent}
            </Form.Item>
          );
        })}
      </Form>
    </div>
  );
}
