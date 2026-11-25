import { ADDONS, type AddonId } from '../shared/catalog';
import type { Env } from './env';

const FILE: Record<AddonId, { key: (e: Env) => string; filename: string }> = {
  audio: { key: (e) => e.ADDON_AUDIO_KEY || 'growos/growth-accelerator-audio-pack.zip', filename: 'GrowOS-Growth-Accelerator-Audio-Pack.zip' },
  blueprint: { key: (e) => e.ADDON_BLUEPRINT_KEY || 'growos/90-day-transformation-blueprint.pdf', filename: 'GrowOS-90-Day-Transformation-Blueprint.pdf' },
};

export const isAddon = (x: unknown): x is AddonId => typeof x === 'string' && x in ADDONS;
export const addonFile = (env: Env, id: AddonId) => ({ key: FILE[id].key(env), filename: FILE[id].filename });

/** An add-on is deliverable (and therefore offered for sale) only when its file is in R2. */
export async function addonAvailability(env: Env): Promise<Record<AddonId, boolean>> {
  const out = { audio: false, blueprint: false } as Record<AddonId, boolean>;
  if (!env.ADDON_FILES) return out;
  await Promise.all((Object.keys(out) as AddonId[]).map(async (id) => {
    try { out[id] = Boolean(await env.ADDON_FILES!.head(addonFile(env, id).key)); } catch { out[id] = false; }
  }));
  return out;
}
