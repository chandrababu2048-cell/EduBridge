// MessageBubble — one chat message; AI on the left, child on the right
const MessageBubble = ({ role, text }) => {
  const isAI = role === 'assistant';
  return (
    <div className={`flex animate-fadeIn ${isAI ? 'justify-start' : 'justify-end'}`}>
      {isAI ? (
        // AI message — white bubble with star avatar, left aligned
        <div className="flex gap-2 max-w-[85%]">
          <span className="text-2xl">🌟</span>
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <p className="text-[#2D3748]">{text}</p>
          </div>
        </div>
      ) : (
        // User message — blue bubble, right aligned
        <div className="bg-[#4F86C6] text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[75%] shadow-sm">
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
