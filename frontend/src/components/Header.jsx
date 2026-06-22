// Header — brand row + XP bar, sound mute toggle, and auth button.
import XPBar from './XPBar';

const Header = ({ xp, level, levelData, nextLevelXP, muted, onToggleMute, user, onSignInClick, onSignOut }) => (
  <header className="relative z-10">
    <div className="bg-[#111827]/80 backdrop-blur px-5 py-3 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-3xl">🌉</span>
        <div>
          <h1 className="text-xl font-black text-white leading-tight">
            Edu<span style={{ color: '#6C63FF' }}>Bridge</span>
          </h1>
          <p className="text-[11px] text-[#9CA3AF] leading-tight">AI Learning Adventure</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Auth button */}
        {user ? (
          <button
            onClick={onSignOut}
            title={`Signed in as ${user.email}\nClick to sign out`}
            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white border border-white/20 hover:border-[#6C63FF] transition-colors"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}
          >
            {user.email?.[0]?.toUpperCase() ?? '?'}
          </button>
        ) : (
          <button
            onClick={onSignInClick}
            className="text-xs font-bold text-[#9CA3AF] hover:text-white border border-white/10 hover:border-white/30 rounded-full px-3 py-1.5 transition-colors"
          >
            Sign In
          </button>
        )}

        {/* Mute toggle */}
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            className="text-xl bg-white/5 border border-white/10 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>
    </div>
    {levelData && (
      <XPBar xp={xp} level={level} levelData={levelData} nextLevelXP={nextLevelXP} />
    )}
  </header>
);

export default Header;
