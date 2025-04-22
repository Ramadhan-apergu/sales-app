export function formatDateToShort(dateString) {
    const date = new Date(dateString);
  
    const day = date.getDate().toString().padStart(2, '0');
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
  
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    const month = monthNames[monthIndex];
  
    return `${day} ${month} ${year}`;
  }
  