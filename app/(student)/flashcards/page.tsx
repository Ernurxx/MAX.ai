'use client'

import { useEffect, useState } from 'react'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { useLanguage } from '@/components/layout/LanguageProvider'
// Temporary: Use local types until Prisma Client is generated
// Once Prisma Client is generated, change this back to: import { Subject, FlashcardCategory } from '@prisma/client'
import { Subject, FlashcardCategory } from '@/types/prisma'
import { motion } from 'framer-motion'
import { Shuffle, ChevronLeft, ChevronRight } from 'lucide-react'

interface Flashcard {
  id: string
  subject: Subject
  category: FlashcardCategory
  front: string
  back: string
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedCategory, setSelectedCategory] =
    useState<FlashcardCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetch('/api/flashcards')
      .then((res) => res.json())
      .then((data) => {
        setFlashcards(data)
        setFilteredCards(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let filtered = flashcards
    if (selectedSubject) {
      filtered = filtered.filter((c) => c.subject === selectedSubject)
    }
    if (selectedCategory) {
      filtered = filtered.filter((c) => c.category === selectedCategory)
    }
    setFilteredCards(filtered)
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [selectedSubject, selectedCategory, flashcards])

  const handleShuffle = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5)
    setFilteredCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const currentCard = filteredCards[currentIndex]

  return (
    <StudentLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('flashcards.title')}
        </h1>

        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSubject === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Subjects
            </button>
            <button
              onClick={() => setSelectedSubject('PHYSICS')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSubject === 'PHYSICS'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('lessons.physics')}
            </button>
            <button
              onClick={() => setSelectedSubject('MATHEMATICS')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSubject === 'MATHEMATICS'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('lessons.mathematics')}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('THEOREM')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'THEOREM'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('flashcards.theorem')}
            </button>
            <button
              onClick={() => setSelectedCategory('FORMULA')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'FORMULA'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('flashcards.formula')}
            </button>
          </div>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            <Shuffle size={20} />
            {t('flashcards.shuffle')}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : !currentCard ? (
          <div className="text-center py-12 text-gray-500">
            No flashcards available.
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="text-sm text-gray-500">
              {currentIndex + 1} / {filteredCards.length}
            </div>

            <motion.div
              className="w-full max-w-2xl h-96 perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ perspective: '1000px' }}
            >
              <motion.div
                className="relative w-full h-full preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-lg p-8 flex items-center justify-center cursor-pointer"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">
                      {currentCard.category === 'THEOREM'
                        ? t('flashcards.theorem')
                        : t('flashcards.formula')}
                    </div>
                    <div className="text-xl font-medium">{currentCard.front}</div>
                    <div className="text-sm text-gray-400 mt-4">
                      {t('flashcards.flip')}
                    </div>
                  </div>
                </div>
                <div
                  className="absolute w-full h-full backface-hidden bg-primary-50 rounded-lg shadow-lg p-8 flex items-center justify-center cursor-pointer"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="text-center">
                    <div className="text-xl font-medium">{currentCard.back}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentIndex(
                    currentIndex > 0 ? currentIndex - 1 : filteredCards.length - 1
                  )
                  setIsFlipped(false)
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
                {t('flashcards.previous')}
              </button>
              <button
                onClick={() => {
                  setCurrentIndex(
                    currentIndex < filteredCards.length - 1
                      ? currentIndex + 1
                      : 0
                  )
                  setIsFlipped(false)
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow hover:bg-gray-50"
              >
                {t('flashcards.next')}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
