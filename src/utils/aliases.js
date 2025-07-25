export const customerAliases = {
  customerid: "Customer ID",
  companyname: "Customer Name",
  state: "Province",
  salesid: "Sales Rep",
  salesrep: "Sales Rep",
  altphone: "Alt Phone",
  addressee: "Address EE",
  addr1: "Address",
  creditlimit: "Credit Limit",
  terms: "Term",
  resalenumber: "NPWP / NIK",
  internalid: "Internal ID",
  entityid: "Entity ID",
  createdby: "Created By",
  createddate: "Created Date",
  id: "ID",
  defaultaddress: "Default Address",
  overduebalance: "Overdue Balance",
};

export const itemAliases = {
  createdby: "Created By",
  createddate: "Created Date",
  id: "ID",
  displayname: "Display Name",
  itemprocessfamily: "Item Processing Family",
  saleunit: "Sale Unit",
  stockunit: "Stock Unit",
  unitstype: "Units Type",
  itemid: "Item ID",
};

export const agreementAliases = {
  id: "ID",
  agreementid: "Agreement ID",
  itemid: "Display Name/Code",
  baseprice: "Base Price",
  basepriceunit: "Base Price Unit",
  qtymin: "Qty Min",
  qtyminunit: "Qty Min Unit",
  qtymax: "Qty Max",
  qtymaxunit: "Qty Max Unit",
  discountnominal: "Discount Nominal",
  discountpercent: "Discount Percent",
  paymenttype: "Payment Type",
  qtyfree: "Qty Free",
  perunit: "Per Unit",
  displayname: "Item Name/Number",
  price: "Base Price",
  unitstype: "Unit",
  agreementcode: "Agreement Code",
  agreementname: "Agreement Name",
  createdby: "Created By",
  createddate: "Created Date",
  customform: "Custom Form",
  effectivedate: "Effective Date",
  enddate: "End Date",
};

export const salesOrderAliases = {
  customer: {
    customer: "Customer",
  },
  primary: {
    tranid: "No. SO",
    companyname: "Customer Name",
    entity: "Entity ID",
    trandate: "Date",
    salesrep: "Sales Rep",
    otherrefnum: "No. PO",
  },
  shipping: {
    shippingoption: "Shipping Option",
    shippingaddress: "Shipping Address",
  },
  billing: {
    term: "Term",
    paymentoption: "Payment Option",
  },
  item: {
    displayname: "Item",
    quantity: "Qty",
    units: "Unit",
    rate: "Rate",
    description: "Description",
    discountname1: "Discount 1",
    discountname2: "Discount 2",
    discountname3: "Discount 3",
    discountvalue1: "% / Rp",
    discountvalue2: "% / Rp",
    discountvalue3: "% / Rp",
    value1: "Discount Value 1",
    value2: "Discount Value 2",
    value3: "Discount Value 3",
    perunit1: "Per Unit 1",
    perunit2: "Per Unit 2",
    perunit3: "Per Unit 3",
    subtotal: "Total Amount (After Discount)",
    totalamount: "Total Amount",
    totaldiscount: "Total Discount",
    qtyfree: "Free Qty",
    taxable: "Taxable",
    taxrate: "Tax Rate",
    taxvalue: "Tax Value",
    unitfree: "Unit Free",
    backordered: "Back Ordered",
  },
};

export const deliveryOrderAliases = {
  primary: {
    tranid: "No. DO",
    customer: "Customer Name",
    createdfrom: "No. SO",
    trandate: "Date",
    shipstatus: "Status",
    memo: "Memo",
    salesorderid: "Sales Order ID",
    entity: "Customer ID",
  },
  item: {
    id: "ID",
    itemid: "Item",
    item: "Item",
    itemprocessfamily: "Item",
    displayname: "Display Name",
    memo: "Description",
    location: "Location",
    quantityremaining: "Remaining",
    quantity1: "Quantity (Kg)",
    unit1: "Units 1",
    quantity2: "Quantity (Bal)",
    unit2: "Units 2",
  },
  shipping: {
    shippingoption: "Shipping Option",
    shippingaddress: "Shipping Address",
  },
};

