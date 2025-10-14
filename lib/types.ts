export interface CheckinBooking {
  "Book number": number;
  "Booked by": string;
  "Guest name(s)"?: string;
  "Check-in": string;
  "Check-out": string;
  "Booked on": string;
  "Status": string;
  "Rooms": number;
  "Persons": number;
  "Adults"?: number;
  "Children"?: number;
  "Price": string;
  "Commission %": number;
  "Commission amount": string;
  "Remarks"?: string;
  "Booker country": string;
  "Travel purpose"?: string;
  "Device": string;
  "Unit type": string;
  "Duration (nights)": number;
  "Phone number": number;
  "Address"?: string;
}
