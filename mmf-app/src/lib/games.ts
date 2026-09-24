export type GameMode = 'draw' | 'dice' | 'truth' | 'heat' | 'scenario' | 'wheel'
export type PartyType = 'couple' | 'mmf'

export type GameInfo = {
  id: GameMode
  title: string
  blurb: string
  inspired: string
}

export const games: GameInfo[] = [
  {
    id: 'draw',
    title: 'שליפה',
    blurb: 'כרטיס משימה אקראי עם טיימר',
    inspired: 'SwingParty',
  },
  {
    id: 'dice',
    title: 'קוביות',
    blurb: 'מי · חום · פעולה',
    inspired: 'Frisky Foreplay',
  },
  {
    id: 'truth',
    title: 'אמת / משימה',
    blurb: 'בוחרים אמת או משימה',
    inspired: 'Desire',
  },
  {
    id: 'heat',
    title: 'סולם חום',
    blurb: 'עולים רמה אחרי משימות',
    inspired: 'Joyful Couple',
  },
  {
    id: 'scenario',
    title: 'תסריט',
    blurb: 'מי + מה + איך',
    inspired: 'Naughty Scenarios',
  },
  {
    id: 'wheel',
    title: 'גלגל',
    blurb: 'סיבוב וגורל',
    inspired: 'Desire Wheel',
  },
]

export const partyOptions: { id: PartyType; title: string; blurb: string }[] = [
  { id: 'couple', title: 'זוג', blurb: '2 שחקנים' },
  { id: 'mmf', title: 'MMF', blurb: 'גבר · גבר · אישה' },
]
