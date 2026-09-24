export type GameMode = 'night' | 'dice' | 'tod' | 'heat' | 'director'
export type PartyType = 'couple' | 'mmf'

export type GameInfo = {
  id: GameMode
  title: string
  blurb: string
  rounds: number
  minutes: string
  rules: string[]
  inspired: string
}

/** 5 משחקים מלאים */
export const games: GameInfo[] = [
  {
    id: 'night',
    title: 'לילה חם',
    blurb: '12 שליפות עם טיימר — ערב משימות מלא',
    rounds: 12,
    minutes: '25–40 דק׳',
    rules: [
      'שולפים כרטיס משימה',
      'מפעילים טיימר ומבצעים',
      'אפשר כרטיס דילוג או מילה בטוחה',
      'אחרי 12 משימות — הערב נגמר',
    ],
    inspired: 'SwingParty',
  },
  {
    id: 'dice',
    title: 'קוביות אש',
    blurb: '10 הטלות: מי · חום · פעולה',
    rounds: 10,
    minutes: '20–35 דק׳',
    rules: [
      'מטילים 3 קוביות: מי, חום, פעולה',
      'מקבלים משימה שמתאימה לתוצאה',
      'מבצעים עם טיימר',
      '10 הטלות = משחק מלא',
    ],
    inspired: 'Frisky Foreplay',
  },
  {
    id: 'tod',
    title: 'אמת או משימה',
    blurb: '15 תורות — בחירה בין אמת למשימה',
    rounds: 15,
    minutes: '20–30 דק׳',
    rules: [
      'בתור בוחרים אמת או משימה',
      'אמת = שאלה נועזת בקול',
      'משימה = ביצוע עם טיימר',
      '15 תורות = סוף המשחק',
    ],
    inspired: 'Desire',
  },
  {
    id: 'heat',
    title: 'סולם 5',
    blurb: '5 רמות × 3 משימות — עולים בחום',
    rounds: 15,
    minutes: '30–45 דק׳',
    rules: [
      'מתחילים ברמה 1 (חם)',
      'כל 3 משימות עולים רמה',
      'רמה 5 = נועז ביותר',
      '15 משימות = סיום הסולם',
    ],
    inspired: 'Joyful Couple',
  },
  {
    id: 'director',
    title: 'הבמאי',
    blurb: '10 תסריטים: מי + מה + איך + איפה',
    rounds: 10,
    minutes: '20–35 דק׳',
    rules: [
      'מגרילים 4 כרטיסים לתסריט',
      'כולם מאשרים לפני ביצוע',
      'מבצעים ~60 שניות',
      '10 תסריטים = ערב במאי מלא',
    ],
    inspired: 'Naughty Scenarios',
  },
]

export const partyOptions: { id: PartyType; title: string; blurb: string }[] = [
  { id: 'couple', title: 'זוג', blurb: '2 שחקנים' },
  { id: 'mmf', title: 'MMF', blurb: 'גבר · גבר · אישה' },
]

export function getGame(id: string | null | undefined): GameInfo {
  return games.find((g) => g.id === id) ?? games[0]!
}
