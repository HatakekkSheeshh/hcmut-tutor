import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string, emojiData?: EmojiClickData) => void;
  theme?: 'light' | 'dark';
  inputRef?: React.RefObject<HTMLInputElement>;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

// Store recent emojis in localStorage
const RECENT_EMOJIS_KEY = 'recent_emojis';
const MAX_RECENT_EMOJIS = 20;

const getRecentEmojis = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentEmoji = (emoji: string) => {
  try {
    const recent = getRecentEmojis();
    const updated = [emoji, ...recent.filter(e => e !== emoji)].slice(0, MAX_RECENT_EMOJIS);
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

export const EmojiPickerComponent: React.FC<EmojiPickerProps> = ({ 
  onEmojiSelect, 
  theme = 'light',
  inputRef,
  inputValue = '',
  onInputChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentEmojis(getRecentEmojis());
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    
    // Save to recent emojis
    saveRecentEmoji(emoji);
    setRecentEmojis(getRecentEmojis());

    // Insert emoji at cursor position if inputRef is provided
    if (inputRef?.current && onInputChange && inputValue !== undefined) {
      const input = inputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const textBefore = inputValue.substring(0, start);
      const textAfter = inputValue.substring(end);
      const newValue = textBefore + emoji + textAfter;
      
      onInputChange(newValue);
      
      // Set cursor position after inserted emoji
      setTimeout(() => {
        const newCursorPos = start + emoji.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        input.focus();
      }, 0);
      
      // Call callback
      onEmojiSelect(emoji, emojiData);
    } else {
      // Fallback: just call callback (parent will handle)
      onEmojiSelect(emoji, emojiData);
    }
  };

  const emojiTheme: Theme = theme === 'dark' ? Theme.DARK : Theme.LIGHT;

  return (
    <div
      ref={pickerRef}
      className={`absolute bottom-full right-0 mb-2 rounded-lg shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}
      style={{
        zIndex: 1000,
        width: '352px',
        maxHeight: '435px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        theme={emojiTheme}
        emojiStyle={EmojiStyle.NATIVE}
        searchPlaceHolder="Search emojis..."
        previewConfig={{
          showPreview: true,
          defaultCaption: 'Pick an emoji...',
          defaultEmoji: '1f60a'
        }}
        skinTonesDisabled={false}
        width="100%"
        height={435}
        lazyLoadEmojis={true}
        searchDisabled={false}
      />
    </div>
  );
};

// Export default for backward compatibility
export default EmojiPickerComponent;
