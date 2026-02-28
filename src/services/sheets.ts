import { getGoogleAccessToken } from './auth';
import type { TimeEntry } from '../types';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;

// Sheet tab names
const PROJECTS_RANGE = 'Projects!A:A';
const TIME_ENTRIES_SHEET = 'TimeEntries';
const TIME_ENTRIES_RANGE = `${TIME_ENTRIES_SHEET}!A:E`;

function getHeaders(): HeadersInit {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('No Google access token. Please sign in again.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Fetch all project names from the Projects sheet (column A).
 * Skips the header row.
 */
export async function fetchProjects(): Promise<string[]> {
  const url = `${BASE_URL}/values/${encodeURIComponent(PROJECTS_RANGE)}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to fetch projects');
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  // Skip header row, return flat list of project names
  return rows.slice(1).map((row) => row[0]).filter(Boolean);
}

/**
 * Append a time entry row to the TimeEntries sheet.
 * Columns: Date | Email | Project | Hours | SubmittedAt
 */
export async function addTimeEntry(entry: TimeEntry): Promise<void> {
  const url = `${BASE_URL}/values/${encodeURIComponent(TIME_ENTRIES_RANGE)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const body = {
    values: [
      [entry.date, entry.email, entry.project, entry.hours, entry.submittedAt],
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to add time entry');
  }
}

/**
 * Fetch all time entries for a specific user (by email).
 * Returns entries sorted by date descending.
 */
export async function fetchUserEntries(email: string): Promise<TimeEntry[]> {
  const url = `${BASE_URL}/values/${encodeURIComponent(TIME_ENTRIES_RANGE)}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to fetch entries');
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  // Skip header row, filter by email
  return rows
    .slice(1)
    .filter((row) => row[1] === email)
    .map((row) => ({
      date: row[0],
      email: row[1],
      project: row[2],
      hours: parseFloat(row[3]) as 0.5 | 1,
      submittedAt: row[4],
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Fetch all time entries (admin use).
 */
export async function fetchAllEntries(): Promise<TimeEntry[]> {
  const url = `${BASE_URL}/values/${encodeURIComponent(TIME_ENTRIES_RANGE)}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to fetch entries');
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows
    .slice(1)
    .map((row) => ({
      date: row[0],
      email: row[1],
      project: row[2],
      hours: parseFloat(row[3]) as 0.5 | 1,
      submittedAt: row[4],
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
