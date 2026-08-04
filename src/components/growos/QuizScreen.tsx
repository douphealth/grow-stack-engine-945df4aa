import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { QUIZ_QUESTIONS, calculateArchetype } from '@/lib/growos-data';
import { ChevronLeft } from 'lucide-react';

export default function QuizScreen() {
  const {
    setScreen,
    setArchetype,
    quizAnswers,
    setQuizAnswers,
    quizQuestionIndex,
    setQuizQuestionIndex,
    setLeadCaptureStage,
    userEmail,
  } = useGrowOS();
  const [currentQ, setCurrentQ] = useState(quizQuestionIndex);
  const [answers, setAnswers] = useState<Record<number, string>>(quizAnswers);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setCurrentQ(quizQuestionIndex);
    setAnswers(quizAnswers);
  }, [quizQuestionIndex, quizAnswers]);

  const question = QUIZ_QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUIZ_QUESTIONS.length) * 100;

  const advanceTo = (nextIndex: number) => {
    setQuizQuestionIndex(nextIndex);
    setCurrentQ(nextIndex);
  };

  const handleSelect = (archetypeId: string) => {
    const newAnswers = { ...answers, [question.id]: archetypeId };
    setAnswers(newAnswers);
    setQuizAnswers(newAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setDirection(1);
      window.setTimeout(() => {
        const nextIndex = currentQ + 1;
        // Capture the lead after Question 2, before showing Question 3.
        if (nextIndex === 2 && !userEmail) {
          setQuizQuestionIndex(nextIndex);
          setLeadCaptureStage('mid-quiz');
          setScreen('lead-capture');
          return;
        }
        advanceTo(nextIndex);
      }, 300);
    } else {
      const result = calculateArchetype(newAnswers);
      setArchetype(result);
      setLeadCaptureStage('results');
      setScreen('lead-capture');
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            if (currentQ > 0) {
              setDirection(-1);
              advanceTo(currentQ - 1);
            } else {
              setScreen('welcome');
            }
          }}
          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {currentQ + 1}/{QUIZ_QUESTIONS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: direction * 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -direction * 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
            Growth DNA Quiz
          </h2>
          <p className="text-lg text-foreground/80 mb-8">
            {question.question}
          </p>

          <div className="space-y-3 flex-1">
            {question.options.map((opt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSelect(opt.archetype)}
                className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all active:scale-[0.98] ${
                  answers[question.id] === opt.archetype
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'glass-card hover:bg-secondary/80'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-foreground font-medium">{opt.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
