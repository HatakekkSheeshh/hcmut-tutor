import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  theme?: 'light' | 'dark';
}

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
  '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
  '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫',
  '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟',
  '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
  '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
  '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
  '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡',
  '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸',
  '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👍',
  '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏',
  '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾',
  '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷',
  '🦴', '👀', '👁️', '👅', '👄', '💋', '💘', '💝',
  '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️',
  '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋',
  '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
  '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
  '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
  '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
  '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
  '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '💘',
  '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️',
  '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤',
  '🤍', '🤎', '💯', '💢', '💥', '💫', '💦', '💨',
  '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, theme = 'light' }) => {
  return (
    <div
      className={`absolute bottom-full right-0 mb-2 p-4 rounded-lg shadow-lg max-h-64 overflow-y-auto ${
        theme === 'dark'
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-200'
      }`}
      style={{
        width: '300px',
        zIndex: 1000
      }}
    >
      <div className="grid grid-cols-8 gap-2">
        {commonEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className={`text-2xl p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;

