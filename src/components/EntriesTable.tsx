import type { TimeEntry } from '../types';
import './EntriesTable.css';

interface EntriesTableProps {
  entries: TimeEntry[];
}

function EntriesTable({ entries }: EntriesTableProps) {
  if (entries.length === 0) {
    return <p className="no-entries">No entries found.</p>;
  }

  return (
    <div className="entries-table-wrap">
      <h2>Past Entries</h2>
      <table className="entries-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Project</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={`${entry.date}-${entry.project}-${i}`}>
              <td>{entry.date}</td>
              <td>{entry.project}</td>
              <td>{entry.hours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EntriesTable;
