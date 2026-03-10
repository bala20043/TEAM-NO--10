import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Loader2, Shield, MessageSquare, Clock, Check, CheckCheck, Info, ChevronLeft } from 'lucide-react';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ParentChat() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    useEffect(() => {
        fetchTeachers();
        return () => clearInterval(pollInterval.current);
    }, []);

    useEffect(() => {
        if (selectedTeacher) {
            fetchMessages(true);
            clearInterval(pollInterval.current);
            pollInterval.current = setInterval(() => fetchMessages(false), 5000);
        } else {
            setMessages([]);
            clearInterval(pollInterval.current);
        }
    }, [selectedTeacher]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTeachers = async () => {
        try {
            const res = await messageAPI.getChatList();
            if (res.contacts) {
                setTeachers(res.contacts);
                if (res.contacts.length > 0) {
                    setSelectedTeacher(res.contacts[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (showLoading) => {
        if (!selectedTeacher) return;
        try {
            const res = await messageAPI.getHistory(selectedTeacher.id);
            if (res.messages) {
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
        if (!newMessage.trim() || !selectedTeacher || sending) return;

        setSending(true);
        try {
            await messageAPI.send(selectedTeacher.id, newMessage);
            setNewMessage('');
            fetchMessages(false);
        } catch (err) {
            alert(err.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-500)" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '24px' }}
            >
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Teacher Chat</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Secure communication with your class teacher and department head</p>
            </motion.div>

            <div className="chat-layout">
                {/* Teacher Selection (if multiple) */}
                {teachers.length > 1 && (
                    <div className="chat-contacts">
                        {teachers.map(t => (
                            <motion.div
                                key={t.id}
                                className={`contact-card ${selectedTeacher?.id === t.id ? 'active' : ''}`}
                                onClick={() => setSelectedTeacher(t)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="avatar">{t.name.charAt(0)}</div>
                                <div>
                                    <p className="name">{t.name}</p>
                                    <p className="role">{t.role.toUpperCase()}</p>
                                </div>
                                {t.unreadCount > 0 && <div className="badge">{t.unreadCount}</div>}
                            </motion.div>
                        ))}
                    </div>
                )}

                {selectedTeacher ? (
                    <div className="chat-window">
                        <div className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <motion.button
                                    className="chat-back-btn"
                                    onClick={() => setSelectedTeacher(null)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ChevronLeft size={24} />
                                </motion.button>
                                <div className="avatar small">{selectedTeacher.name.charAt(0)}</div>
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{selectedTeacher.name}</h3>
                                    <span className="online-indicator">Online for queries</span>
                                </div>
                            </div>
                            <div className="security-tag"><Shield size={12} /> Encrypted</div>
                        </div>

                        <div className="chat-body">
                            <div className="info-box">
                                <Info size={16} />
                                <p>This chat is intended for academic queries, attendance clarifications, and official communication.</p>
                            </div>

                            {messages.map((msg, i) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`msg-bubble ${isMe ? 'own' : ''}`}
                                    >
                                        <p>{msg.content}</p>
                                        <div className="meta">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && (msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />)}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-footer" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Write your message here..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <motion.button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                whileHover={{ scale: 1.05, background: 'var(--primary-600)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </motion.button>
                        </form>
                    </div>
                ) : (
                    <div className="no-contacts">
                        <MessageSquare size={48} />
                        <p>No class teacher has been assigned to your department/year yet.</p>
                    </div>
                )}
            </div>

            <style>{`
                .chat-layout {
                    display: flex;
                    gap: 20px;
                    height: calc(100vh - 200px);
                }

                .chat-contacts {
                    width: 260px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .contact-card {
                    padding: 12px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    position: relative;
                }

                .contact-card.active {
                    border-color: var(--primary-500);
                    background: var(--primary-500)10;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--primary-500);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .avatar.small { width: 32px; height: 32px; font-size: 14px; }

                .name { font-size: 14px; font-weight: 600; }
                .role { font-size: 10px; color: var(--text-muted); }

                .badge {
                    position: absolute;
                    right: 12px;
                    background: var(--danger-500);
                    color: white;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                }

                .chat-window {
                    flex: 1;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 10px 30px var(--shadow-color);
                }

                .chat-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.02);
                }

                .online-indicator {
                    font-size: 11px;
                    color: var(--success-500);
                    font-weight: 500;
                }

                .security-tag {
                    font-size: 10px;
                    color: var(--primary-400);
                    padding: 4px 8px;
                    background: var(--primary-500)12;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .chat-body {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: rgba(0,0,0,0.01);
                }

                .info-box {
                    padding: 12px;
                    background: var(--primary-500)08;
                    border: 1px solid var(--primary-500)20;
                    border-radius: var(--radius-md);
                    display: flex;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .info-box p { font-size: 12px; color: var(--text-primary); line-height: 1.4; }
                .info-box svg { color: var(--primary-500); flex-shrink: 0; }

                .msg-bubble {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 16px;
                    background: var(--bg-secondary);
                    align-self: flex-start;
                    border-bottom-left-radius: 4px;
                }

                .msg-bubble.own {
                    align-self: flex-end;
                    background: var(--primary-500);
                    color: white;
                    border-bottom-left-radius: 16px;
                    border-bottom-right-radius: 4px;
                }

                .msg-bubble p { font-size: 14px; }

                .meta {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 4px;
                    font-size: 10px;
                    margin-top: 4px;
                    opacity: 0.7;
                }

                .chat-footer {
                    padding: 16px 20px;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    gap: 12px;
                }

                .chat-footer input {
                    flex: 1;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    color: var(--text-primary);
                    outline: none;
                }

                .chat-footer button {
                    width: 44px;
                    height: 44px;
                    border-radius: var(--radius-lg);
                    background: var(--primary-500);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .no-contacts {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    text-align: center;
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
                    .chat-layout {
                        height: calc(100vh - 120px);
                    }
                    .chat-contacts {
                        width: 100%;
                        display: ${selectedTeacher ? 'none' : 'flex'};
                    }
                    .chat-window {
                        display: ${selectedTeacher ? 'flex' : 'none'};
                    }
                    .chat-back-btn {
                        display: flex;
                    }
                    .chat-body {
                        padding: 16px;
                    }
                    .msg-bubble {
                        max-width: 90%;
                    }
                }
            `}</style>
        </div>
    );
}
