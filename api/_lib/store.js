const { google } = require('googleapis');
const { cloneDefaultData } = require('./default-data');

const MEMBER_HEADERS = ['id', 'name', 'avatar', 'color'];
const HABIT_HEADERS = ['memberId', 'habitId', 'name', 'points'];
const COMPLETION_HEADERS = ['memberId', 'habitId', 'date', 'completed'];

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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

function createSheetsClient() {
  const credentials = {
    client_email: getEnv('GOOGLE_SHEETS_CLIENT_EMAIL'),
    private_key: getEnv('GOOGLE_SHEETS_PRIVATE_KEY').replace(/\\n/g, '\n')
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

async function ensureSheetExists(sheets, spreadsheetId, title) {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = (metadata.data.sheets || []).some(sheet => sheet.properties && sheet.properties.title === title);
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: { title }
          }
        }
      ]
    }
  });
}

async function ensureWorkbookShape(sheets, spreadsheetId) {
  await ensureSheetExists(sheets, spreadsheetId, 'members');
  await ensureSheetExists(sheets, spreadsheetId, 'habits');
  await ensureSheetExists(sheets, spreadsheetId, 'completions');
}

async function getValues(sheets, spreadsheetId, range) {
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return response.data.values || [];
}

async function clearRange(sheets, spreadsheetId, range) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range
  });
}

async function updateRange(sheets, spreadsheetId, range, values) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}

function buildMembersFromRows(memberRows, habitRows) {
  const members = memberRows.map(([id, name, avatar, color]) => ({
    id,
    name,
    avatar,
    color,
    habits: []
  })).filter(member => member.id);

  const memberMap = new Map(members.map(member => [member.id, member]));
  habitRows.forEach(([memberId, habitId, name, points]) => {
    const member = memberMap.get(memberId);
    if (!member || !habitId) return;
    member.habits.push({
      id: habitId,
      name: name || 'Habit',
      points: Math.max(1, parseInt(points, 10) || 1)
    });
  });

  return members;
}

function buildCompletionsFromRows(rows) {
  const completions = {};
  rows.forEach(([memberId, habitId, date, completed]) => {
    if (!memberId || !habitId || !date) return;
    if (String(completed).toLowerCase() !== 'true') return;
    completions[`${memberId}:${habitId}:${date}`] = true;
  });
  return completions;
}

async function readAppData() {
  const spreadsheetId = getEnv('GOOGLE_SHEET_ID');
  const sheets = createSheetsClient();
  await ensureWorkbookShape(sheets, spreadsheetId);

  const [memberRows, habitRows, completionRows] = await Promise.all([
    getValues(sheets, spreadsheetId, 'members!A2:D'),
    getValues(sheets, spreadsheetId, 'habits!A2:D'),
    getValues(sheets, spreadsheetId, 'completions!A2:D')
  ]);

  if (!memberRows.length || !habitRows.length) {
    const seeded = cloneDefaultData();
    await writeAppData(seeded);
    return seeded;
  }

  return normalizeData({
    members: buildMembersFromRows(memberRows, habitRows),
    completions: buildCompletionsFromRows(completionRows)
  });
}

async function writeAppData(data) {
  const spreadsheetId = getEnv('GOOGLE_SHEET_ID');
  const sheets = createSheetsClient();
  const normalized = normalizeData(data);
  await ensureWorkbookShape(sheets, spreadsheetId);

  const memberValues = [
    MEMBER_HEADERS,
    ...normalized.members.map(member => [member.id, member.name, member.avatar, member.color])
  ];

  const habitValues = [
    HABIT_HEADERS,
    ...normalized.members.flatMap(member =>
      member.habits.map(habit => [member.id, habit.id, habit.name, String(habit.points)])
    )
  ];

  const completionValues = [
    COMPLETION_HEADERS,
    ...Object.keys(normalized.completions)
      .filter(key => normalized.completions[key])
      .sort()
      .map(key => {
        const [memberId, habitId, date] = key.split(':');
        return [memberId, habitId, date, 'true'];
      })
  ];

  await Promise.all([
    clearRange(sheets, spreadsheetId, 'members!A:D'),
    clearRange(sheets, spreadsheetId, 'habits!A:D'),
    clearRange(sheets, spreadsheetId, 'completions!A:D')
  ]);

  await Promise.all([
    updateRange(sheets, spreadsheetId, 'members!A1', memberValues),
    updateRange(sheets, spreadsheetId, 'habits!A1', habitValues),
    updateRange(sheets, spreadsheetId, 'completions!A1', completionValues)
  ]);

  return normalized;
}

module.exports = {
  normalizeData,
  readAppData,
  writeAppData
};
