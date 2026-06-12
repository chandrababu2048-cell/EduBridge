// SubjectSelector — lets the child pick Math, Science, or English
// Uses SUBJECT_THEMES so each subject card has its own color (UI_UX.md)
import { SUBJECT_THEMES } from '../subjectThemes';

const subjects = ['Math', 'Science', 'English'];

const SubjectSelector = ({ subject, setSubject }) => (
  <div className="w-full max-w-md">
    <h2 className="text-xl font-bold text-center text-[#2D3748] mb-3">
      What would you like to learn? 📚
    </h2>
    <div className="flex gap-3 justify-center">
      {subjects.map(name => {
        const theme = SUBJECT_THEMES[name];
        const selected = subject === name;
        return (
          <button
            key={name}
            onClick={() => setSubject(name)}
            className={`flex flex-col items-center p-5 rounded-2xl border-2 font-bold min-h-[48px] transition-all duration-200
              ${theme.border}
              ${selected
                ? `${theme.bg} text-white shadow-lg scale-105`
                : `bg-white ${theme.text} shadow-sm hover:shadow-md hover:scale-105`
              }`}
          >
            <span className="text-4xl mb-2">{theme.emoji}</span>
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default SubjectSelector;
