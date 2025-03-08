import { useState, useEffect, useRef } from 'react';
import './EmojiPicker.css';

const EmojiPicker = ({ onSelectEmoji, onClose }) => {
    const [emojis, setEmojis] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(0);
    const pickerRef = useRef(null);

    useEffect(() => {
        const emojiCategories = [
            {
                name: "Smileys",
                emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚"]
            },
            {
                name: "Gestures",
                emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "👋", "🤚", "🖐️", "✋", "👏", "🙌", "👐", "🤲"]
            },
            {
                name: "Animals",
                emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦄"]
            },
            {
                name: "Food",
                emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🌮", "🍕"]
            },
            {
                name: "Activities",
                emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥅", "🏒", "🏑", "🥍", "🏏", "🎿", "🛷", "🥌", "⛸️"]
            },
            {
                name: "Travel",
                emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛴", "🚲", "🛵", "🏍️", "🚨", "🚔", "✈️"]
            },
            {
                name: "Objects",
                emojis: ["⌚", "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️"]
            },
            {
                name: "Symbols",
                emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"]
            },
        ];

        setCategories(emojiCategories.map(cat => cat.name));
        setEmojis(emojiCategories);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleEmojiClick = (emoji) => {
        onSelectEmoji(emoji);
      };
    return (
        <div className="emoji-picker" ref={pickerRef}>
            <div className="emoji-categories">
                {categories.map((category, index) => (
                    <button
                        key={category}
                        className={`emoji-category-btn ${activeCategory === index ? 'active' : ''}`}
                        onClick={() => setActiveCategory(index)}
                        type="button"
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="emoji-container">
                {emojis[activeCategory]?.emojis.map((emoji, index) => (
                    <button
                        key={index}
                        className="emoji-btn"
                        onClick={() => handleEmojiClick(emoji)}
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