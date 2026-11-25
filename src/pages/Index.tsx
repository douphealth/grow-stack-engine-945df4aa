import { lazy, Suspense, type ReactNode } from 'react';
import { useGrowOS } from '@/lib/growos-context';
import { AnimatePresence } from 'framer-motion';
import WelcomeScreen from '@/components/growos/WelcomeScreen';
import QuizScreen from '@/components/growos/QuizScreen';
import HomeScreen from '@/components/growos/HomeScreen';
import OfflineBanner from '@/components/growos/OfflineBanner';

// Code-split everything that is not on the first paint for a new or returning visitor.
// recharts (Analytics), jsPDF (Profile) and supabase-js (LeadCapture/Academy) were ~1 MB of the
// single 1.6 MB bundle that every phone had to parse before the welcome screen.
const LeadCapture = lazy(() => import('@/components/growos/LeadCapture'));
const ArchetypeReveal = lazy(() => import('@/components/growos/ArchetypeReveal'));
const GoalSelect = lazy(() => import('@/components/growos/GoalSelect'));
const StackExecution = lazy(() => import('@/components/growos/StackExecution'));
const ProtocolsScreen = lazy(() => import('@/components/growos/ProtocolsScreen'));
const JournalScreen = lazy(() => import('@/components/growos/JournalScreen'));
const ProfileScreen = lazy(() => import('@/components/growos/ProfileScreen'));
const UpgradeScreen = lazy(() => import('@/components/growos/UpgradeScreen'));
const PurchaseSuccess = lazy(() => import('@/components/growos/PurchaseSuccess'));
const AnalyticsScreen = lazy(() => import('@/components/growos/AnalyticsScreen'));
const EmailAcademyHub = lazy(() => import('@/components/growos/EmailAcademyHub'));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
    <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

function AppRouter() {
  const { screen } = useGrowOS();

  const screens: Record<string, ReactNode> = {
    'welcome': <WelcomeScreen />,
    'quiz': <QuizScreen />,
    'lead-capture': <LeadCapture />,
    'archetype-reveal': <ArchetypeReveal />,
    'goal-select': <GoalSelect />,
    'home': <HomeScreen />,
    'stack-execution': <StackExecution />,
    'protocols': <ProtocolsScreen />,
    'journal': <JournalScreen />,
    'profile': <ProfileScreen />,
    'upgrade': <UpgradeScreen />,
    'purchase-success': <PurchaseSuccess />,
    'analytics': <AnalyticsScreen />,
    'email-academy': <EmailAcademyHub />,
  };

  return (
    <>
      <OfflineBanner />
      <Suspense fallback={<Loading />}>
        <AnimatePresence mode="wait">
          <div key={screen}>{screens[screen] ?? <HomeScreen />}</div>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export default function Index() {
  return <AppRouter />;
}
