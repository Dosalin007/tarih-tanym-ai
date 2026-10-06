import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const url = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const usernamePattern = /^[a-z0-9_.-]{3,32}$/;
function temporaryPassword(): string {
  // 128 bits from a cryptographic RNG; never log or persist the plaintext.
  return 'Tt9!' + Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
}
Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(x => x.trim()).filter(Boolean);
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
  if (origin && allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (origin && !allowed.includes(origin)) return reply({ error: 'Origin not allowed' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return reply({ error: 'Unauthorized' }, 401);
  try {
    // Never authorize with a role supplied by the browser or user_metadata.
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth.user) return reply({ error: 'Unauthorized' }, 401);
    const { data: actor, error: actorError } = await db.from('profiles').select('*').eq('id', auth.user.id).single();
    if (actorError || !actor || actor.blocked) return reply({ error: 'Forbidden' }, 403);
    const raw = await req.text();
    if (raw.length > 4096) return reply({ error: 'Request too large' }, 413);
    let input;
    try { input = JSON.parse(raw); } catch { return reply({ error: 'Invalid JSON' }, 400); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply({ error: 'Invalid request' }, 400);
    if (input.action === 'change_password') {
      if (typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 128) return reply({ error: 'Пароль: 12–128 символов.' }, 400);
      if (typeof input.currentPassword !== 'string' || input.currentPassword.length > 128 || input.currentPassword === input.password) return reply({ error: 'Введите текущий пароль и выберите другой новый пароль.' }, 400);
      // Reauthenticate: an old session must not bypass an admin-issued password reset.
      const verifier = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: verified, error: verifyError } = await verifier.auth.signInWithPassword({ email: actor.username + '@accounts.tarih.invalid', password: input.currentPassword });
      if (verifyError || verified.user?.id !== actor.id) return reply({ error: 'Текущий пароль неверен.' }, 403);
      await verifier.auth.signOut({ scope: 'local' });
      const { error } = await db.auth.admin.updateUserById(actor.id, { password: input.password });
      if (error) return reply({ error: 'Пароль не изменён. Выберите другой пароль и повторите.' }, 400);
      const { error: profileError } = await db.from('profiles').update({ must_change_password: false }).eq('id', actor.id);
      if (profileError) return reply({ error: 'Пароль изменён, но профиль не обновлён. Обратитесь к администратору.' }, 500);
      return reply({ ok: true });
    }
    if (actor.role !== 'admin' || actor.must_change_password) return reply({ error: 'Forbidden' }, 403);
    if (input.action === 'list') {
      // Explicit pagination avoids Supabase's default 1000-row truncation.
      const rows = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db.from('profiles').select('id,username,name,role,grade,blocked,must_change_password').order('id').range(offset, offset + 499);
        if (error) return reply({ error: 'Не удалось загрузить пользователей.' }, 500);
        rows.push(...data);
        if (data.length < 500) break;
      }
      return reply({ data: rows });
    }
    if (input.action === 'create') {
      const username = typeof input.username === 'string' ? input.username.trim().toLowerCase() : '';
      const name = typeof input.name === 'string' ? input.name.trim() : '';
      const role = input.role;
      const grade = role === 'student' ? input.grade : null;
      if (!usernamePattern.test(username) || !name || name.length > 100 || !['teacher', 'student'].includes(role) || (role === 'student' && (!Number.isInteger(grade) || grade < 5 || grade > 11))) return reply({ error: 'Проверьте логин, имя, роль и класс.' }, 400);
      const password = temporaryPassword();
      const { data, error } = await db.auth.admin.createUser({ email: username + '@accounts.tarih.invalid', password, email_confirm: true });
      if (error || !data.user) return reply({ error: 'Аккаунт не создан. Возможно, логин уже занят.' }, 400);
      const { error: profileError } = await db.from('profiles').insert({ id: data.user.id, username, name, role, grade, must_change_password: true });
      if (profileError) {
        // Roll back the Auth user if profile creation fails; a profile-less account has no access regardless.
        const { error: rollbackError } = await db.auth.admin.deleteUser(data.user.id);
        if (rollbackError) console.error('Account rollback requires manual cleanup:', data.user.id);
        return reply({ error: 'Профиль не создан. Обратитесь к администратору.' }, 500);
      }
      return reply({ username, password }, 201);
    }
    if (!['update', 'block', 'reset_password'].includes(input.action) || typeof input.id !== 'string') return reply({ error: 'Invalid action' }, 400);
    const { data: target, error: targetError } = await db.from('profiles').select('*').eq('id', input.id).single();
    // Admin bootstrap and changes to admins are deliberately out of this public-facing endpoint.
    if (targetError || !target || target.role === 'admin' || target.id === actor.id) return reply({ error: 'Операция запрещена.' }, 403);
    if (input.action === 'update') {
      if (!['teacher', 'student'].includes(input.role) || (input.role === 'student' && (!Number.isInteger(input.grade) || input.grade < 5 || input.grade > 11))) return reply({ error: 'Недопустимая роль или класс.' }, 400);
      const { error } = await db.from('profiles').update({ role: input.role, grade: input.role === 'student' ? input.grade : null }).eq('id', target.id);
      if (error) return reply({ error: 'Профиль не обновлён.' }, 500);
    } else if (input.action === 'block') {
      if (typeof input.blocked !== 'boolean') return reply({ error: 'Invalid status' }, 400);
      // Profile is authoritative for all access checks, including already issued tokens.
      const { error } = await db.from('profiles').update({ blocked: input.blocked }).eq('id', target.id);
      if (error) return reply({ error: 'Статус не изменён.' }, 500);
    } else {
      const password = temporaryPassword();
      // Fail closed: require a password change before modifying Auth credentials.
      const { error: flagError } = await db.from('profiles').update({ must_change_password: true }).eq('id', target.id);
      if (flagError) return reply({ error: 'Сброс не выполнен.' }, 500);
      const { error } = await db.auth.admin.updateUserById(target.id, { password });
      if (error) return reply({ error: 'Пароль не сброшен. Повторите операцию; доступ ограничен до смены пароля.' }, 500);
      return reply({ username: target.username, password });
    }
    return reply({ ok: true });
  } catch {
    // Never include passwords, tokens, or provider internals in errors or logs.
    return reply({ error: 'Операция не выполнена. Повторите позже.' }, 500);
  }
});
