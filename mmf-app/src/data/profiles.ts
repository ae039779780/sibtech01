export type Seeking = 'couple-seeking-male' | 'male-seeking-couple' | 'open-mmf'

export type Profile = {
  id: string
  name: string
  ages: string
  city: string
  seeking: Seeking
  tagline: string
  bio: string
  interests: string[]
  image: string
  verified: boolean
  online: boolean
}

export const seekingLabel: Record<Seeking, string> = {
  'couple-seeking-male': 'זוג מחפש גבר',
  'male-seeking-couple': 'גבר מחפש זוג',
  'open-mmf': 'פתוחים ל־MMF',
}

export const profiles: Profile[] = [
  {
    id: '1',
    name: 'נועה ויונתן',
    ages: '29 · 32',
    city: 'תל אביב',
    seeking: 'couple-seeking-male',
    tagline: 'זוג רגוע שמחפש כימיה אמיתית',
    bio: 'נשואים שלוש שנים, פתוחים לחוויות MMF עם גבר שמבין גבולות, תקשורת וכבוד. אוהבים יין, ג׳אז ולילות מאוחרים בעיר.',
    interests: ['יין', 'ג׳אז', 'מלונות בוטיק', 'תקשורת פתוחה'],
    image:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80',
    verified: true,
    online: true,
  },
  {
    id: '2',
    name: 'איתי',
    ages: '31',
    city: 'הרצליה',
    seeking: 'male-seeking-couple',
    tagline: 'גבר רגוע, דיסקרטי ומכבד',
    bio: 'מחפש זוג שמחפש שותף שלישי ללא דרמות. אני ספורטיבי, נקי, ואוהב אווירה אינטימית יותר מרעש של מועדונים.',
    interests: ['כושר', 'טיולים', 'צילום', 'דיסקרטיות'],
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    verified: true,
    online: false,
  },
  {
    id: '3',
    name: 'מיכל ורועי',
    ages: '34 · 36',
    city: 'חיפה',
    seeking: 'couple-seeking-male',
    tagline: 'מחפשים גבר שמרגיש חלק מהערב',
    bio: 'זוג מנוסה ב־MMF. אוהבים ארוחות טובות לפני, ושיחה כנה אחרי. מחפשים מישהו שיודע להקשיב כמו שהוא יודע להוביל.',
    interests: ['קולינריה', 'ים', 'מסיבות בית', 'גבולות ברורים'],
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    verified: true,
    online: true,
  },
  {
    id: '4',
    name: 'דניאל',
    ages: '27',
    city: 'ירושלים',
    seeking: 'male-seeking-couple',
    tagline: 'אנרגיה גבוהה, גישה רכה',
    bio: 'חדש בסצנה אבל לא חדש באחריות. מחפש זוג שמוכן להכיר לאט, לבדוק התאמה, ורק אז להתקדם.',
    interests: ['מוזיקה חיה', 'קוקטיילים', 'יוגה', 'שיחה עמוקה'],
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    verified: false,
    online: true,
  },
  {
    id: '5',
    name: 'שירה ואדם',
    ages: '30 · 33',
    city: 'רמת גן',
    seeking: 'open-mmf',
    tagline: 'פתוחים, סלקטיביים, וחמים',
    bio: 'אנחנו לא מחפשים כמות — אנחנו מחפשים התאמה. MMF בשבילנו זה משחק משותף, לא תחרות.',
    interests: ['עיצוב', 'נסיעות', 'ספא', 'משחקי תפקידים קלים'],
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    verified: true,
    online: false,
  },
  {
    id: '6',
    name: 'ליאור',
    ages: '35',
    city: 'באר שבע',
    seeking: 'male-seeking-couple',
    tagline: 'בשל, רגוע, בלי לחץ',
    bio: 'עובד הייטק, יודע לשמור על פרטיות. מחפש זוג שמחפש נוכחות גברית רגועה ולא הצגה.',
    interests: ['קפה איכותי', 'ספרים', 'נסיעות קצרות', 'כבוד הדדי'],
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80',
    verified: true,
    online: true,
  },
]
