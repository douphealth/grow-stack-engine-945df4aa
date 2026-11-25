/** GET /api/config → which purchase features this deployment can actually deliver. */
import type { Ctx } from '../../server/env';
import { json } from '../../server/http';
import { addonAvailability } from '../../server/addons';
import { mailConfigured } from '../../server/mail';

export const onRequestGet = async ({ env }: Ctx) => {
  const licensing = Boolean(env.DB && env.LICENSE_SECRET);
  return json(
    {
      licensing,
      verifiedCheckout: licensing && Boolean(env.STRIPE_SECRET_KEY || env.STRIPE_WEBHOOK_SECRET),
      restoreByEmail: licensing && mailConfigured(env),
      addons: await addonAvailability(env),
    },
    200,
    { 'cache-control': 'public, max-age=60' },
  );
};
