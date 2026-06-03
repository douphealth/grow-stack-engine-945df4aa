import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-50 bg-amber-500/95 text-amber-950 text-xs font-semibold py-2 px-4 text-center shadow-lg"
        >
          <span className="inline-flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            Offline — your progress is saved locally and will keep working.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
