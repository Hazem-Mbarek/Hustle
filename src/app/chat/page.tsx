'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './chat.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes, faSearch, faPaperclip, faFilePdf, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import ToxicityAlert from '../components/ToxicityAlert';
import ToxicityCheck from '../components/ToxicityCheck';

interface Message {
  message_id: number;
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  time: string;
  read_status: boolean;
  isEditing?: boolean;
  attachment?: string;
  reaction?: string;
}

interface Chat {
  chat_id: number;
  profile_id_1: number;
  profile_id_2: number;
  profile1_first_name: string;
  profile1_last_name: string;
  profile2_first_name: string;
  profile2_last_name: string;
}

interface DeleteModalProps {
  isOpen: boolean;
  messageId: number;
  onConfirm: () => void;
  onCancel: () => void;
}

interface SearchResult {
  type: 'message' | 'chat';
  chat_id: number;
  message_id?: number;
  content?: string;
  time?: string;
  partner_name: string;
  preview: string;
}

function getReactionEmoji(type: string | null): string {
  const emojis: { [key: string]: string } = {
    like: '👍',
    love: '❤️',
    laugh: '😄',
    wow: '😮',
    sad: '😢',
    angry: '😠',
  };
  return type ? emojis[type] || '👍' : '';
}

export default function ChatPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showToxicityAlert, setShowToxicityAlert] = useState(false);
  const [isCheckingToxicity, setIsCheckingToxicity] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (!response.ok) {
          router.push('/login?from=/chat');
          return;
        }
        const data = await response.json();
        setCurrentUserId(data.profileId);
      } catch (error) {
        console.error('Failed to get current user:', error);
        router.push('/login?from=/chat');
      }
    };

    getCurrentUser();
  }, [router]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUserId) return;

      try {
        const response = await fetch(`/api/chat?profile_id=${currentUserId}`);
        const data = await response.json();
        console.log('Fetched chats:', data);
        setChats(data);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };

    if (currentUserId) {
      console.log('Current user ID:', currentUserId);
      fetchChats();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/chat?type=messages&chat_id=${selectedChat}`);
          const data = await response.json();
          setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          setMessages([]);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat && currentUserId && messages.length > 0) {
      // Mark messages as read when they are viewed
      const unreadMessages = messages.filter(
        msg => msg.receiver_id === currentUserId && !msg.read_status
      );

      if (unreadMessages.length > 0) {
        fetch('/api/chat/read-status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: selectedChat,
            receiver_id: currentUserId
          }),
        });
      }
    }
  }, [selectedChat, messages, currentUserId]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001');

    socket.on('messages-read', ({ chat_id, reader_id }) => {
      if (selectedChat === chat_id) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.receiver_id === reader_id ? { ...msg, read_status: true } : msg
          )
        );
      }
    });

    return () => {
      socket.off('messages-read');
    };
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat || !currentUserId) return;

    try {
      setIsCheckingToxicity(true);

      // Check for toxicity first
      const moderationResponse = await fetch('/api/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      const moderationResult = await moderationResponse.json();
      setIsCheckingToxicity(false);

      if (moderationResult.is_toxic) {
        setShowToxicityAlert(true);
        return;
      }

      const selectedChatData = chats.find(chat => chat.chat_id === selectedChat);
      if (!selectedChatData) return;

      const receiver_id = selectedChatData.profile_id_1 === currentUserId 
        ? selectedChatData.profile_id_2 
        : selectedChatData.profile_id_1;

      const response = await fetch('/api/chat?type=message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: selectedChat,
          sender_id: currentUserId,
          receiver_id: receiver_id,
          content: message,
        }),
      });

      if (response.ok) {
        setMessage('');
        const updatedResponse = await fetch(`/api/chat?type=messages&chat_id=${selectedChat}`);
        const updatedData = await updatedResponse.json();
        setMessages(Array.isArray(updatedData) ? updatedData : []);
      }
    } catch (error) {
      setIsCheckingToxicity(false);
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

  const handleEditMessage = async (messageId: number, newContent: string) => {
    try {
      const response = await fetch(`/api/chat?type=message&message_id=${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) throw new Error('Failed to update message');

      // Update the message in the local state
      setMessages(messages.map(msg => 
        msg.message_id === messageId 
          ? { ...msg, content: newContent, isEditing: false }
          : msg
      ));
      
      setEditingMessageId(null);
      setEditingMessage('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim() || !currentUserId) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/chat?type=search&profile_id=${currentUserId}&search=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUserId]);

  const DeleteModal = ({ isOpen, messageId, onConfirm, onCancel }: DeleteModalProps) => {
    if (!isOpen) return null;

    return (
      <div className={styles.modalOverlay} onClick={onCancel}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <h3>Delete Message</h3>
          <p>Are you sure you want to delete this message? This action cannot be undone.</p>
          <div className={styles.modalButtons}>
            <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
            <button className={styles.deleteButton} onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    );
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // Get receiver ID
      const selectedChatData = chats.find(chat => chat.chat_id === selectedChat);
      if (!selectedChatData) return;

      const receiver_id = selectedChatData.profile_id_1 === currentUserId 
        ? selectedChatData.profile_id_2 
        : selectedChatData.profile_id_1;

      // Send message with attachment
      const messageData = {
        chat_id: selectedChat,
        sender_id: currentUserId,
        receiver_id: receiver_id,
        content: '',
        attachment: data.url
      };

      const msgResponse = await fetch('/api/chat?type=message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (msgResponse.ok) {
        setMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file');
    }
  };

  const renderAttachment = (attachment: string) => {
    // Check file type by URL extension
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
    const isPDF = /\.pdf$/i.test(attachment);
    
    if (isImage) {
      return (
        <img 
          src={attachment}
          alt="Image attachment"
          className={styles.attachmentImage}
          onClick={() => window.open(attachment, '_blank')}
        />
      );
    }
    
    if (isPDF) {
      return (
        <div 
          className={styles.attachmentWrapper}
          onClick={() => window.open(attachment, '_blank')}
        >
          <div className={styles.pdfContainer}>
            <FontAwesomeIcon 
              icon={faFilePdf} 
              className={styles.pdfIcon}
            />
            <span>View PDF</span>
          </div>
        </div>
      );
    }
    
    // For other file types
    return (
      <div 
        className={styles.attachmentWrapper}
        onClick={() => window.open(attachment, '_blank')}
      >
        <div className={styles.fileContainer}>
          <FontAwesomeIcon 
            icon={faPaperclip} 
            className={styles.fileIcon}
          />
          <span>Open file</span>
        </div>
      </div>
    );
  };

  const handleReaction = async (messageId: number, reaction: string) => {
    try {
      const response = await fetch(`/api/chat/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          reaction: reaction
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the messages state with the new reaction (or null if removed)
        setMessages(messages.map(msg => 
          msg.message_id === messageId 
            ? { ...msg, reaction: data.reaction }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to update reaction:', error);
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.time);
      const dateKey = date.toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    
    return groups;
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
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {searchQuery ? (
          <div className={styles.searchResults}>
            {isSearching ? (
              <div className={styles.loading}>Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.chat_id}-${result.message_id}`}
                  className={styles.searchResult}
                  onClick={() => {
                    setSelectedChat(result.chat_id);
                    setSearchQuery('');
                  }}
                >
                  <div className={styles.searchResultHeader}>
                    <span className={styles.partnerName}>{result.partner_name}</span>
                    {result.time && (
                      <span className={styles.messageTime}>
                        {new Date(result.time).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div className={styles.messagePreview}>{result.preview}</div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>No messages found</div>
            )}
          </div>
        ) : (
          <>
            <h2>Chats ({chats.length})</h2>
            <div className={styles.chatList}>
              {chats.length === 0 ? (
                <div>No chats found</div>
              ) : (
                chats.map((chat) => {
                  const isUser1 = chat.profile_id_1 === currentUserId;
                  const displayName = isUser1 
                    ? `${chat.profile2_first_name} ${chat.profile2_last_name}`
                    : `${chat.profile1_first_name} ${chat.profile1_last_name}`;

                  return (
                    <div
                      key={chat.chat_id}
                      className={`${styles.chatItem} ${selectedChat === chat.chat_id ? styles.selected : ''}`}
                    >
                      <div
                        className={styles.chatContent}
                        onClick={() => setSelectedChat(chat.chat_id)}
                      >
                        <div className={styles.chatPartner}>
                          {displayName || 'Unknown User'}
                        </div>
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
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.chatArea}>
        {selectedChat ? (
          <>
            <div className={styles.messages}>
              {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                <React.Fragment key={date}>
                  <div className={styles.messageTimestamp}>
                    {date}
                  </div>
                  {msgs.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`${styles.message} ${
                        msg.sender_id === currentUserId ? styles.sent : styles.received
                      }`}
                    >
                      <div className={styles.messageWrapper}>
                        <div className={styles.messageContent}>
                          {msg.isEditing ? (
                            <input
                              type="text"
                              value={editingMessage}
                              onChange={(e) => setEditingMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditMessage(msg.message_id, editingMessage);
                                }
                              }}
                              onBlur={() => handleEditMessage(msg.message_id, editingMessage)}
                              autoFocus
                            />
                          ) : (
                            <div className={styles.messageContent}>
                              {msg.content}
                              {msg.attachment && renderAttachment(msg.attachment)}
                              {msg.sender_id === currentUserId && (
                                <div className={styles.messageActions}>
                                  <button
                                    className={styles.editMessage}
                                    onClick={() => {
                                      setEditingMessage(msg.content);
                                      setEditingMessageId(msg.message_id);
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
                          )}
                          <div className={styles.reactionOptions}>
                            <button onClick={() => handleReaction(msg.message_id, 'like')}>👍</button>
                            <button onClick={() => handleReaction(msg.message_id, 'love')}>❤️</button>
                            <button onClick={() => handleReaction(msg.message_id, 'laugh')}>😄</button>
                            <button onClick={() => handleReaction(msg.message_id, 'wow')}>😮</button>
                            <button onClick={() => handleReaction(msg.message_id, 'sad')}>😢</button>
                            <button onClick={() => handleReaction(msg.message_id, 'angry')}>😠</button>
                          </div>
                          {msg.reaction && (
                            <div 
                              className={styles.messageReaction}
                              onClick={() => handleReaction(msg.message_id, msg.reaction || '')}
                            >
                              {getReactionEmoji(msg.reaction)}
                            </div>
                          )}
                        </div>
                        <div className={styles.messageTime}>
                          <span className={styles.messageStatus}>
                            {msg.sender_id === currentUserId && (
                              msg.read_status ? '✓✓' : '✓'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <ToxicityCheck isChecking={isCheckingToxicity} />
            <div className={styles.inputArea}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                onChange={handleFileSelect}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={styles.attachButton}
              >
                <FontAwesomeIcon icon={faPaperclip} />
              </button>
              <button 
                onClick={sendMessage}
                className={styles.sendButton}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.noChat}>Select a chat to start messaging</div>
        )}
      </div>
      <ToxicityAlert 
        isVisible={showToxicityAlert}
        onClose={() => setShowToxicityAlert(false)}
      />
    </div>
  );
}