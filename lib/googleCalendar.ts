import { google } from "googleapis";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

const isConfigured = Boolean(CALENDAR_ID && SERVICE_ACCOUNT_KEY);

const getCalendarClient = () => {
  if (!isConfigured) return null;

  const credentials = JSON.parse(SERVICE_ACCOUNT_KEY!);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
};

type EventInput = {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail?: string | null;
};

export const createGoogleEvent = async (
  input: EventInput
): Promise<string | null> => {
  const calendar = getCalendarClient();
  if (!calendar) return null;

  const event = await calendar.events.insert({
    calendarId: CALENDAR_ID!,
    requestBody: {
      summary: input.title,
      description: input.description,
      start: { dateTime: input.startTime.toISOString() },
      end: { dateTime: input.endTime.toISOString() },
      ...(input.attendeeEmail
        ? { attendees: [{ email: input.attendeeEmail }] }
        : {}),
    },
  });

  return event.data.id ?? null;
};

export const updateGoogleEvent = async (
  googleEventId: string,
  input: EventInput
): Promise<void> => {
  const calendar = getCalendarClient();
  if (!calendar) return;

  await calendar.events.update({
    calendarId: CALENDAR_ID!,
    eventId: googleEventId,
    requestBody: {
      summary: input.title,
      description: input.description,
      start: { dateTime: input.startTime.toISOString() },
      end: { dateTime: input.endTime.toISOString() },
    },
  });
};

export const deleteGoogleEvent = async (
  googleEventId: string
): Promise<void> => {
  const calendar = getCalendarClient();
  if (!calendar) return;

  await calendar.events.delete({
    calendarId: CALENDAR_ID!,
    eventId: googleEventId,
  });
};

export const calendarConfigured = isConfigured;
