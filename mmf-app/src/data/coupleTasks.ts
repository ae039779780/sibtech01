export type Intensity = 'warm' | 'spicy' | 'fire'

export type CoupleTarget = 'p1' | 'p2' | 'both'

export type CoupleTask = {
  id: string
  intensity: Intensity
  target: CoupleTarget
  title: string
  body: string
  kind: 'dare' | 'truth'
}

export const coupleTargetLabel: Record<CoupleTarget, string> = {
  p1: 'בן/בת זוג 1',
  p2: 'בן/בת זוג 2',
  both: 'שניכם',
}

/** משימות ואמיתות לזוג — בהשראת Desire / Joyful Couple / TicTease */
export const coupleTasks: CoupleTask[] = [
  { id: 'c01', intensity: 'warm', target: 'both', kind: 'dare', title: 'מבט 30', body: 'שניכם מסתכלים אחד על השני 30 שניות בלי לדבר — ואז אומרים מה הרגשתם.' },
  { id: 'c02', intensity: 'warm', target: 'p1', kind: 'dare', title: 'מחמאה חמה', body: 'בן/בת זוג 1 אומר/ת מחמאה מינית אחת ישירה. 20 שניות להגיד אותה לאט.' },
  { id: 'c03', intensity: 'warm', target: 'p2', kind: 'dare', title: 'נשיקה מודרכת', body: 'בן/בת זוג 2 מנשק/ת רק איפה שהשני מצביע — 40 שניות.' },
  { id: 'c04', intensity: 'warm', target: 'both', kind: 'truth', title: 'מה מדליק', body: 'כל אחד אומר דבר אחד שעוד לא ניסיתם יחד אבל רוצה.' },
  { id: 'c05', intensity: 'warm', target: 'both', kind: 'dare', title: 'ידיים מתחת', body: 'ידיים מתחת לבגד העליון בלבד — 45 שניות. בלי להמשיך מעבר למה שאושר.' },
  { id: 'c06', intensity: 'spicy', target: 'p1', kind: 'dare', title: 'בימוי', body: 'בן/בת זוג 1 נותן/ת הוראה אחת ל־60 שניות. השני מבצע בדיוק.' },
  { id: 'c07', intensity: 'spicy', target: 'p2', kind: 'dare', title: 'מסלול', body: 'בן/בת זוג 2 מסמן 3 נקודות על הגוף. אחרי אישור — עובר ביניהן לאט 50 שניות.' },
  { id: 'c08', intensity: 'spicy', target: 'both', kind: 'truth', title: 'גבול', body: 'כל אחד אומר: כן מוחלט / לא מוחלט / אולי אחר כך — לדבר אחד להערב.' },
  { id: 'c09', intensity: 'spicy', target: 'both', kind: 'dare', title: 'החלפת שליטה', body: 'דקה אחת מוביל אחד, דקה השני. מחליפים בלי ויכוח.' },
  { id: 'c10', intensity: 'spicy', target: 'p1', kind: 'dare', title: 'לחישה', body: 'בן/בת זוג 1 לוחש/ת משפט גס. אם יש כן — ממשיכים ממנו 45 שניות.' },
  { id: 'c11', intensity: 'fire', target: 'both', kind: 'dare', title: 'טיימר חם', body: 'שתי דקות מגע בתוך הגבולות. כל 30 שניות אומרים בקול מה טוב.' },
  { id: 'c12', intensity: 'fire', target: 'p2', kind: 'dare', title: 'פקודה', body: 'בן/בת זוג 2 נותן/ת פקודה נועזת אחת. 60 שניות. לא בנוח? עוצרים.' },
  { id: 'c13', intensity: 'fire', target: 'p1', kind: 'dare', title: 'רק פה', body: 'בן/בת זוג 1 משתמש/ת רק בפה 50 שניות — באזור שאושר מראש.' },
  { id: 'c14', intensity: 'fire', target: 'both', kind: 'truth', title: 'פנטזיה', body: 'כל אחד מתאר פנטזיה קצרה במשפט אחד. בוחרים אחת לבצע חלקית עכשיו.' },
  { id: 'c15', intensity: 'fire', target: 'both', kind: 'dare', title: 'בגדים בחצי', body: 'מורידים פריט אחד כל אחד. ממשיכים 60 שניות במגע.' },
  { id: 'c16', intensity: 'warm', target: 'both', kind: 'dare', title: 'עיסוי כתפיים', body: 'עיסוי כתפיים וצוואר לסירוגין — דקה לכל אחד.' },
  { id: 'c17', intensity: 'spicy', target: 'p2', kind: 'dare', title: 'על הברכיים', body: 'בן/בת זוג 2 על הברכיים מול השני ל־40 שניות של מגע מאושר.' },
  { id: 'c18', intensity: 'fire', target: 'p1', kind: 'dare', title: 'קצב איטי', body: 'בן/בת זוג 1 חייב/ת קצב איטי בלבד 60 שניות. השני מכוון בקול.' },
  { id: 'c19', intensity: 'spicy', target: 'both', kind: 'dare', title: 'עצום עיניים', body: 'אחד עוצם עיניים. השני נוגע 45 שניות. אחר כך מתחלפים.' },
  { id: 'c20', intensity: 'fire', target: 'both', kind: 'dare', title: 'סיום חם', body: 'דקה אחרונה חופשית בתוך הגבולות — ואז חיבוק ומילה אחת כל אחד.' },
  { id: 'c21', intensity: 'warm', target: 'p1', kind: 'truth', title: 'זיכרון', body: 'בן/בת זוג 1 מספר/ת על הרגע הכי לוהט שלכם עד היום.' },
  { id: 'c22', intensity: 'warm', target: 'p2', kind: 'truth', title: 'רמז', body: 'בן/בת זוג 2 נותן/ת רמז לפנטזיה בלי לגלות הכל.' },
  { id: 'c23', intensity: 'spicy', target: 'both', kind: 'dare', title: 'שכבות', body: 'מגע עדין + מגע ישיר יותר באותו זמן — מתחלפים בתפקידים אחרי 30 שניות.' },
  { id: 'c24', intensity: 'fire', target: 'p2', kind: 'dare', title: 'מיקום', body: 'בן/בת זוג 2 בוחר מיקום בחדר. ממשיכים שם 60 שניות אחרי אישור.' },
  { id: 'c25', intensity: 'spicy', target: 'p1', kind: 'dare', title: 'בלי ידיים', body: 'בן/בת זוג 1 בלי ידיים 40 שניות — רק פה / גוף, לפי אישור.' },
]

export const coupleTaskCount = coupleTasks.length
