'use client';
import { useState, useEffect } from 'react';
import styles from './chat.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';

// Constants
const CURRENT_USER_ID = 1; // Hardcoded user ID (employee_id = 1)

interface Message {
  message_id: number;
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  time: string;
  read_status: boolean;
  isEditing?: boolean;
}

interface Chat {
  chat_id: number;
  employee_id: number;
  employer_id: number;
  employee_first_name: string;
  employee_last_name: string;
  employer_first_name: string;
  employer_last_name: string;
}

interface DeleteModalProps {
  isOpen: boolean;
  messageId: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState<string>('');

  // Fetch chats for the current user
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/chat?user_id=${CURRENT_USER_ID}`);
        const data = await response.json();
        console.log('Fetched chats:', data);
        setChats(data);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };
    fetchChats();
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/chat?type=messages&chat_id=${selectedChat}`);
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const selectedChatData = chats.find(chat => chat.chat_id === selectedChat);
      if (!selectedChatData) return;

      // Determine receiver_id based on the chat data
      const receiver_id = selectedChatData.employee_id === CURRENT_USER_ID 
        ? selectedChatData.employer_id 
        : selectedChatData.employee_id;

      const response = await fetch('/api/chat?type=message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: selectedChat,
          sender_id: CURRENT_USER_ID,
          receiver_id: receiver_id,
          content: message,
        }),
      });

      if (response.ok) {
        setMessage('');
        // Refresh messages
        const updatedResponse = await fetch(`/api/chat?type=messages&chat_id=${selectedChat}`);
        const data = await updatedResponse.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const deleteChat = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chat?chat_id=${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(chats.filter(chat => chat.chat_id !== chatId));
        if (selectedChat === chatId) {
          setSelectedChat(null);
          setMessages([]);
        }
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`/api/chat?type=message&message_id=${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg.message_id !== messageId));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const updateMessage = async (messageId: number, newContent: string) => {
    try {
      const response = await fetch(`/api/chat?type=message&message_id=${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.message_id === messageId 
            ? { ...msg, content: newContent, isEditing: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const DeleteModal = ({ isOpen, messageId, onConfirm, onCancel }: DeleteModalProps) => {
    if (!isOpen) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h3>Delete Message</h3>
          <p>Are you sure you want to delete this message? This action cannot be undone.</p>
          <div className={styles.modalButtons}>
            <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
            <button className={styles.deleteButton} onClick={() => onConfirm()}>Delete</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <DeleteModal
        isOpen={showDeleteModal}
        messageId={messageToDelete!}
        onConfirm={() => messageToDelete && deleteMessage(messageToDelete)}
        onCancel={() => {
          setShowDeleteModal(false);
          setMessageToDelete(null);
        }}
      />
      <div className={styles.sidebar}>
        <h2>Chats ({chats.length})</h2>
        <div className={styles.chatList}>
          {chats.length === 0 ? (
            <div>No chats found</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.chat_id}
                className={`${styles.chatItem} ${selectedChat === chat.chat_id ? styles.selected : ''}`}
              >
                <div
                  className={styles.chatContent}
                  onClick={() => setSelectedChat(chat.chat_id)}
                >
                  {chat.employee_id === CURRENT_USER_ID ? (
                    <div className={styles.chatPartner}>
                      Employer {chat.employer_first_name} {chat.employer_last_name}
                    </div>
                  ) : (
                    <div className={styles.chatPartner}>
                      Employee {chat.employee_first_name} {chat.employee_last_name}
                    </div>
                  )}
                </div>
                <button
                  className={styles.deleteChat}
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatToDelete(chat.chat_id);
                    setShowDeleteModal(true);
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.chatArea}>
        {selectedChat ? (
          <>
            <div className={styles.messages}>
              {messages.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`${styles.message} ${
                    msg.sender_id === CURRENT_USER_ID ? styles.sent : styles.received
                  }`}
                >
                  <div className={styles.messageWrapper}>
                    {msg.isEditing ? (
                      <div className={styles.editWrapper}>
                        <input
                          type="text"
                          value={editingMessage}
                          onChange={(e) => setEditingMessage(e.target.value)}
                          className={styles.editInput}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              updateMessage(msg.message_id, editingMessage);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          className={styles.saveButton}
                          onClick={() => updateMessage(msg.message_id, editingMessage)}
                        >
                          Save
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={() => {
                            setMessages(messages.map(m => 
                              m.message_id === msg.message_id 
                                ? { ...m, isEditing: false }
                                : m
                            ));
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={styles.messageContent}>{msg.content}</div>
                        <div className={styles.messageTime}>
                          {new Date(msg.time).toLocaleTimeString()}
                          {msg.sender_id === CURRENT_USER_ID && (
                            <div className={styles.messageActions}>
                              <button
                                className={styles.editMessage}
                                onClick={() => {
                                  setEditingMessage(msg.content);
                                  setMessages(messages.map(m => 
                                    m.message_id === msg.message_id 
                                      ? { ...m, isEditing: true }
                                      : m
                                  ));
                                }}
                              >
                                <FontAwesomeIcon icon={faPen} />
                              </button>
                              <button
                                className={styles.deleteMessage}
                                onClick={() => {
                                  setMessageToDelete(msg.message_id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.inputArea}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className={styles.noChat}>Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
}