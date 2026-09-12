import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ message: 'Méthode non autorisée.' }, 405);

  try {
    const { pseudo, password } = await req.json();
    const wantedPseudo = String(pseudo || '').trim();
    const wantedPassword = String(password || '');

    if (!wantedPseudo || !wantedPassword) {
      return json({ message: 'Identifiants invalides.' }, 400);
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
    const secretKey = secretKeys ? JSON.parse(secretKeys).default : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const publishKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
    const publishKey = publishKeys ? JSON.parse(publishKeys).default : Deno.env.get('SUPABASE_ANON_KEY');

    if (!secretKey || !publishKey) {
      return json({ message: 'Service d’authentification non configuré.' }, 500);
    }

    const admin = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const publicClient = createClient(url, publishKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id')
      .eq('pseudo', wantedPseudo)
      .maybeSingle();

    if (profileError || !profile?.id) {
      return json({ message: 'Connexion impossible. Vérifie ton pseudo et ton mot de passe.' }, 401);
    }

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (userError || !email) {
      return json({ message: 'Connexion impossible. Vérifie ton pseudo et ton mot de passe.' }, 401);
    }

    const { data: session, error: signInError } = await publicClient.auth.signInWithPassword({
      email,
      password: wantedPassword
    });

    if (signInError || !session?.session) {
      return json({ message: 'Connexion impossible. Vérifie ton pseudo et ton mot de passe.' }, 401);
    }

    return json(session.session, 200);
  } catch {
    return json({ message: 'Connexion impossible. Vérifie tes identifiants.' }, 400);
  }
});
