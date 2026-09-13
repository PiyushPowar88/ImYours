export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Calcutta (GMT+5:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0/+1)' },
  { value: 'America/New_York', label: 'America/New York (GMT-5/-4)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (GMT-8/-7)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10/+11)' },
];

// Slots are stored/admin-configured in IST (Asia/Kolkata). This treats
// the stored date+time as an IST instant, then renders it in whatever
// timezone the visitor picks — actual booking data is untouched either way.
export function formatSlotTime(date, time, timezone) {
  const istInstant = new Date(`${date}T${time}+05:30`);
  return istInstant.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}