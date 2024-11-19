"use client";

import { useState, useEffect } from 'react';
import ChatUI from './ChatUI';
import Link from 'next/link';

export default function FloatingChat() {
  const [isMinimized, setIsMinimized] = useState(true);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chatHeight = windowHeight * 0.5;

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute -top-2 right-2 z-[99999]">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-gray-800/80 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-700 transition-all duration-200 text-xl font-light backdrop-blur-sm"
        >
          −
        </button>
      </div>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-[#2DD4BF] text-white rounded-full w-51 h-51 shadow-lg hover:opacity-90 transition-all duration-200 overflow-hidden flex items-center justify-center p-2.5"
        >
          <img 
            src="/images/logo4mini.png"
            alt="Chat Assistant"
            className="w-7 h-7 object-contain"
            width={28}
            height={28}
          />
        </button>
      ) : (
        <div 
          className="bg-white rounded-xl shadow-2xl w-[300px] flex flex-col border border-gray-200"
          style={{ height: `${chatHeight}px` }}
        >
          <div className="p-2 bg-blue-500 text-white rounded-t-xl flex justify-between items-center">
            <h3 className="font-medium text-sm">Career Assistant</h3>
            <button 
              onClick={() => setIsMinimized(true)}
              className="hover:bg-blue-600/50 rounded-full p-1 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
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
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatUI />
          </div>
        </div>
      )}
    </div>
  );
} 