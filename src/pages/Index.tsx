import { useGrowOS } from '@/lib/growos-context';
import { AnimatePresence } from 'framer-motion';
import WelcomeScreen from '@/components/growos/WelcomeScreen';
import QuizScreen from '@/components/growos/QuizScreen';
import ArchetypeReveal from '@/components/growos/ArchetypeReveal';
import GoalSelect from '@/components/growos/GoalSelect';
import HomeScreen from '@/components/growos/HomeScreen';
import StackExecution from '@/components/growos/StackExecution';
import ProtocolsScreen from '@/components/growos/ProtocolsScreen';
import JournalScreen from '@/components/growos/JournalScreen';
import ProfileScreen from '@/components/growos/ProfileScreen';
import UpgradeScreen from '@/components/growos/UpgradeScreen';
import AnalyticsScreen from '@/components/growos/AnalyticsScreen';
import LeadCapture from '@/components/growos/LeadCapture';
import EmailAcademyHub from '@/components/growos/EmailAcademyHub';
import OfflineBanner from '@/components/growos/OfflineBanner';

function AppRouter() {
  const { screen } = useGrowOS();

  const screens: Record<string, React.ReactNode> = {
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
    'analytics': <AnalyticsScreen />,
    'email-academy': <EmailAcademyHub />,
  };

  return (
    <>
      <OfflineBanner />
      <AnimatePresence mode="wait">
        <div key={screen}>{screens[screen]}</div>
      </AnimatePresence>
    </>
  );
}

export default function Index() {
  // Provider is mounted in App.tsx so useGrowOS works on every route.
  // Keeping a defensive wrapper here is safe (nested providers reuse outer context if absent).
  return <AppRouter />;
}
