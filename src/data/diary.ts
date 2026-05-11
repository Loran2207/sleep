// Sleep-diary questionnaire — completed during the wake-up survey
// and editable later from a journal entry.

export type DiaryOption = { id: string; label: string };

export type DiaryQuestion = {
  id: string;
  prompt: string;
  multi?: boolean;
  options: DiaryOption[];
};

// 5-point sleep-quality rating shown at the top of the diary.
// Mapped to the existing MoodBlob types so the colours stay consistent.
export const QUALITY_OPTIONS: { id: string; label: string; mood: 'awful' | 'bad' | 'meh' | 'good' | 'great' }[] = [
  { id: 'awful', label: 'Awful', mood: 'awful' },
  { id: 'bad', label: 'Bad', mood: 'bad' },
  { id: 'ok', label: 'OK', mood: 'meh' },
  { id: 'good', label: 'Good', mood: 'good' },
  { id: 'ideal', label: 'Ideal', mood: 'great' },
];

export const DIARY_QUESTIONS: DiaryQuestion[] = [
  {
    id: 'bedtime',
    prompt: 'Did you go to bed at your planned time?',
    options: [
      { id: 'on-time', label: 'Yes (within 15 min)' },
      { id: 'earlier', label: 'Earlier — was very sleepy' },
      { id: 'late-1h', label: 'Up to 1 hour late' },
      { id: 'late-1h-plus', label: 'More than 1 hour late' },
    ],
  },
  {
    id: 'fall-asleep',
    prompt: 'How long did it take to fall asleep?',
    options: [
      { id: 'under-15', label: 'Under 15 min' },
      { id: '15-30', label: '15–30 min' },
      { id: 'over-30', label: 'More than 30 min' },
    ],
  },
  {
    id: 'awakenings',
    prompt: 'If you woke up, how long were you awake in total?',
    options: [
      { id: 'none', label: "Didn't wake up" },
      { id: 'brief', label: '1–2 times, fell back fast' },
      { id: '15-30', label: 'Awake 15–30 min' },
      { id: 'over-30', label: 'Awake more than 30 min' },
    ],
  },
  {
    id: 'wake-time',
    prompt: 'Did you wake up at your planned time?',
    options: [
      { id: 'much-earlier', label: 'Much earlier' },
      { id: 'with-alarm', label: 'With the alarm' },
      { id: 'overslept', label: 'Overslept' },
    ],
  },
  {
    id: 'out-of-bed',
    prompt: 'How long did you stay in bed after waking?',
    options: [
      { id: 'over-30', label: '30 min or more' },
      { id: '10-30', label: '10–30 min' },
      { id: 'right-away', label: 'Got up right away' },
    ],
  },
  {
    id: 'energy-yesterday',
    prompt: 'How energetic were you yesterday?',
    options: [
      { id: 'energetic', label: 'Energetic' },
      { id: 'moderate', label: 'So-so' },
      { id: 'drained', label: 'Drained' },
    ],
  },
  {
    id: 'exercise-yesterday',
    prompt: 'Did you exercise yesterday?',
    options: [
      { id: 'no', label: 'No' },
      { id: 'walking', label: 'Walking only' },
      { id: 'regular-no', label: 'No, but I exercise regularly' },
      { id: 'light', label: 'Light workout' },
      { id: 'intense', label: 'Intense workout' },
    ],
  },
  {
    id: 'factors',
    prompt: 'What may have hurt your sleep?',
    multi: true,
    options: [
      { id: 'none', label: 'Nothing' },
      { id: 'caffeine-late', label: 'Caffeine after 3pm' },
      { id: 'alcohol', label: 'Alcohol' },
      { id: 'late-dinner', label: 'Late dinner' },
      { id: 'screens', label: 'Screens before bed' },
      { id: 'pills', label: 'Sleeping pills' },
      { id: 'stress', label: 'Stress' },
      { id: 'long-nap', label: 'Long nap yesterday' },
      { id: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'helpers',
    prompt: 'What helped tonight?',
    multi: true,
    options: [
      { id: 'none', label: 'Nothing in particular' },
      { id: 'sunlight', label: 'Morning sunlight' },
      { id: 'read', label: 'Read before bed' },
      { id: 'wind-down', label: 'Wind-down routine' },
    ],
  },
];

export function lookupDiaryQuestion(id: string): DiaryQuestion | undefined {
  return DIARY_QUESTIONS.find((q) => q.id === id);
}

export function lookupDiaryOption(qId: string, oId: string): DiaryOption | undefined {
  return lookupDiaryQuestion(qId)?.options.find((o) => o.id === oId);
}