export const invoiceAliases = {
  primary: {
    customer: "Customer",
    salesorderid: "No. SO",
    fulfillmentid: "No. DO",
    entity: "Customer ID",
    trandate: "Date",
    salesordernum: "No. SO",
    fulfillmentnum: "No. DO",
    memo: "",
    duedate: "Due Date",
    sales: "Sales Rep",
    tranid: "No. INV",
  },
  item: {
    item: "Item",
    displayname: "Display Name",
    quantity: "Qty (Kg)",
    units: "Unit 1",
    quantity2: "Qty 2 (Bal)",
    units2: "Unit 2",
    rate: "Price",
    subtotal: "Total Amount",
    totaldiscount: "Total Discount",
    amount: "Total Amount (After Discount)",
    taxrate: "Tax Rate",
    taxvalue: "PPN",
    memo: "Memo",
    dpp: "DPP",
    location: "Location",
  },
  billing: {
    term: "Term",
    billingaddress: "Billing Address",
  },
  shipping: {
    shippingaddress: "Shipping Address",
    memo: "Notes",
  },
};

export const applyAgreementAliases = {
  customer: {
    customer: "Customer Name",
    customercode: "Customer Code",
  },
  agreement: {
    agreementcode: "Agreement Code",
    agreementname: "Agreement Name",
    effectivedate: "Effective Date",
    enddate: "End Date",
  },
};

export const deliveryStatusAliases = {
  customer: "Customer Name",
  so_numb: "SO No",
  so_date: "SO Date",
  displayname: "Display Name",
  itemid: "Item ID",
  qty_so: "SO Qty",
  so_status: "SO Status",
  unit_so: "SO Unit",
  delivery_numb: "DO No",
  delivery_date: "DO Date",
  delivery_status: "DO Status",
  unit_delivery: "DO Unit",
  back_ordered: "Back Ordered",
};

export const paymentAliases = {
  customer: {
    customer: "Customer Name",
  },
  primary: {
    customer: "Customer ID",
    trandate: "Date",
    memo: "Memo",
  },
  payment: {
    paymentoption: "Payment Method",
    payment: "Payment",
    invoiceid: "Invoice ID",
    refnum: "Invoice ID",
    applydate: "Date",
    total: "Total",
    due: "Amount Due",
    amount: "Payment",
    depositedate: "Deposite Date",
    bankaccount: "Bank Account",
  },
};

export const creditMemoAliases = {
  primary: {
    entity: "Customer ID",
    trandate: "Date",
    memo: "Memo",
  },
  item: {
    unapplied: "Unapplied",
    applied: "Applied",
    item: "Item ID",
    displayname: "Display Name",
    quantity: "Qty",
    units: "Unit",
    itemdescription: "Description",
    rate: "Rate",
    taxable: "Taxable",
    amount: "Total Amount",
    taxrate1: "Tax Rate",
    taxamount: "Tax Amount",
  },
  apply: {
    invoiceid: "Invoice ID",
    refnum: "Invoice ID",
    trandate: "Date",
    due: "Amount Due",
    amount: "Total Amount",
    payment: "Payment",
  },
};

export const stockAdjustmentAliases = {
  primary: {
    trandate: "Date",
    memo: "Memo",
  },
  adjustment: {
    itemid: "Item ID",
    displayname: "Display Name",
    onhand: "Onhand",
    stockreal: "Stock Real",
    qty: "Qty",
    units: "Unit",
    price: "Price",
  },
};

export const soReportAliases = {
  id: "ID",
  so_numb: "SO No",
  trandate: "Date",
  kode_customer: "Customer Code",
  nama_customer: "Customer Name",
  sales: "Sales Ref",
  kode_barang: "Item Code",
  nama_barang: "Display Name",
  qty_so: "SO Qty",
  qty_kirim: "DO Qty",
  qty_sisa: "Stock Qty",
  satuan: "Unit",
  tgl_kirim: "DO Date",
  harga_satuan: "Price @",
  diskon_satuan: "Discount @",
  jumlah: "Total",
};

export const salesReportAliases = {
  id: "ID",
  no_faktur: "Invoice No",
  trandate: "Date",
  kode_customer: "Customer Code",
  nama_customer: "Customer Name",
  sales: "Sales Ref",
  kode_barang: "Item Code",
  nama_barang: "Display Name",
  qty_faktur: "Invoice Qty",
  satuan: "Unit",
  harga: "Price",
  jumlah: "Total",
};

export const productReportAliases = {
  displayname: "Nama Barang",
  itemid: "Kode Barang",
  qty_belum: "Qty Belum",
  qty_sisa: "Qty Sisa",
  qty_stok: "Qty Stok",
  unit: "Satuan",
  no: "No",
};

export const userAliases = {
  username: "Username",
  name: "Name",
  email: "Email",
  address: "Address",
  roleid: "Role Name",
  password: "Password",
};

export const userAliasesEdit = {
  username: "Username",
  name: "Name",
  email: "Email",
  address: "Address",
  roleid: "Role Name",
  password: "New Password",
};
