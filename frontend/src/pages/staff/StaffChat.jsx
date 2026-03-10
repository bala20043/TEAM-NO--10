import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Search, Loader2, Shield, MessageSquare, Clock, Check, CheckCheck, ChevronLeft } from 'lucide-react';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StaffChat() {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    useEffect(() => {
        fetchContacts();
        return () => clearInterval(pollInterval.current);
    }, []);

    useEffect(() => {
        if (selectedContact) {
            fetchMessages(true);
            // Start polling
            clearInterval(pollInterval.current);
            pollInterval.current = setInterval(() => fetchMessages(false), 5000);
        } else {
            setMessages([]);
            clearInterval(pollInterval.current);
        }
    }, [selectedContact]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchContacts = async () => {
        try {
            const res = await messageAPI.getChatList();
            if (res.contacts) setContacts(res.contacts);
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (showLoading) => {
        if (!selectedContact) return;
        try {
            const res = await messageAPI.getHistory(selectedContact.id);
            if (res.messages) {
                // Only update if message count changed or first load
                if (showLoading || res.messages.length !== messages.length) {
                    setMessages(res.messages);
                }
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact || sending) return;

        setSending(true);
        try {
            await messageAPI.send(selectedContact.id, newMessage);
            setNewMessage('');
            fetchMessages(false);
        } catch (err) {
            alert(err.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.reg_no && c.reg_no.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-500)" />
            </div>
        );
    }

    return (
        <div className="chat-container">
            {/* Sidebar */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Messages</h2>
                    <div className="chat-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="chat-contact-list">
                    {filteredContacts.map(contact => (
                        <motion.div
                            key={contact.id}
                            className={`chat-contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                            onClick={() => setSelectedContact(contact)}
                            whileHover={{ background: 'var(--bg-secondary)' }}
                        >
                            <div className="contact-avatar">
                                {contact.name.charAt(0).toUpperCase()}
                                {contact.unreadCount > 0 && <span className="unread-badge">{contact.unreadCount}</span>}
                            </div>
                            <div className="contact-info">
                                <p className="contact-name">{contact.name}</p>
                                <p className="contact-reg">{contact.reg_no || contact.role}</p>
                            </div>
                        </motion.div>
                    ))}
                    {filteredContacts.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                            No students found.
                        </p>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                {selectedContact ? (
                    <>
                        <div className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <motion.button
                                    className="chat-back-btn"
                                    onClick={() => setSelectedContact(null)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ChevronLeft size={24} />
                                </motion.button>
                                <div className="contact-avatar small">
                                    {selectedContact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{selectedContact.name}</h3>
                                    <p style={{ fontSize: '11px', color: 'var(--success-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                        Active Conversation
                                    </p>
                                </div>
                            </div>
                            <div className="security-badge">
                                <Shield size={12} /> Secure Portal
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`message-row ${isMe ? 'own' : ''}`}
                                    >
                                        <div className="message-bubble">
                                            <p>{msg.content}</p>
                                            <div className="message-meta">
                                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isMe && (msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />)}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <motion.button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </motion.button>
                        </form>
                    </>
                ) : (
                    <div className="chat-empty">
                        <MessageSquare size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
                        <h3>Your Conversations</h3>
                        <p>Select a student from the list to start communicating securely.</p>
                        <div className="security-notice">
                            <Shield size={16} /> All messages are encrypted and audited for security.
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .chat-container {
                    display: flex;
                    height: calc(100vh - 160px);
                    background: var(--bg-card);
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border-color);
                    overflow: hidden;
                    box-shadow: 0 10px 30px var(--shadow-color);
                }

                /* Sidebar */
                .chat-sidebar {
                    width: 300px;
                    border-right: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    background: rgba(255,255,255,0.02);
                }

                .chat-sidebar-header {
                    padding: 24px 20px;
                    border-bottom: 1px solid var(--border-color);
                }

                .chat-search {
                    margin-top: 16px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .chat-search svg {
                    position: absolute;
                    left: 12px;
                    color: var(--text-muted);
                }

                .chat-search input {
                    width: 100%;
                    padding: 10px 12px 10px 36px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 13px;
                }

                .chat-contact-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .chat-contact-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    margin-bottom: 4px;
                    transition: all 0.2s ease;
                }

                .chat-contact-item.active {
                    background: var(--primary-500) !important;
                }

                .chat-contact-item.active .contact-name,
                .chat-contact-item.active .contact-reg {
                    color: white;
                }

                .contact-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: var(--radius-md);
                    background: linear-gradient(135deg, var(--primary-500), #7c3aed);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 18px;
                    position: relative;
                    flex-shrink: 0;
                }

                .contact-avatar.small {
                    width: 36px;
                    height: 36px;
                    font-size: 14px;
                }

                .unread-badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: var(--danger-500);
                    color: white;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: var(--radius-full);
                    border: 2px solid var(--bg-card);
                }

                .contact-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .contact-reg {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                /* Main Area */
                .chat-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-secondary);
                    position: relative;
                }

                .chat-header {
                    padding: 16px 24px;
                    background: var(--bg-card);
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 10;
                }

                .security-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--primary-400);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    background: var(--primary-500)12;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background-image: 
                        radial-gradient(circle at 2px 2px, var(--border-color) 1px, transparent 0);
                    background-size: 24px 24px;
                }

                .message-row {
                    display: flex;
                    justify-content: flex-start;
                    width: 100%;
                }

                .message-row.own {
                    justify-content: flex-end;
                }

                .message-bubble {
                    max-width: 70%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    position: relative;
                    box-shadow: 0 2px 10px var(--shadow-color);
                }

                .own .message-bubble {
                    background: var(--primary-600);
                    border: none;
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message-row:not(.own) .message-bubble {
                    border-bottom-left-radius: 4px;
                }

                .message-bubble p {
                    font-size: 14px;
                    line-height: 1.5;
                }

                .message-meta {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 6px;
                    margin-top: 4px;
                    font-size: 10px;
                    opacity: 0.7;
                }

                .chat-input-area {
                    padding: 20px 24px;
                    background: var(--bg-card);
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    gap: 12px;
                }

                .chat-input-area input {
                    flex: 1;
                    padding: 12px 18px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    color: var(--text-primary);
                    outline: none;
                    transition: border-color 0.2s;
                }

                .chat-input-area input:focus {
                    border-color: var(--primary-500);
                }

                .chat-input-area button {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-lg);
                    background: var(--primary-510);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .chat-input-area button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .chat-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 40px;
                    color: var(--text-muted);
                }

                .chat-empty h3 {
                    color: var(--text-primary);
                    font-size: 20px;
                    margin-bottom: 8px;
                }

                .security-notice {
                    margin-top: 32px;
                    padding: 12px 20px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .chat-back-btn {
                    display: none;
                    color: var(--text-muted);
                    background: none;
                    border: none;
                    cursor: pointer;
                    margin-left: -8px;
                }

                @media (max-width: 768px) {
                    .chat-container {
                        height: calc(100vh - 120px);
                    }
                    .chat-sidebar {
                        width: 100%;
                        display: ${selectedContact ? 'none' : 'flex'};
                    }
                    .chat-main {
                        display: ${selectedContact ? 'flex' : 'none'};
                    }
                    .chat-back-btn {
                        display: flex;
                    }
                    .chat-messages {
                        padding: 16px;
                    }
                    .message-bubble {
                        max-width: 85%;
                    }
                }
            `}</style>
        </div>
    );
}
