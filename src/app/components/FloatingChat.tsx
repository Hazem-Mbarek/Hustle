"use client";

import { useState } from 'react';
import ChatUI from './ChatUI';

export default function FloatingChat() {
  const [isMinimized, setIsMinimized] = useState(true);

  return (
    <div className="relative">
      <div className="absolute -top-2 right-2 z-[99999]">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-gray-800/80 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-700 transition-all duration-200 text-xl font-light backdrop-blur-sm"
        >
          −
        </button>
      </div>
      {isMinimized ? (
        // Chat Button
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-500 text-white rounded-xl px-6 py-3 shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center space-x-3"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" 
            />
          </svg>
          <span>Career Assistant</span>
        </button>
      ) : (
        // Chat Window
        <div className="bg-white rounded-lg shadow-xl w-[380px] h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Career Assistant</h3>
            <button 
              onClick={() => setIsMinimized(true)}
              className="hover:bg-blue-600 rounded-full p-1"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </button>
          </div>
          
          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <ChatUI />
          </div>
        </div>
      )}
    </div>
  );
} 