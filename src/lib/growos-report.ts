import jsPDF from 'jspdf';
import type { DailyLog, JournalEntry } from './growos-context';
import type { GrowthArchetype } from './growos-data';

interface ReportData {
  userName: string;
  archetype: GrowthArchetype | null;
  growthScore: number;
  streak: number;
  isPro: boolean;
  dailyLogs: DailyLog[];
  journalEntries: JournalEntry[];
}

export function generateGrowthReport(data: ReportData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 100, 'F');
  doc.setTextColor(0, 255, 170);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('GrowOS — Growth Report', margin, 50);
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(new Date().toLocaleDateString(undefined, { dateStyle: 'long' }), margin, 72);
  y = 130;

  // Identity
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(data.userName || 'Anonymous Grower', margin, y);
  y += 22;
  if (data.archetype) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`${data.archetype.name} — ${data.archetype.title}`, margin, y);
    y += 24;
  }

  // Stats grid
  const totalCompleted = data.dailyLogs.filter(l => l.completed).length;
  const totalScore = data.dailyLogs.reduce((s, l) => s + (l.scoreGained || 0), 0);
  const stats = [
    ['Growth Score', String(data.growthScore)],
    ['Day Streak', String(data.streak)],
    ['Stacks Completed', String(totalCompleted)],
    ['Total Score Gained', String(totalScore)],
    ['Journal Entries', String(data.journalEntries.length)],
    ['Status', data.isPro ? 'PRO' : 'Free'],
  ];

  const cellW = (pageW - margin * 2) / 3;
  const cellH = 60;
  stats.forEach((stat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * cellW;
    const cy = y + row * cellH;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x + 4, cy, cellW - 8, cellH - 8, 6, 6, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(stat[0].toUpperCase(), x + 14, cy + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(stat[1], x + 14, cy + 42);
  });
  y += Math.ceil(stats.length / 3) * cellH + 16;

  // Completed Stacks log
  ensureSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Completed Growth Stacks', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const sortedLogs = [...data.dailyLogs]
    .filter(l => l.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sortedLogs.length === 0) {
    doc.setTextColor(140, 140, 140);
    doc.text('No completed stacks yet — start one today!', margin, y);
    y += 18;
  } else {
    sortedLogs.forEach(log => {
      ensureSpace(18);
      const parts = [
        log.date,
        `+${log.scoreGained} pts`,
        `${log.stackLength ?? '–'} actions`,
        log.energy != null ? `Energy ${log.energy}/5` : null,
        log.clarity != null ? `Clarity ${log.clarity}/5` : null,
        log.mood ? `Mood ${log.mood}` : null,
      ].filter(Boolean).join('   ·   ');
      doc.text(parts, margin, y);
      y += 14;
    });
  }

  // Journal preview
  if (data.journalEntries.length > 0) {
    y += 14;
    ensureSpace(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Recent Reflections', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    data.journalEntries.slice(0, 10).forEach(entry => {
      const dateStr = new Date(entry.date).toLocaleDateString();
      const lines = doc.splitTextToSize(`${dateStr} — ${entry.text}`, pageW - margin * 2);
      ensureSpace(lines.length * 12 + 6);
      doc.text(lines, margin, y);
      y += lines.length * 12 + 6;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`GrowOS · gearuptogrow.com · Page ${p} of ${pageCount}`, margin, pageH - 24);
  }

  const fname = `growos-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fname);
}
