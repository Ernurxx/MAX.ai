'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AITutorChat } from './AITutorChat'
import { Bot } from 'lucide-react'

export interface TutorConversationSummary {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export function AITutor() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<TutorConversationSummary[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/tutor-conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(Array.isArray(data) ? data : [])
      }
    } catch {
      setConversations([])
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchConversations()
    }
  }, [isOpen, fetchConversations])

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Bot size={32} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-8 right-8 z-50 w-[420px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
          >
            <AITutorChat
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewChat={() => setActiveConversationId(null)}
              onConversationCreated={setActiveConversationId}
              onClose={() => setIsOpen(false)}
              refetchConversations={fetchConversations}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
