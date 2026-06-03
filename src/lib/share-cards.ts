import { GrowthArchetype } from './growos-data';

interface ShareCardData {
  archetype: GrowthArchetype;
  userName: string;
  growthScore?: number;
  streak?: number;
}

const DIMENSION_COLORS: Record<string, string> = {
  mindset: '#34d399',
  productivity: '#60a5fa',
  wellness: '#22d3ee',
  confidence: '#fbbf24',
  focus: '#fb7185',
  habits: '#a78bfa',
};

function getArchetypeColors(color: string): [string, string] {
  const map: Record<string, [string, string]> = {
    'from-amber-500 to-orange-600': ['#f59e0b', '#ea580c'],
    'from-blue-500 to-indigo-600': ['#3b82f6', '#4f46e5'],
    'from-cyan-400 to-teal-600': ['#22d3ee', '#0d9488'],
    'from-red-500 to-orange-500': ['#ef4444', '#f97316'],
    'from-violet-500 to-purple-600': ['#8b5cf6', '#9333ea'],
    'from-emerald-500 to-green-600': ['#10b981', '#16a34a'],
    'from-yellow-400 to-amber-500': ['#facc15', '#f59e0b'],
    'from-green-400 to-emerald-500': ['#4ade80', '#10b981'],
    'from-rose-500 to-red-600': ['#f43f5e', '#dc2626'],
    'from-teal-400 to-cyan-600': ['#2dd4bf', '#0891b2'],
    'from-sky-400 to-blue-600': ['#38bdf8', '#2563eb'],
    'from-amber-400 to-yellow-500': ['#fbbf24', '#eab308'],
  };
  return map[color] || ['#10b981', '#0d9488'];
}

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d')!;

  const [color1, color2] = getArchetypeColors(data.archetype.color);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, '#0f1420');
  bgGrad.addColorStop(0.5, '#141c2b');
  bgGrad.addColorStop(1, '#0f1420');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Decorative circles
  ctx.globalAlpha = 0.08;
  const circGrad = ctx.createRadialGradient(540, 700, 0, 540, 700, 500);
  circGrad.addColorStop(0, color1);
  circGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = circGrad;
  ctx.fillRect(0, 200, 1080, 1000);
  ctx.globalAlpha = 1;

  // Top badge
  ctx.fillStyle = '#ffffff15';
  roundRect(ctx, 380, 120, 320, 50, 25);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR GROWTH DNA', 540, 152);

  // Emoji
  ctx.font = '160px serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.archetype.emoji, 540, 450);

  // Archetype name
  const nameGrad = ctx.createLinearGradient(200, 500, 880, 550);
  nameGrad.addColorStop(0, color1);
  nameGrad.addColorStop(1, color2);
  ctx.fillStyle = nameGrad;
  ctx.font = 'bold 72px Space Grotesk, sans-serif';
  ctx.fillText(data.archetype.name, 540, 560);

  // Title
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 36px Space Grotesk, sans-serif';
  ctx.fillText(data.archetype.title, 540, 620);

  // Divider line
  const divGrad = ctx.createLinearGradient(340, 670, 740, 670);
  divGrad.addColorStop(0, 'transparent');
  divGrad.addColorStop(0.5, color1 + '60');
  divGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(340, 670);
  ctx.lineTo(740, 670);
  ctx.stroke();

  // Description
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 28px Inter, sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, data.archetype.description, 540, 730, 700, 40);

  // Strengths & Growth areas
  const boxY = 900;
  ctx.fillStyle = '#ffffff08';
  roundRect(ctx, 80, boxY, 440, 300, 20);
  ctx.fill();
  roundRect(ctx, 560, boxY, 440, 300, 20);
  ctx.fill();

  // Strengths
  ctx.fillStyle = color1;
  ctx.font = 'bold 22px Space Grotesk, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('STRENGTHS', 120, boxY + 45);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 26px Inter, sans-serif';
  data.archetype.strengths.forEach((s, i) => {
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.arc(130, boxY + 90 + i * 50, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(s, 150, boxY + 97 + i * 50);
  });

  // Growth areas
  ctx.fillStyle = color2;
  ctx.font = 'bold 22px Space Grotesk, sans-serif';
  ctx.fillText('GROWTH AREAS', 600, boxY + 45);
  data.archetype.growthAreas.forEach((g, i) => {
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.arc(610, boxY + 90 + i * 50, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 26px Inter, sans-serif';
    ctx.fillText(g, 630, boxY + 97 + i * 50);
  });

  // Stats bar
  if (data.growthScore !== undefined) {
    const statY = 1320;
    ctx.fillStyle = '#ffffff08';
    roundRect(ctx, 80, statY, 920, 100, 20);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = color1;
    ctx.font = 'bold 36px Space Grotesk, sans-serif';
    ctx.fillText(String(data.growthScore), 310, statY + 55);
    ctx.fillStyle = '#64748b';
    ctx.font = '400 20px Inter, sans-serif';
    ctx.fillText('Growth Score', 310, statY + 82);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px Space Grotesk, sans-serif';
    ctx.fillText(`${data.streak || 0}🔥`, 770, statY + 55);
    ctx.fillStyle = '#64748b';
    ctx.font = '400 20px Inter, sans-serif';
    ctx.fillText('Day Streak', 770, statY + 82);
  }

  // Username
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 32px Inter, sans-serif';
  ctx.fillText(`${data.userName}'s Growth DNA`, 540, 1560);

  // CTA
  const ctaGrad = ctx.createLinearGradient(290, 1630, 790, 1630);
  ctaGrad.addColorStop(0, color1);
  ctaGrad.addColorStop(1, color2);
  ctx.fillStyle = ctaGrad;
  roundRect(ctx, 290, 1610, 500, 65, 32);
  ctx.fill();
  ctx.fillStyle = '#0f1420';
  ctx.font = 'bold 26px Space Grotesk, sans-serif';
  ctx.fillText('Discover yours → gearuptogrow.com', 540, 1650);

  // GrowOS branding
  ctx.fillStyle = '#475569';
  ctx.font = '400 22px Inter, sans-serif';
  ctx.fillText('⚡ GrowOS — Your Personal Growth Operating System', 540, 1770);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export async function generateStreakCard(
  userName: string,
  streak: number,
  growthScore: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
  bgGrad.addColorStop(0, '#0f1420');
  bgGrad.addColorStop(1, '#141c2b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.globalAlpha = 0.1;
  const glow = ctx.createRadialGradient(540, 400, 0, 540, 400, 400);
  glow.addColorStop(0, '#fbbf24');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.font = '200px serif';
  ctx.fillText('🔥', 540, 380);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 120px Space Grotesk, sans-serif';
  ctx.fillText(`${streak}`, 540, 530);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 48px Space Grotesk, sans-serif';
  ctx.fillText('DAY STREAK', 540, 600);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 32px Inter, sans-serif';
  ctx.fillText(`${userName} • Growth Score: ${growthScore}`, 540, 700);

  ctx.fillStyle = '#10b981';
  roundRect(ctx, 290, 800, 500, 65, 32);
  ctx.fill();
  ctx.fillStyle = '#0f1420';
  ctx.font = 'bold 26px Space Grotesk, sans-serif';
  ctx.fillText('Join me → gearuptogrow.com', 540, 840);

  ctx.fillStyle = '#475569';
  ctx.font = '400 20px Inter, sans-serif';
  ctx.fillText('⚡ GrowOS', 540, 980);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export async function shareToNative(blob: Blob, title: string, text: string) {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], 'growos-card.png', { type: 'image/png' });
    const shareData = { title, text, files: [file] };
    if (navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return;
    }
  }
  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'growos-card.png';
  a.click();
  URL.revokeObjectURL(url);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}
