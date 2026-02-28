import { useEffect, useState, useMemo } from 'react';
import { fetchAllEntries, fetchProjects } from '../services/sheets';
import { getLastNDays } from '../utils/date';
import type { TimeEntry } from '../types';
import './AdminPage.css';

type ViewTab = 'raw' | 'aggregated';

function AdminPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<ViewTab>('raw');

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterProject, setFilterProject] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [allEntries, projectList] = await Promise.all([
          fetchAllEntries(),
          fetchProjects(),
        ]);
        setEntries(allEntries);
        setProjects(projectList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const employees = useMemo(
    () => [...new Set(entries.map((e) => e.email))].sort(),
    [entries]
  );

  // Filtered entries used by both views
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (filterEmployee && e.email !== filterEmployee) return false;
      if (filterProject && e.project !== filterProject) return false;
      return true;
    });
  }, [entries, dateFrom, dateTo, filterEmployee, filterProject]);

  // Aggregation: total days per employee
  const perEmployee = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filtered) {
      map.set(e.email, (map.get(e.email) || 0) + e.hours);
    }
    return [...map.entries()]
      .map(([email, totalDays]) => ({ email, totalDays }))
      .sort((a, b) => a.email.localeCompare(b.email));
  }, [filtered]);

  // Aggregation: total days per project
  const perProject = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filtered) {
      map.set(e.project, (map.get(e.project) || 0) + e.hours);
    }
    return [...map.entries()]
      .map(([project, totalDays]) => ({ project, totalDays }))
      .sort((a, b) => a.project.localeCompare(b.project));
  }, [filtered]);

  // 7-day employee summary (unfiltered, always shows last 7 days)
  const last7Days = getLastNDays(7);
  const weekSummaries = useMemo(() => {
    return employees.map((email) => {
      const userEntries = entries.filter(
        (e) => e.email === email && last7Days.includes(e.date)
      );
      const daysLogged = last7Days.filter((date) => {
        const dayTotal = userEntries
          .filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.hours, 0);
        return dayTotal >= 1;
      }).length;
      const totalHours = userEntries.reduce((sum, e) => sum + e.hours, 0);
      return { email, daysLogged, totalHours };
    });
  }, [entries, employees, last7Days]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilterEmployee('');
    setFilterProject('');
  };

  const hasFilters = dateFrom || dateTo || filterEmployee || filterProject;

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin">
      <h1>Admin Dashboard</h1>
      {error && <p className="admin-error">{error}</p>}

      {/* 7-day summary — always visible */}
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
            {weekSummaries.length === 0 ? (
              <tr><td colSpan={3}>No entries found.</td></tr>
            ) : (
              weekSummaries.map((s) => (
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

      {/* Filters */}
      <div className="admin-filters">
        <h2>Filters</h2>
        <div className="filter-row">
          <div className="filter-field">
            <label htmlFor="dateFrom">From</label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="dateTo">To</label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="filterEmployee">Employee</label>
            <select
              id="filterEmployee"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">All</option>
              {employees.map((em) => (
                <option key={em} value={em}>{em}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="filterProject">Project</label>
            <select
              id="filterProject"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">All</option>
              {projects.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button className="clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'raw' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('raw')}
        >
          Raw Entries ({filtered.length})
        </button>
        <button
          className={activeTab === 'aggregated' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('aggregated')}
        >
          Aggregated
        </button>
      </div>

      {/* Raw Entries View */}
      {activeTab === 'raw' && (
        <div className="admin-section">
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
              {filtered.length === 0 ? (
                <tr><td colSpan={4}>No entries match the current filters.</td></tr>
              ) : (
                filtered.map((e, i) => (
                  <tr key={`${e.date}-${e.email}-${e.project}-${i}`}>
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
      )}

      {/* Aggregated View */}
      {activeTab === 'aggregated' && (
        <>
          <div className="admin-section">
            <h2>Total Days per Employee</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Total Days</th>
                </tr>
              </thead>
              <tbody>
                {perEmployee.length === 0 ? (
                  <tr><td colSpan={2}>No entries match the current filters.</td></tr>
                ) : (
                  perEmployee.map((r) => (
                    <tr key={r.email}>
                      <td>{r.email}</td>
                      <td>{r.totalDays}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-section">
            <h2>Total Days per Project</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Total Days</th>
                </tr>
              </thead>
              <tbody>
                {perProject.length === 0 ? (
                  <tr><td colSpan={2}>No entries match the current filters.</td></tr>
                ) : (
                  perProject.map((r) => (
                    <tr key={r.project}>
                      <td>{r.project}</td>
                      <td>{r.totalDays}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminPage;
