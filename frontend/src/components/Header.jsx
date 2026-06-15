// Header — brand row + the always-visible XP bar, plus a sound mute toggle.
import XPBar from './XPBar';

const Header = ({ xp, level, levelData, nextLevelXP, muted, onToggleMute }) => (
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
    {levelData && (
      <XPBar xp={xp} level={level} levelData={levelData} nextLevelXP={nextLevelXP} />
    )}
  </header>
);

export default Header;
