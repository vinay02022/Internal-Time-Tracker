import { getLastNDays } from '../utils/date';
import type { TimeEntry } from '../types';
import './WeekSummary.css';

interface WeekSummaryProps {
  entries: TimeEntry[];
}

function WeekSummary({ entries }: WeekSummaryProps) {
  const last7Days = getLastNDays(7);

  const daySummary = last7Days.map((date) => {
    const total = entries
      .filter((e) => e.date === date)
      .reduce((sum, e) => sum + e.hours, 0);
    return {
      date,
      total,
      status: total >= 1 ? 'Complete' : 'Incomplete',
    };
  });

  return (
    <div className="week-summary">
      <h2>Last 7 Days</h2>
      <table className="week-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Logged</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {daySummary.map((day) => (
            <tr key={day.date}>
              <td>{day.date}</td>
              <td>{day.total}</td>
              <td>
                <span
                  className={
                    day.status === 'Complete'
                      ? 'status-complete'
                      : 'status-incomplete'
                  }
                >
                  {day.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WeekSummary;
