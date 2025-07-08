export const formatRupiahAccounting = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0";

  return num.toLocaleString("en-US");
};

export const formatRupiah = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0";
  const numberCurrency = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return numberCurrency + ",-";
};
