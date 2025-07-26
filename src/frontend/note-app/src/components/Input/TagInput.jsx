import React, { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addNewTag = () => {
    const trimmedValue = inputValue.trim(); // Trim whitespace from both ends

    // Check if tag is non-empty AND doesn't already exist (case-insensitive)
    if (
      trimmedValue &&
      !tags.some(
        (tag) => tag.trim().toLowerCase() === trimmedValue.toLowerCase()
      )
    ) {
      setTags([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key == "Enter") {
      addNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    // Remove all matching tags (including whitespace variants)
    setTags(tags.filter((tag) => tag.trim() !== tagToRemove.trim()));
  };

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex items-center flex-wrap mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center gap-2 text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded mr-2 mb-2"
            >
              # {tag}
              <button
                onClick={() => {
                  handleRemoveTag(tag);
                }}
              >
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-3">
        <input
          type="text"
          value={inputValue}
          className="text-sm bg-transparent border px-3 py-2 rounded outline-none"
          placeholder="Add tags"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="w-8 h-8 flex items-center justify-center rounded border border-blue-700 hover:bg-blue-700"
          onClick={() => {
            addNewTag();
          }}
        >
          <MdAdd className="text-2xl text-blue-700 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default TagInput;
