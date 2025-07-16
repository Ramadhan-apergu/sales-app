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

export function formatCurrencyViralIndo(number) {
    if (number === null || number === undefined || isNaN(number)) {
        return '0';
    }
    
    const absNumber = Math.abs(number);
    let formattedNumber;

    if (absNumber >= 1000000000) {
        // Format untuk miliaran (B)
        formattedNumber = Math.round(absNumber / 1000000000) + 'B';
    } else if (absNumber >= 1000000) {
        // Format untuk jutaan (M)
        formattedNumber = Math.round(absNumber / 1000000) + 'M';
    } else if (absNumber >= 1000) {
        // Format untuk ribuan (k)
        formattedNumber = Math.round(absNumber / 1000) + 'k';
    } else {
        // Format biasa untuk angka di bawah 1000
        formattedNumber = Math.round(absNumber).toString();
    }

    // Tambahkan tanda negatif jika perlu
    return number < 0 ? `-${formattedNumber}` : formattedNumber;
}
