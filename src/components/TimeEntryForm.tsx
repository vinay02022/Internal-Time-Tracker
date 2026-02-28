import { useState, useRef } from 'react';
import { getTodayStr } from '../utils/date';
import type { TimeEntry } from '../types';
import './TimeEntryForm.css';

interface TimeEntryFormProps {
  projects: string[];
  entries: TimeEntry[];
  userEmail: string;
  onSubmit: (entry: Omit<TimeEntry, 'entryId' | 'timestamp'>) => Promise<void>;
}

function TimeEntryForm({
  projects,
  entries,
  userEmail,
  onSubmit,
}: TimeEntryFormProps) {
  const today = getTodayStr();
  const [date, setDate] = useState(today);
  const [project, setProject] = useState('');
  const [projectQuery, setProjectQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hours, setHours] = useState<0.5 | 1>(0.5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredProjects = projects.filter((p) =>
    p.toLowerCase().includes(projectQuery.toLowerCase())
  );

  const handleProjectInput = (value: string) => {
    setProjectQuery(value);
    setProject('');
    setShowSuggestions(true);
  };

  const selectProject = (p: string) => {
    setProject(p);
    setProjectQuery(p);
    setShowSuggestions(false);
  };

  const handleProjectBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const getDayTotal = (targetDate: string): number => {
    return entries
      .filter((e) => e.date === targetDate && e.email === userEmail)
      .reduce((sum, e) => sum + e.hours, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!project) {
      setError('Please select a project.');
      return;
    }

    if (!projects.includes(project)) {
      setError('Selected project is not in the master list.');
      return;
    }

    const dayTotal = getDayTotal(date);
    if (dayTotal + hours > 1) {
      const remaining = 1 - dayTotal;
      setError(
        remaining <= 0
          ? `You have already logged 1 day for ${date}.`
          : `You can only log ${remaining} more hours for ${date}. Total cannot exceed 1 day.`
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ date, email: userEmail, project, hours });
      setSuccess('Entry submitted successfully.');
      setProject('');
      setProjectQuery('');
      setHours(0.5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const dayTotal = getDayTotal(date);

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <h2>Log Time</h2>

      <div className="form-row">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="form-row project-field">
        <label htmlFor="project">Project</label>
        <input
          id="project"
          type="text"
          value={projectQuery}
          placeholder="Type to search projects..."
          autoComplete="off"
          onChange={(e) => handleProjectInput(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleProjectBlur}
        />
        {showSuggestions && projectQuery.length === 0 && (
          <div className="suggestions" ref={suggestionsRef}>
            {projects.map((p) => (
              <div
                key={p}
                className="suggestion-item"
                onMouseDown={() => selectProject(p)}
              >
                {p}
              </div>
            ))}
          </div>
        )}
        {showSuggestions && projectQuery.length > 0 && !project && (
          <div className="suggestions" ref={suggestionsRef}>
            {filteredProjects.length === 0 ? (
              <div className="suggestion-empty">No matching projects</div>
            ) : (
              filteredProjects.map((p) => (
                <div
                  key={p}
                  className="suggestion-item"
                  onMouseDown={() => selectProject(p)}
                >
                  {p}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="hours">Hours</label>
        <select
          id="hours"
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value) as 0.5 | 1)}
        >
          <option value={0.5}>0.5</option>
          <option value={1}>1</option>
        </select>
      </div>

      <div className="form-row">
        <span className="day-total">
          Logged for {date}: {dayTotal} / 1 day
        </span>
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Entry'}
      </button>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}
    </form>
  );
}

export default TimeEntryForm;
