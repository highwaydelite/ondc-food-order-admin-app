export const formatDate = (dateString: string) => new Date(dateString).toLocaleString()

export const convertToIST = (utcTime: string): string => {
    const date = new Date(utcTime);
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      year: "numeric",
      month: "short", 
      day: "2-digit",
    };
  
    return date.toLocaleString("en-IN", options).replace(",", "");
  };
  