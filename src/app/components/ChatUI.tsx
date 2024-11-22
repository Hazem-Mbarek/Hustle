"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatUIProps {
  chatHeight: number;
}

export default function ChatUI({ chatHeight }: ChatUIProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        content: data.choices[0].message.content,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center space-y-3">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-10 w-10 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
        <div className="space-y-2">
          <h3 className="text-base font-medium text-gray-800">Login Required</h3>
          <p className="text-sm text-gray-600">Please login or signup to chat</p>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/login" 
            className="bg-blue-500 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="bg-green-500 text-white px-4 py-1.5 rounded text-sm hover:bg-green-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: `${chatHeight}px` }}>
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        style={{ maxHeight: `calc(${chatHeight}px - 80px)`, maxWidth: "300px" }}
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className="p-3 rounded-lg bg-white text-black overflow-hidden"
          >
            <p className="mb-1 break-words overflow-wrap-anywhere">{message.content}</p>
            <small className="text-gray-500">{message.timestamp.toLocaleString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
            placeholder="Type your message..."
          />
          <button 
            type="submit"
            className="bg-[#2DD4BF] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" 
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
} 