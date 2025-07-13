export function formatDateToShort(dateString) {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthNames[monthIndex];

  return `${day} ${month} ${year}`;
}

export function formatDateWithSepMinus(dateStr) {
  const [day, month, year] = dateStr.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

export function formatDateStartDay(isoString) {
  try {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ingat: getMonth() = 0-11
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Parsing date Error: ' + error.message)
    return ""
  }
}

