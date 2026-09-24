export type Intensity = 'warm' | 'spicy' | 'fire'

export type TaskTarget = 'm1' | 'm2' | 'f' | 'pair' | 'all'

export type DareTask = {
  id: string
  intensity: Intensity
  target: TaskTarget
  title: string
  body: string
}

export const intensityLabel: Record<Intensity, string> = {
  warm: 'חם',
  spicy: 'חריף',
  fire: 'נועז',
}

export const targetLabel: Record<TaskTarget, string> = {
  m1: 'גבר 1',
  m2: 'גבר 2',
  f: 'האישה',
  pair: 'שניים',
  all: 'כולם',
}

/** משימות למבוגרים · 3 שחקנים · בהסכמה בלבד */
export const tasks: DareTask[] = [
  {
    id: 'w1',
    intensity: 'warm',
    target: 'all',
    title: 'מבט משולש',
    body: 'כולם יושבים קרוב. כל אחד מסתכל על השניים האחרים 20 שניות בלי לדבר — ואז אומר בקול מה הרגיש.',
  },
  {
    id: 'w2',
    intensity: 'warm',
    target: 'f',
    title: 'בחירת קצב',
    body: 'האישה בוחרת מוזיקה ל־3 דקות. שני הגברים זזים רק לפי הקצב שהיא קבעה — בלי לגעת עד שהיא מרשה.',
  },
  {
    id: 'w3',
    intensity: 'warm',
    target: 'm1',
    title: 'מחמאה כפולה',
    body: 'גבר 1 אומר מחמאה אחת לאישה ומחמאה אחת לגבר 2 — על נוכחות, לא על בגדים בלבד.',
  },
  {
    id: 'w4',
    intensity: 'warm',
    target: 'm2',
    title: 'מפה עדינה',
    body: 'גבר 2 מצייר באצבע על כף היד של האישה מפה קטנה של איפה הוא רוצה לגעת אחר כך — היא מאשרת או מתקנת.',
  },
  {
    id: 'w5',
    intensity: 'warm',
    target: 'pair',
    title: 'לחישה משותפת',
    body: 'שני הגברים לוחשים לאישה משפט אחד כל אחד. היא בוחרת איזה משפט ממשיכים ממנו.',
  },
  {
    id: 's1',
    intensity: 'spicy',
    target: 'f',
    title: 'בימוי קצר',
    body: 'האישה נותנת לשני הגברים הוראה אחת ברורה ל־60 שניות (איפה ידיים, איפה מבט). הם מבצעים בדיוק.',
  },
  {
    id: 's2',
    intensity: 'spicy',
    target: 'm1',
    title: 'מסלול נשיקות',
    body: 'גבר 1 מסמן 3 נקודות מעל הבגדים. האישה מאשרת. הוא עובר ביניהן לאט — גבר 2 סופר עד 30.',
  },
  {
    id: 's3',
    intensity: 'spicy',
    target: 'm2',
    title: 'החלפת מקום',
    body: 'גבר 2 מחליף מקום עם גבר 1 ליד האישה. למשך דקה הוא ממשיך בדיוק מאיפה שהשני עצר.',
  },
  {
    id: 's4',
    intensity: 'spicy',
    target: 'all',
    title: 'כן / לא / אחר כך',
    body: 'כל אחד אומר בקול גבול אחד לערב הזה: כן מוחלט, לא מוחלט, ואולי אחר כך.',
  },
  {
    id: 's5',
    intensity: 'spicy',
    target: 'pair',
    title: 'תשומת לב כפולה',
    body: 'שני הגברים נוגעים באישה באותו זמן — כל אחד באזור שהיא בחרה מראש. היא מכוונת בעוצמה ובקצב.',
  },
  {
    id: 's6',
    intensity: 'spicy',
    target: 'f',
    title: 'בחירת מנהיג',
    body: 'האישה בוחרת מי מוביל את הדקה הבאה. השני עוקב אחרי ההוראות שלה בלי לקחת שליטה.',
  },
  {
    id: 'f1',
    intensity: 'fire',
    target: 'all',
    title: 'סצנה ב־3 משפטים',
    body: 'כל אחד אומר משפט אחד שמתאר מה הוא רוצה שיקרה עכשיו. אחר כך מבצעים רק את מה שכולם אמרו לו כן.',
  },
  {
    id: 'f2',
    intensity: 'fire',
    target: 'm1',
    title: 'לחיצה ושחרור',
    body: 'גבר 1 מוביל מגע אינטנסיבי יותר ל־45 שניות לפי אישור מראש. גבר 2 מחזיק ידיים / מבט — לפי מה שהאישה בחרה.',
  },
  {
    id: 'f3',
    intensity: 'fire',
    target: 'm2',
    title: 'תור כפול',
    body: 'האישה קובעת סדר: גבר 2 ואז גבר 1. כל אחד מקבל 45 שניות. בלי לדחוף מעבר למה שאושר.',
  },
  {
    id: 'f4',
    intensity: 'fire',
    target: 'f',
    title: 'פקודה אחת',
    body: 'האישה נותנת פקודה אחת נועזת לשני הגברים יחד. אם מישהו לא בנוח — עוצרים מיד ומחליפים משימה.',
  },
  {
    id: 'f5',
    intensity: 'fire',
    target: 'pair',
    title: 'סינכרון',
    body: 'שני הגברים מסתנכרנים על אותה פעולה שהאישה בחרה. אם יצאתם מסנכרון — עוצרים, נושמים, מתחילים מחדש.',
  },
  {
    id: 'f6',
    intensity: 'fire',
    target: 'all',
    title: 'סגירת מעגל',
    body: 'דקה של מגע עדין בין שלושתכם אחרי משימה חזקה. כל אחד אומר מילה אחת על איך הוא מרגיש עכשיו.',
  },
]
