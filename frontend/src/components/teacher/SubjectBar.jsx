/**
 * SubjectBar — CSS-only horizontal progress bar for a single subject.
 * Usage: <SubjectBar subject="Math" percent={60} count={24} />
 */

const SUBJECT_EMOJIS = {
  Math: '📐',
  Science: '🔬',
  English: '📖',
  'Civic Sense': '🏛️',
  'My Rights': '⚖️',
  'Respect & Safety': '🛡️',
  Communication: '💬',
};

export default function SubjectBar({ subject, percent, count, emoji }) {
  const icon = emoji ?? SUBJECT_EMOJIS[subject] ?? '📚';
  const clamped = Math.min(100, Math.max(0, percent ?? 0));

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: 148 }}>
        <span className="text-sm">{icon}</span>
        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
          {subject}
        </span>
      </div>

      {/* Bar track */}
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 8, background: 'var(--color-surface2)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clamped}%`, background: 'var(--color-primary)' }}
        />
      </div>

      {/* Percent + optional count */}
      <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: 68 }}>
        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-primary-text)' }}>
          {clamped}%
        </span>
        {count != null && (
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            ({count})
          </span>
        )}
      </div>
    </div>
  );
}
