export default function convertToLocalDate(input) {
    const date = new Date(input); // format: Mon, 05 May 2025 17:00:00 GMT
    const options = {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
    
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
  
    return `${year}-${month}-${day}`;
}