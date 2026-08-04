import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GrowthArchetype, MicroAction, MORNING_STACK, ARCHETYPES } from './growos-data';

export type AppScreen =
  | 'welcome'
  | 'quiz'
  | 'lead-capture'
  | 'archetype-reveal'
  | 'goal-select'
  | 'home'
  | 'checkin'
  | 'execute'
  | 'stack-execution'
  | 'protocols'
  | 'journal'
  | 'profile'
  | 'upgrade'
  | 'analytics'
  | 'email-academy';

interface ActiveProtocol {
  id: string;
  day: number;
  totalDays: number;
}

export interface JournalEntry {
  id: string;
  text: string;
  prompt: string;
  date: string; // ISO date string
  time: string;
  mood?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
  scoreGained: number;
  energy?: number;
  clarity?: number;
  mood?: string;
  stackLength?: number;
}

export interface GrowOSContextValue {
  // Navigation
  screen: AppScreen;
  setScreen: (s: AppScreen) => void;

  // User
  userName: string;
  setUserName: (n: string) => void;

  // Archetype
  archetype: GrowthArchetype | null;
  setArchetype: (a: GrowthArchetype) => void;

  // Goals
  primaryGoal: string;
  setPrimaryGoal: (g: string) => void;

  // Scores
  growthScore: number;
  setGrowthScore: (s: number) => void;
  streak: number;
  setStreak: (s: number) => void;

  // Daily
  completedToday: boolean;
  setCompletedToday: (b: boolean) => void;
  hasCheckedIn: boolean;
  setHasCheckedIn: (b: boolean) => void;

  // State check-in
  energy: number;
  setEnergy: (n: number) => void;
  clarity: number;
  setClarity: (n: number) => void;
  mood: string;
  setMood: (m: string) => void;
  timeAvailable: number;
  setTimeAvailable: (n: number) => void;

  // Stack
  currentStack: MicroAction[];
  setCurrentStack: (s: MicroAction[]) => void;

  // Protocol
  activeProtocol: ActiveProtocol | null;
  setActiveProtocol: (p: ActiveProtocol | null) => void;

  // Premium
  isPro: boolean;
  setIsPro: (b: boolean) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;

  // Daily logs (for real analytics)
  dailyLogs: DailyLog[];
  logDailyCompletion: (scoreGained: number) => void;

  // Notifications
  notificationsEnabled: boolean;
  notificationTime: string; // HH:MM
  setNotificationsEnabled: (b: boolean) => Promise<void>;
  setNotificationTime: (t: string) => void;

  // Lead & Academy Email
  userEmail: string;
  setUserEmail: (email: string) => void;
  subscribedToAcademy: boolean;
  setSubscribedToAcademy: (subbed: boolean) => void;
  // Quiz progress survives the email gate between Question 2 and Question 3.
  quizAnswers: Record<number, string>;
  setQuizAnswers: (answers: Record<number, string>) => void;
  quizQuestionIndex: number;
  setQuizQuestionIndex: (index: number) => void;
  leadCaptureStage: 'mid-quiz' | 'results';
  setLeadCaptureStage: (stage: 'mid-quiz' | 'results') => void;
  academyEmailsRead: Record<number, boolean>;
  markEmailAsRead: (day: number) => void;

  // Computed
  todayKey: string;
}

const GrowOSContext = createContext<GrowOSContextValue | undefined>(undefined);

const STORAGE_KEY = 'growos-state-v4';
const JOURNAL_KEY = 'growos-journal-v1';
const LOGS_KEY = 'growos-daily-logs-v1';
const NOTIF_KEY = 'growos-notifications-v1';

let notifTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleDailyNotification(time: string) {
  if (notifTimer) clearTimeout(notifTimer);
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  notifTimer = setTimeout(() => {
    try {
      new Notification('🌱 Time for your Growth Stack', {
        body: 'A few micro-actions today keep your streak alive.',
        icon: '/placeholder.svg',
      });
    } catch (e) { console.warn(e); }
    scheduleDailyNotification(time);
  }, delay);
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function calculateStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;
  const sorted = [...logs].filter(l => l.completed).sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return 0;

  const today = getTodayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  // Streak must include today or yesterday
  if (sorted[0].date !== today && sorted[0].date !== yesterdayKey) return 0;

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i].date);
    const prev = new Date(sorted[i + 1].date);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function GrowOSProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [subscribedToAcademy, setSubscribedToAcademy] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [leadCaptureStage, setLeadCaptureStage] = useState<'mid-quiz' | 'results'>('results');
  const [academyEmailsRead, setAcademyEmailsRead] = useState<Record<number, boolean>>({});
  const [archetype, setArchetype] = useState<GrowthArchetype | null>(null);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [growthScore, setGrowthScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [energy, setEnergy] = useState(3);
  const [clarity, setClarity] = useState(3);
  const [mood, setMood] = useState('😊');
  const [timeAvailable, setTimeAvailable] = useState(10);
  const [currentStack, setCurrentStack] = useState<MicroAction[]>(MORNING_STACK);
  const [activeProtocol, setActiveProtocol] = useState<ActiveProtocol | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [notificationTime, setNotificationTime] = useState('08:00');

  const todayKey = getTodayKey();

  // Handle payment success from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setIsPro(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.userName) setUserName(data.userName);
        if (data.userEmail) setUserEmail(data.userEmail);
        if (data.subscribedToAcademy !== undefined) setSubscribedToAcademy(data.subscribedToAcademy);
        if (data.quizAnswers) setQuizAnswers(data.quizAnswers);
        if (typeof data.quizQuestionIndex === 'number') setQuizQuestionIndex(data.quizQuestionIndex);
        if (data.leadCaptureStage === 'mid-quiz' || data.leadCaptureStage === 'results') setLeadCaptureStage(data.leadCaptureStage);
        if (data.archetypeId) {
          const found = ARCHETYPES.find(a => a.id === data.archetypeId);
          if (found) setArchetype(found);
        }
        if (data.primaryGoal) setPrimaryGoal(data.primaryGoal);
        if (data.growthScore) setGrowthScore(data.growthScore);
        if (data.isPro) setIsPro(data.isPro);
        if (data.activeProtocol) setActiveProtocol(data.activeProtocol);

        // Date-aware daily reset
        const today = getTodayKey();
        if (data.lastCompletedDate === today) {
          setCompletedToday(true);
          setHasCheckedIn(true);
        }

        if (data.userName && data.archetypeId) {
          setScreen(data.screen && data.screen !== 'welcome' ? data.screen : 'home');
        } else if (data.screen) {
          setScreen(data.screen);
        }
      }

      // Load notification prefs
      const notifRaw = localStorage.getItem(NOTIF_KEY);
      if (notifRaw) {
        const n = JSON.parse(notifRaw);
        if (n.time) setNotificationTime(n.time);
        if (n.enabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          setNotificationsEnabledState(true);
          scheduleDailyNotification(n.time || '08:00');
        }
      }

      // Load academy emails read status
      const academyReadRaw = localStorage.getItem('growos-academy-read-v1');
      if (academyReadRaw) {
        setAcademyEmailsRead(JSON.parse(academyReadRaw));
      }

      // Load journal
      const journalRaw = localStorage.getItem(JOURNAL_KEY);
      if (journalRaw) {
        setJournalEntries(JSON.parse(journalRaw));
      }

      // Load daily logs & calculate streak
      const logsRaw = localStorage.getItem(LOGS_KEY);
      if (logsRaw) {
        const logs: DailyLog[] = JSON.parse(logsRaw);
        setDailyLogs(logs);
        setStreak(calculateStreak(logs));
      }
    } catch (e) {
      console.warn('GrowOS: Failed to load state', e);
    }
  }, []);

  // Persist main state
  useEffect(() => {
    if (!userName) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        userName,
        userEmail,
        subscribedToAcademy,
        quizAnswers,
        quizQuestionIndex,
        leadCaptureStage,
        archetypeId: archetype?.id || null,
        primaryGoal,
        growthScore,
        isPro,
        activeProtocol,
        screen,
        lastCompletedDate: completedToday ? getTodayKey() : null,
      }));
    } catch (e) {
      console.warn('GrowOS: Failed to save state', e);
    }
  }, [userName, userEmail, subscribedToAcademy, quizAnswers, quizQuestionIndex, leadCaptureStage, archetype, primaryGoal, growthScore, isPro, activeProtocol, completedToday, screen]);

  // Persist journal
  useEffect(() => {
    if (journalEntries.length > 0) {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(journalEntries));
    }
  }, [journalEntries]);

  // Persist daily logs
  useEffect(() => {
    if (dailyLogs.length > 0) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(dailyLogs));
    }
  }, [dailyLogs]);

  const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  const logDailyCompletion = (scoreGained: number) => {
    const today = getTodayKey();
    // Prevent double-logging same day
    if (dailyLogs.some(l => l.date === today && l.completed)) return;

    const newLog: DailyLog = {
      date: today,
      completed: true,
      scoreGained,
      energy,
      clarity,
      mood,
      stackLength: currentStack.length,
    };
    const updatedLogs = [...dailyLogs, newLog];
    setDailyLogs(updatedLogs);
    setStreak(calculateStreak(updatedLogs));
    setCompletedToday(true);
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    if (enabled) {
      if (typeof Notification === 'undefined') {
        console.warn('Notifications unsupported');
        return;
      }
      let perm = Notification.permission;
      if (perm === 'default') perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
      setNotificationsEnabledState(true);
      scheduleDailyNotification(notificationTime);
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: true, time: notificationTime }));
    } else {
      setNotificationsEnabledState(false);
      if (notifTimer) { clearTimeout(notifTimer); notifTimer = null; }
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: false, time: notificationTime }));
    }
  };

  const updateNotificationTime = (t: string) => {
    setNotificationTime(t);
    localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: notificationsEnabled, time: t }));
    if (notificationsEnabled) scheduleDailyNotification(t);
  };

  const markEmailAsRead = (day: number) => {
    setAcademyEmailsRead(prev => {
      const next = { ...prev, [day]: true };
      localStorage.setItem('growos-academy-read-v1', JSON.stringify(next));
      return next;
    });
  };

  const value: GrowOSContextValue = {
    screen, setScreen,
    userName, setUserName,
    userEmail, setUserEmail,
    subscribedToAcademy, setSubscribedToAcademy,
    quizAnswers, setQuizAnswers,
    quizQuestionIndex, setQuizQuestionIndex,
    leadCaptureStage, setLeadCaptureStage,
    academyEmailsRead, markEmailAsRead,
    archetype, setArchetype,
    primaryGoal, setPrimaryGoal,
    growthScore, setGrowthScore,
    streak, setStreak,
    completedToday, setCompletedToday,
    hasCheckedIn, setHasCheckedIn,
    energy, setEnergy,
    clarity, setClarity,
    mood, setMood,
    timeAvailable, setTimeAvailable,
    currentStack, setCurrentStack,
    activeProtocol, setActiveProtocol,
    isPro, setIsPro,
    journalEntries, addJournalEntry,
    dailyLogs, logDailyCompletion,
    notificationsEnabled, notificationTime,
    setNotificationsEnabled, setNotificationTime: updateNotificationTime,
    todayKey,
  };

  return <GrowOSContext.Provider value={value}>{children}</GrowOSContext.Provider>;
}

export function useGrowOS(): GrowOSContextValue {
  const context = useContext(GrowOSContext);
  if (!context) {
    throw new Error('useGrowOS must be used within a <GrowOSProvider>');
  }
  return context;
}
