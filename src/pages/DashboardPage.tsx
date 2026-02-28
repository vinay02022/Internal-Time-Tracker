import { useAuth } from '../hooks/useAuth';
import { fetchProjects, addTimeEntry, fetchUserEntries } from '../services/sheets';

function DashboardPage() {
  const { user } = useAuth();

  const testFetchProjects = async () => {
    try {
      const projects = await fetchProjects();
      console.log('Projects from Google Sheets:', projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const testAddEntry = async () => {
    if (!user) return;
    try {
      await addTimeEntry({
        date: new Date().toISOString().split('T')[0],
        email: user.email,
        project: 'Test Project',
        hours: 0.5,
        submittedAt: new Date().toISOString(),
      });
      console.log('Dummy time entry added successfully');
    } catch (err) {
      console.error('Failed to add entry:', err);
    }
  };

  const testFetchEntries = async () => {
    if (!user) return;
    try {
      const entries = await fetchUserEntries(user.email);
      console.log('User entries from Google Sheets:', entries);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    }
  };

  return (
    <div>
      <h1>Employee Dashboard</h1>
      <p>Logged in as: {user?.email}</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button onClick={testFetchProjects}>Test: Fetch Projects</button>
        <button onClick={testAddEntry}>Test: Add Dummy Entry</button>
        <button onClick={testFetchEntries}>Test: Fetch My Entries</button>
      </div>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Open browser console to see results. These test buttons will be removed
        once the time entry UI is built.
      </p>
    </div>
  );
}

export default DashboardPage;
