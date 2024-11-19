'use client';
import { useState } from 'react';
import styles from './recommendations.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function RecommendationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data?.choices?.[0]?.message?.content || 'Sorry, no recommendations available at the moment.'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error getting recommendations. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatBox}>
        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className={styles.loading}>
              Thinking...
            </div>
          )}
        </div>
        <div className={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your ideal job..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className={styles.input}
          />
          <button 
            onClick={sendMessage}
            disabled={isLoading}
            className={styles.sendButton}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 