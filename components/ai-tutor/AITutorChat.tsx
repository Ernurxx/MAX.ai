'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/layout/LanguageProvider'
import { X, Send, Bot, MessageSquarePlus, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { TutorConversationSummary } from './AITutor'
import 'katex/dist/katex.min.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: Message = {
  role: 'assistant',
  content: "Hello! I'm your AI Tutor. How can I help you with Physics or Mathematics today?",
}

interface AITutorChatProps {
  conversations: TutorConversationSummary[]
  activeConversationId: string | null
  onSelectConversation: (id: string | null) => void
  onNewChat: () => void
  onConversationCreated: (id: string) => void
  onClose: () => void
  refetchConversations: () => void
}

export function AITutorChat({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onConversationCreated,
  onClose,
  refetchConversations,
}: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const pathname = usePathname()
  const { t } = useLanguage()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeConversationId === null) {
      setMessages([GREETING])
      return
    }
    setLoadingMessages(true)
    fetch(`/api/tutor-conversations/${activeConversationId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })))
        } else {
          setMessages([GREETING])
        }
      })
      .catch(() => setMessages([GREETING]))
      .finally(() => setLoadingMessages(false))
  }, [activeConversationId])

  const handleSend = async () => {
    if (!input.trim() || loading || !session?.user?.id) return

    const userContent = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userContent }])
    setLoading(true)

    try {
      const context = { currentPage: pathname }
      let conversationId = activeConversationId

      if (!conversationId) {
        const createRes = await fetch('/api/tutor-conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New chat' }),
        })
        if (!createRes.ok) throw new Error('Failed to create conversation')
        const created = await createRes.json()
        conversationId = created.id
        onConversationCreated(conversationId)
        refetchConversations()
      }

      const res = await fetch(`/api/tutor-conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userContent, context }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      refetchConversations()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await fetch(`/api/tutor-conversations/${id}`, { method: 'DELETE' })
      if (activeConversationId === id) {
        onNewChat()
      }
      refetchConversations()
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-36 shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-2 border-b border-gray-200">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition-colors text-left text-sm font-medium"
          >
            <MessageSquarePlus size={18} />
            New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs font-medium text-gray-500 px-2 py-1">Your chats</p>
          {conversations.map((c) => (
            <div
              key={c.id}
              className="group flex items-center gap-1 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <button
                type="button"
                onClick={() => onSelectConversation(c.id)}
                className={`flex-1 min-w-0 text-left px-2 py-2 rounded-lg text-sm truncate ${
                  activeConversationId === c.id ? 'bg-primary-100 text-primary-800' : ''
                }`}
              >
                {c.title || 'Chat'}
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteConversation(e, c.id)}
                className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-70 hover:opacity-100 text-gray-500 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between p-3 border-b bg-primary-600 text-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Bot size={20} />
            <h3 className="font-semibold truncate">{t('tutor.title')}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 hover:bg-primary-700 rounded p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="flex justify-center py-8 text-gray-500 text-sm">Loading...</div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-3 border-t shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={t('tutor.placeholder')}
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="shrink-0 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
