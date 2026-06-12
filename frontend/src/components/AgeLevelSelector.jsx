// AgeLevelSelector — lets the child pick their age group
const AgeLevelSelector = ({ ageLevel, setAgeLevel }) => (
  <div className="w-full max-w-md">
    <h2 className="text-xl font-bold text-center text-[#2D3748] mb-3">
      How old are you? 🎂
    </h2>
    <div className="flex gap-3 justify-center">
      {[
        { value: 'little', label: 'Little Kids', age: '6-10', emoji: '🐣' },
        { value: 'older', label: 'Older Kids', age: '11-14', emoji: '🦋' }
      ].map(level => (
        <button
          key={level.value}
          onClick={() => setAgeLevel(level.value)}
          className={`flex flex-col items-center p-4 rounded-2xl border-2 font-bold min-h-[48px] transition-all duration-200
            ${ageLevel === level.value
              ? 'border-[#67C99A] bg-[#67C99A] text-white shadow-lg scale-105'
              : 'border-gray-200 bg-white text-[#2D3748] shadow-sm hover:border-[#67C99A] hover:shadow-md'
            }`}
        >
          <span className="text-3xl mb-1">{level.emoji}</span>
          <span>{level.label}</span>
          <span className={`text-sm ${ageLevel === level.value ? 'opacity-80' : 'text-gray-400'}`}>
            {level.age} years
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default AgeLevelSelector;
