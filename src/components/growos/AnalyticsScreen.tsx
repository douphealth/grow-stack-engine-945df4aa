import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
         ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChevronLeft, TrendingUp, Flame, Brain, Zap } from 'lucide-react';

export default function AnalyticsScreen() {
  const { setScreen, growthScore, streak, completedToday, dailyLogs } = useGrowOS();
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');

  // Real trend data from daily logs
  const trendData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const data = [];
    let runningScore = Math.max(0, growthScore - dailyLogs.reduce((s, l) => s + l.scoreGained, 0));

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);
      const dayLog = dailyLogs.find(l => l.date === dateKey);

      if (dayLog) {
        runningScore += dayLog.scoreGained;
      }

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: runningScore,
      });
    }
    return data;
  }, [growthScore, dailyLogs, timeRange]);

  // Real dimension data from daily logs (aggregate energy/clarity/mood)
  const dimensionData = useMemo(() => {
    const recentLogs = dailyLogs.slice(-14);
    if (recentLogs.length === 0) {
      const base = Math.min(growthScore / 10, 10);
      return [
        { dimension: 'Mindset', value: Math.min(10, Math.max(1, base)), fullMark: 10 },
        { dimension: 'Productivity', value: Math.min(10, Math.max(1, base * 0.8)), fullMark: 10 },
        { dimension: 'Wellness', value: Math.min(10, Math.max(1, base * 0.7)), fullMark: 10 },
        { dimension: 'Confidence', value: Math.min(10, Math.max(1, base * 0.9)), fullMark: 10 },
        { dimension: 'Focus', value: Math.min(10, Math.max(1, base * 0.85)), fullMark: 10 },
        { dimension: 'Habits', value: Math.min(10, Math.max(1, base * 0.75)), fullMark: 10 },
      ];
    }

    const avgEnergy = recentLogs.reduce((s, l) => s + (l.energy || 3), 0) / recentLogs.length;
    const avgClarity = recentLogs.reduce((s, l) => s + (l.clarity || 3), 0) / recentLogs.length;
    const completionRate = recentLogs.filter(l => l.completed).length / Math.max(recentLogs.length, 1);
    const consistencyScore = Math.min(10, streak * 0.7);

    return [
      { dimension: 'Mindset', value: Math.min(10, avgClarity * 1.8), fullMark: 10 },
      { dimension: 'Productivity', value: Math.min(10, completionRate * 9 + 1), fullMark: 10 },
      { dimension: 'Wellness', value: Math.min(10, avgEnergy * 1.8), fullMark: 10 },
      { dimension: 'Confidence', value: Math.min(10, (avgEnergy + avgClarity) * 0.9), fullMark: 10 },
      { dimension: 'Focus', value: Math.min(10, avgClarity * 1.6 + completionRate * 2), fullMark: 10 },
      { dimension: 'Habits', value: Math.min(10, consistencyScore), fullMark: 10 },
    ];
  }, [dailyLogs, growthScore, streak]);

  // Real calendar from daily logs
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);
      const log = dailyLogs.find(l => l.date === dateKey);
      days.push({
        date,
        completed: !!log?.completed,
        day: date.getDate(),
      });
    }
    return days;
  }, [dailyLogs]);

  const weeklyChange = trendData.length > 7
    ? trendData[trendData.length - 1].score - trendData[trendData.length - 8].score
    : trendData[trendData.length - 1].score - trendData[0].score;

  const topDimension = dimensionData.reduce((a, b) => a.value > b.value ? a : b);
  const weakDimension = dimensionData.reduce((a, b) => a.value < b.value ? a : b);
  const totalDaysCompleted = dailyLogs.filter(l => l.completed).length;

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen('home')} className="p-2 rounded-lg bg-secondary text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-heading font-bold text-foreground">Growth Analytics</h1>
      </div>

      {/* Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 mb-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Growth Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-heading font-bold text-foreground">{growthScore}</span>
                <span className={`text-sm font-semibold ${weeklyChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {weeklyChange >= 0 ? '+' : ''}{weeklyChange} this week
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-lg">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-accent">{streak}🔥</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-lg font-heading font-bold text-foreground">{completedToday ? '✅' : '⏳'}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Today</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-lg font-heading font-bold text-primary">{totalDaysCompleted}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Days Done</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-lg font-heading font-bold text-accent">{topDimension.dimension.slice(0, 4)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Strongest</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Growth Score Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Score Trend</p>
          </div>
          <div className="flex gap-1">
            {(['7d', '14d', '30d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  timeRange === r ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 14%, 18%)',
                  borderRadius: '12px',
                  color: 'hsl(210, 20%, 95%)',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(160, 84%, 39%)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {dailyLogs.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2">Complete your first stack to see real data here</p>
        )}
      </motion.div>

      {/* Dimension Radar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 mb-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">Growth Dimensions</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {dailyLogs.length > 0 ? 'Based on your actual check-in data' : 'Complete stacks to see real dimension data'}
        </p>
        <div className="h-64 -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={dimensionData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(220, 14%, 18%)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Growth"
                dataKey="value"
                stroke="hsl(160, 84%, 39%)"
                fill="hsl(160, 84%, 39%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5 mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">30-Day Activity</p>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <p key={i} className="text-[10px] text-muted-foreground text-center font-medium">{d}</p>
          ))}
          {Array.from({ length: calendarDays[0]?.date.getDay() || 0 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${
                day.completed
                  ? 'bg-primary/30 text-primary'
                  : 'bg-secondary/50 text-muted-foreground'
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Insights</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-primary/5 rounded-xl p-3">
            <span className="text-lg">💪</span>
            <div>
              <p className="text-sm font-medium text-foreground">Strong in {topDimension.dimension}</p>
              <p className="text-xs text-muted-foreground">Your top dimension. Keep pushing!</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-accent/5 rounded-xl p-3">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-sm font-medium text-foreground">Focus on {weakDimension.dimension}</p>
              <p className="text-xs text-muted-foreground">This dimension needs attention. Try related protocols.</p>
            </div>
          </div>
          {streak >= 7 && (
            <div className="flex items-start gap-3 bg-accent/5 rounded-xl p-3">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-sm font-medium text-foreground">{streak}-Day Streak!</p>
                <p className="text-xs text-muted-foreground">Consistency is your superpower.</p>
              </div>
            </div>
          )}
          {totalDaysCompleted >= 10 && (
            <div className="flex items-start gap-3 bg-primary/5 rounded-xl p-3">
              <span className="text-lg">🏆</span>
              <div>
                <p className="text-sm font-medium text-foreground">{totalDaysCompleted} Days Completed</p>
                <p className="text-xs text-muted-foreground">You're building a real growth habit!</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
