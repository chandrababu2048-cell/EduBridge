import XPBar from './XPBar';

const Header = ({ xp, level, levelData, nextLevelXP, muted, onToggleMute, user, onSignInClick, onSignOut }) => (
  <header className="relative z-10">
    <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌉</span>
        <div>
          <h1 className="text-base font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
            Edu<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
          </h1>
          <p className="text-[11px] leading-tight" style={{ color: 'var(--color-muted)' }}>AI Learning</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <button
            onClick={onSignOut}
            title={`${user.email} — click to sign out`}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {user.email?.[0]?.toUpperCase() ?? '?'}
          </button>
        ) : (
          <button
            onClick={onSignInClick}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-muted)', border: '1px solid var(--color-border)', background: 'transparent' }}
          >
            Sign In
          </button>
        )}

        {onToggleMute && (
          <button
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
            style={{ color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>
    </div>

    {levelData && (
      <div className="px-5 py-2 flex items-center justify-between text-xs" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ color: 'var(--color-muted)' }}>Level {level} · {levelData.name}</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>⭐ {xp} XP</span>
      </div>
    )}
    {levelData && <XPBar xp={xp} level={level} levelData={levelData} nextLevelXP={nextLevelXP} />}
  </header>
);

export default Header;
