const { google } = require('googleapis');
const env = require('../config/env');

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Creates a calendar event with an auto-generated Google Meet link.
 * date: 'YYYY-MM-DD', startTime/endTime: 'HH:MM:SS'
 */
async function createMeetEvent({ summary, description, date, startTime, endTime, attendeeEmail }) {
  const startDateTime = `${date}T${startTime}`;
  const endDateTime = `${date}T${endTime}`;

  const response = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary,
      description,
      start: { dateTime: startDateTime, timeZone: env.ADMIN_TIMEZONE },
      end: { dateTime: endDateTime, timeZone: env.ADMIN_TIMEZONE },
      attendees: [{ email: attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const meetLink = response.data.hangoutLink;
  return { meetLink, eventId: response.data.id };
}

async function deleteMeetEvent(eventId) {
  try {
    await calendar.events.delete({ calendarId: 'primary', eventId, sendUpdates: 'all' });
  } catch (err) {
    console.error('Failed to delete calendar event:', err.message);
  }
}

module.exports = { createMeetEvent, deleteMeetEvent };