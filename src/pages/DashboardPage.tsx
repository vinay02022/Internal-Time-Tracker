import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchProjects, addTimeEntry, fetchUserEntries } from '../services/sheets';
import TimeEntryForm from '../components/TimeEntryForm';
import EntriesTable from '../components/EntriesTable';
import WeekSummary from '../components/WeekSummary';
import type { TimeEntry } from '../types';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<string[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setError('');
      const [projectList, userEntries] = await Promise.all([
        fetchProjects(),
        fetchUserEntries(user.email),
      ]);
      setProjects(projectList);
      setEntries(userEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (entry: Omit<TimeEntry, 'submittedAt'>) => {
    await addTimeEntry({
      ...entry,
      submittedAt: new Date().toISOString(),
    });
    await loadData();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard">
      <h1>Employee Dashboard</h1>
      {error && <p className="dashboard-error">{error}</p>}

      {user && (
        <>
          <TimeEntryForm
            projects={projects}
            entries={entries}
            userEmail={user.email}
            onSubmit={handleSubmit}
          />
          <WeekSummary entries={entries} />
          <EntriesTable entries={entries} />
        </>
      )}
    </div>
  );
}

export default DashboardPage;
