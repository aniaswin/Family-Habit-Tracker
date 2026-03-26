const { cloneDefaultData } = require('./default-data');

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getBaseUrl() {
  return `${getEnv('SUPABASE_URL').replace(/\/$/, '')}/rest/v1`;
}

function getHeaders(extra = {}) {
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: getHeaders(options.headers || {}),
    method: options.method || 'GET',
    body: options.body,
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function normalizeData(data) {
  const next = data && typeof data === 'object' ? data : cloneDefaultData();
  next.members = Array.isArray(next.members) ? next.members : [];
  next.completions = next.completions && typeof next.completions === 'object' ? next.completions : {};

  next.members = next.members.map((member, memberIndex) => ({
    id: member.id || `member_${memberIndex + 1}`,
    name: member.name || 'Member',
    avatar: member.avatar || '🙂',
    color: member.color || '#4d96ff',
    habits: Array.isArray(member.habits) ? member.habits.map((habit, habitIndex) => ({
      id: habit.id || `h${habitIndex + 1}`,
      name: habit.name || 'Habit',
      points: Math.max(1, parseInt(habit.points, 10) || 1)
    })) : []
  })).filter(member => member.habits.length > 0);

  if (!next.members.length) {
    return cloneDefaultData();
  }

  return next;
}

function buildDataFromRows(memberRows, habitRows, completionRows) {
  const members = memberRows.map(row => ({
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    color: row.color,
    habits: []
  }));

  const memberMap = new Map(members.map(member => [member.id, member]));
  habitRows.forEach(row => {
    const member = memberMap.get(row.member_id);
    if (!member) return;
    member.habits.push({
      id: row.id,
      name: row.name || 'Habit',
      points: Math.max(1, parseInt(row.points, 10) || 1)
    });
  });

  const completions = {};
  completionRows.forEach(row => {
    if (!row.member_id || !row.habit_id || !row.date || !row.completed) return;
    completions[`${row.member_id}:${row.habit_id}:${row.date}`] = true;
  });

  return normalizeData({ members, completions });
}

async function seedDefaultData() {
  const seeded = cloneDefaultData();
  await writeAppData(seeded);
  return seeded;
}

async function readAppData() {
  const [members, habits, completions] = await Promise.all([
    supabaseRequest('/members?select=id,name,avatar,color&order=sort_order.asc.nullslast,created_at.asc.nullslast,id.asc'),
    supabaseRequest('/habits?select=id,member_id,name,points&order=member_id.asc,sort_order.asc.nullslast,created_at.asc.nullslast,id.asc'),
    supabaseRequest('/completions?select=member_id,habit_id,date,completed')
  ]);

  if (!members.length || !habits.length) {
    return seedDefaultData();
  }

  return buildDataFromRows(members, habits, completions);
}

async function replaceTable(table, matchColumn) {
  await supabaseRequest(`/${table}?${matchColumn}=not.is.null`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal'
    }
  });
}

async function insertRows(table, rows) {
  if (!rows.length) return;

  await supabaseRequest(`/${table}`, {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(rows)
  });
}

async function writeAppData(data) {
  const normalized = normalizeData(data);

  const memberRows = normalized.members.map((member, index) => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    color: member.color,
    sort_order: index
  }));

  const habitRows = normalized.members.flatMap(member =>
    member.habits.map((habit, index) => ({
      id: habit.id,
      member_id: member.id,
      name: habit.name,
      points: habit.points,
      sort_order: index
    }))
  );

  const completionRows = Object.keys(normalized.completions)
    .filter(key => normalized.completions[key])
    .sort()
    .map(key => {
      const [memberId, habitId, date] = key.split(':');
      return {
        member_id: memberId,
        habit_id: habitId,
        date,
        completed: true
      };
    });

  await replaceTable('completions', 'member_id');
  await replaceTable('habits', 'id');
  await replaceTable('members', 'id');

  await insertRows('members', memberRows);
  await insertRows('habits', habitRows);
  await insertRows('completions', completionRows);

  return normalized;
}

module.exports = {
  normalizeData,
  readAppData,
  writeAppData
};
