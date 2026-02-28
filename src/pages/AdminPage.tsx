import { useEffect, useState } from 'react';
import { fetchAllEntries } from '../services/sheets';
import { getLastNDays } from '../utils/date';
import type { TimeEntry } from '../types';
import './AdminPage.css';

interface EmployeeSummary {
  email: string;
  daysLogged: number;
  totalHours: number;
}

function AdminPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const all = await fetchAllEntries();
        setEntries(all);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  const last7Days = getLastNDays(7);

  // Get unique employees
  const employees = [...new Set(entries.map((e) => e.email))];

  // Build per-employee summary for last 7 days
  const summaries: EmployeeSummary[] = employees.map((email) => {
    const userEntries = entries.filter((e) => e.email === email);
    const last7Entries = userEntries.filter((e) => last7Days.includes(e.date));

    // Count days where total >= 1
    const daysLogged = last7Days.filter((date) => {
      const dayTotal = last7Entries
        .filter((e) => e.date === date)
        .reduce((sum, e) => sum + e.hours, 0);
      return dayTotal >= 1;
    }).length;

    const totalHours = last7Entries.reduce((sum, e) => sum + e.hours, 0);

    return { email, daysLogged, totalHours };
  });

  return (
    <div className="admin">
      <h1>Admin Dashboard</h1>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-section">
        <h2>Employee Summary (Last 7 Days)</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Days Complete (/ 7)</th>
              <th>Total Hours Logged</th>
            </tr>
          </thead>
          <tbody>
            {summaries.length === 0 ? (
              <tr>
                <td colSpan={3}>No entries found.</td>
              </tr>
            ) : (
              summaries.map((s) => (
                <tr key={s.email}>
                  <td>{s.email}</td>
                  <td>{s.daysLogged}</td>
                  <td>{s.totalHours}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-section">
        <h2>All Entries</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Project</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4}>No entries found.</td>
              </tr>
            ) : (
              entries.map((e, i) => (
                <tr key={`${e.date}-${e.email}-${i}`}>
                  <td>{e.date}</td>
                  <td>{e.email}</td>
                  <td>{e.project}</td>
                  <td>{e.hours}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
