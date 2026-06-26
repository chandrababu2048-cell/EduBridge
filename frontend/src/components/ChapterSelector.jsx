import { getChapters, chapterLabel } from '../data/ncert.js';

const NCERT_SUBJECTS = ['Math', 'Science', 'English'];

export default function ChapterSelector({ subject, grade, chapter, setChapter }) {
  if (!NCERT_SUBJECTS.includes(subject)) return null;

  const chapters = getChapters(subject, grade);
  if (chapters.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2.5"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          NCERT Chapter
        </p>
        {chapter !== null && (
          <button
            onClick={() => setChapter(null)}
            className="text-xs"
            style={{ color: 'var(--color-muted)' }}
          >
            Any chapter
          </button>
        )}
      </div>
      <select
        value={chapter ?? ''}
        onChange={(e) => setChapter(e.target.value === '' ? null : Number(e.target.value))}
        aria-label={`Select NCERT chapter for ${subject} Class ${grade}`}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] cursor-pointer"
        style={{
          background: 'var(--color-surface2)',
          border: '1.5px solid var(--color-border)',
          color: chapter !== null ? 'var(--color-text)' : 'var(--color-muted)',
        }}
      >
        <option value="">— All chapters (no filter) —</option>
        {chapters.map((name, i) => (
          <option key={i} value={i}>
            {chapterLabel(i, name)}
          </option>
        ))}
      </select>
      {chapter !== null && (
        <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
          Focused on Class {grade} NCERT {subject}
        </p>
      )}
    </div>
  );
}
