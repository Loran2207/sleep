// Universal quiz definitions. Each quiz has an intro blurb, a flat list
// of questions (single-select), and a set of score bands that drive the
// result screen.
//
// The shape is intentionally simple so adding a quiz means dropping a
// new object into the QUIZZES array — no UI changes required.

import {
  IconChronotype, IconHourglass, IconHeartwave, IconMoonBed,
} from '../components/QuizIcons';

type QuizIcon = (props: { size?: number }) => JSX.Element;

export type QuizOption = { label: string; value: number };
export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};
export type QuizResultBand = {
  min: number;
  max: number;
  title: string;
  desc: string;
  ideas: string[];
};
export type Quiz = {
  id: string;
  title: string;
  blurb: string;             // one-liner on the dashboard card
  hero: string;              // longer copy on the intro screen
  meta: string;              // "5 questions · 2 min"
  accent: string;            // hex tint for the quiz
  icon: QuizIcon;
  questions: QuizQuestion[];
  maxScore: number;          // derived: questions.length * highest option value
  bands: QuizResultBand[];
};

// A 5-option scale shared by most quizzes. 0 = least, 4 = most.
const FREQUENCY: QuizOption[] = [
  { label: 'Never', value: 0 },
  { label: 'Rarely', value: 1 },
  { label: 'Sometimes', value: 2 },
  { label: 'Often', value: 3 },
  { label: 'Almost constantly', value: 4 },
];

// ─── Chronotype ──────────────────────────────────────────────────
const CHRONOTYPE: Quiz = {
  id: 'chronotype',
  title: 'Chronotype',
  blurb: 'Morning lark, night owl, or somewhere between?',
  hero: 'A short reflection on when you feel sharpest, when sleep finds you, and how your body schedules itself across the day.',
  meta: '5 questions · 2 min',
  accent: '#FFB47A',
  icon: IconChronotype,
  questions: [
    { id: 'q1', prompt: 'On a free day, when would you naturally wake up?', options: [
      { label: 'Before 6:30', value: 0 },
      { label: '6:30 – 7:45', value: 1 },
      { label: '7:45 – 9:30', value: 2 },
      { label: '9:30 – 11:00', value: 3 },
      { label: 'After 11:00', value: 4 },
    ]},
    { id: 'q2', prompt: 'You feel sharpest…', options: [
      { label: 'First thing in the morning', value: 0 },
      { label: 'Mid-morning', value: 1 },
      { label: 'Around midday', value: 2 },
      { label: 'Late afternoon', value: 3 },
      { label: 'Late evening', value: 4 },
    ]},
    { id: 'q3', prompt: 'How easy is it to get out of bed before 7:00?', options: [
      { label: 'Very easy', value: 0 },
      { label: 'Easy', value: 1 },
      { label: 'Manageable', value: 2 },
      { label: 'Hard', value: 3 },
      { label: 'Very hard', value: 4 },
    ]},
    { id: 'q4', prompt: 'If you go to bed at midnight, you usually feel…', options: [
      { label: 'Already half asleep', value: 0 },
      { label: 'Tired', value: 1 },
      { label: 'A bit tired', value: 2 },
      { label: 'Not tired yet', value: 3 },
      { label: 'Wide awake', value: 4 },
    ]},
    { id: 'q5', prompt: 'When does evening tiredness usually arrive?', options: [
      { label: 'Before 21:00', value: 0 },
      { label: '21:00 – 22:30', value: 1 },
      { label: '22:30 – 00:00', value: 2 },
      { label: '00:00 – 01:30', value: 3 },
      { label: 'After 01:30', value: 4 },
    ]},
  ],
  maxScore: 5 * 4,
  bands: [
    { min: 0,  max: 5,  title: 'Strong morning type', desc: 'You wake easily and run on momentum early. Your sleep window is genuinely happy starting before 22:30.', ideas: [
      'Catch sunlight in the first 30 minutes of your day to lock the rhythm in.',
      'Front-load demanding work — your peak focus is real.',
      'Be gentle with late socials; they tax you more than you think.',
    ]},
    { min: 6,  max: 10, title: 'Moderate morning', desc: 'You lean early but stay flexible. With consistent bedtimes, mornings come easy.', ideas: [
      'Keep weekday and weekend wake-times within an hour.',
      'A short walk after lunch can settle late-afternoon dips.',
    ]},
    { min: 11, max: 15, title: 'Evening leaning', desc: 'Your body warms up slowly and stays alert later. Forcing very early bedtimes rarely sticks.', ideas: [
      'Aim for a bedtime that respects your natural drift — perhaps closer to 00:00.',
      'Limit bright light in the hour before sleep to let melatonin rise.',
    ]},
    { min: 16, max: 20, title: 'Strong night owl', desc: 'You live well after dark and sleep comes late. Forcing early starts is genuinely costly.', ideas: [
      'Protect a wind-down ritual — your nervous system needs the runway.',
      'Schedule cognitively heavy work for the afternoon and evening.',
      'If life demands early mornings, use bright morning light to shift the clock slowly.',
    ]},
  ],
};

// ─── Sleep need ──────────────────────────────────────────────────
const SLEEP_NEED: Quiz = {
  id: 'sleep-need',
  title: 'Sleep need',
  blurb: 'How much sleep does your body actually want?',
  hero: 'A few questions about how long it takes to feel rested, and how your body reacts when you cut sleep short.',
  meta: '5 questions · 2 min',
  accent: '#B7C8FF',
  icon: IconHourglass,
  questions: [
    { id: 'q1', prompt: 'On vacation, with no alarm, how long do you typically sleep?', options: [
      { label: 'Under 6 hours', value: 0 },
      { label: '6 – 7 hours', value: 1 },
      { label: '7 – 8 hours', value: 2 },
      { label: '8 – 9 hours', value: 3 },
      { label: 'Over 9 hours', value: 4 },
    ]},
    { id: 'q2', prompt: 'After 7 hours of sleep you feel…', options: [
      { label: 'Fully rested', value: 0 },
      { label: 'Pretty good', value: 1 },
      { label: 'Okay', value: 2 },
      { label: 'A bit short', value: 3 },
      { label: 'Clearly under-slept', value: 4 },
    ]},
    { id: 'q3', prompt: 'Do you tend to nap during the day?', options: FREQUENCY },
    { id: 'q4', prompt: 'When you under-sleep, do you crash by late afternoon?', options: FREQUENCY },
    { id: 'q5', prompt: 'Do you sleep notably longer on weekends?', options: FREQUENCY },
  ],
  maxScore: 5 * 4,
  bands: [
    { min: 0,  max: 5,  title: 'Short sleeper', desc: 'You bounce back on relatively little sleep. Your needs may sit closer to 6–7 hours.', ideas: [
      'Even short sleepers benefit from consistency — keep wake times stable.',
      'Pay attention to subtle signs: irritability and slow recovery can sneak up.',
    ]},
    { min: 6,  max: 10, title: 'Around average', desc: 'You probably feel best on 7–8 hours and notice short nights faster than most.', ideas: [
      'Treat 7.5 hours as a floor on busy weeks, not a target.',
      'Caffeine after 14:00 punches above its weight here.',
    ]},
    { min: 11, max: 15, title: 'A long-sleeper lean', desc: 'You feel meaningfully better with 8+ hours and recover slowly from short nights.', ideas: [
      'Move your bedtime earlier in 15-minute increments until mornings click.',
      'Block out true wind-down time — rushing sleep shortens it more than you think.',
    ]},
    { min: 16, max: 20, title: 'Long sleeper', desc: 'Your system asks for plenty of rest. Honour that — under-sleeping accumulates fast.', ideas: [
      'Aim for a 9-hour sleep window most nights.',
      'If long sleep still leaves you tired, consider checking sleep quality with a clinician.',
    ]},
  ],
};

// ─── Anxiety self-check ──────────────────────────────────────────
const ANXIETY: Quiz = {
  id: 'anxiety',
  title: 'Anxiety self-check',
  blurb: 'A quick, private way to reflect on your balance.',
  hero: 'This quiz reflects on common feelings linked to anxiety — how they might show up physically, emotionally and behaviourally. Not a diagnostic tool.',
  meta: '5 questions · 2 min',
  accent: '#C9A6FF',
  icon: IconHeartwave,
  questions: [
    { id: 'q1', prompt: 'Do you find yourself worrying about things outside your control?', options: FREQUENCY },
    { id: 'q2', prompt: 'Do you avoid places or situations because you fear they will trigger anxiety?', options: FREQUENCY },
    { id: 'q3', prompt: 'Do you notice physical tension — tight shoulders, shallow breath, racing heart?', options: FREQUENCY },
    { id: 'q4', prompt: 'Does it take you a long time to fall asleep because thoughts won\'t settle?', options: FREQUENCY },
    { id: 'q5', prompt: 'Do small setbacks feel bigger than they should?', options: FREQUENCY },
  ],
  maxScore: 5 * 4,
  bands: [
    { min: 0,  max: 5,  title: 'Mostly settled', desc: 'You feel grounded most of the time. Day-to-day stress passes through without sticking.', ideas: [
      'Keep the basics: sleep, movement, daylight.',
      'A weekly check-in can catch slow drifts early.',
    ]},
    { min: 6,  max: 10, title: 'Some background hum', desc: 'You notice tension and worry from time to time. Most of the time you can let it pass.', ideas: [
      'Name what you notice — a 5-minute journal entry can defuse a lot.',
      'Try a short breathing practice before bed.',
    ]},
    { min: 11, max: 15, title: 'Time to tune in', desc: 'Worry and tension show up more often than is comfortable. Treating these as signals — not flaws — is a useful first step.', ideas: [
      'Notice triggers: which situations or thoughts bring this on?',
      'Build consistent routines — sleep, caffeine and screens are the easiest levers.',
      'Try a simple self-calming technique: 4-7-8 breath or progressive muscle relaxation.',
    ]},
    { min: 16, max: 20, title: 'Carrying a lot right now', desc: 'These feelings feel pervasive. That doesn\'t mean anything is wrong with you — it does mean support helps.', ideas: [
      'Consider talking with a professional. A short conversation can re-frame a lot.',
      'Reduce one thing this week — a meeting, a feed, a habit — and notice what shifts.',
      'Be honest with someone close. Carrying this alone is harder than it needs to be.',
    ]},
  ],
};

// ─── Sleep quality ───────────────────────────────────────────────
const SLEEP_QUALITY: Quiz = {
  id: 'sleep-quality',
  title: 'Sleep quality',
  blurb: 'How rested do you feel when you wake?',
  hero: 'Hours in bed and hours of rest aren\'t the same. A short check on how your nights are landing lately.',
  meta: '5 questions · 2 min',
  accent: '#7FE3A1',
  icon: IconMoonBed,
  questions: [
    { id: 'q1', prompt: 'Do you wake feeling refreshed?', options: FREQUENCY.slice().reverse().map((o, i) => ({ ...o, value: i })) },
    { id: 'q2', prompt: 'Do you wake during the night and struggle to fall back asleep?', options: FREQUENCY },
    { id: 'q3', prompt: 'Does it take more than 30 minutes to fall asleep?', options: FREQUENCY },
    { id: 'q4', prompt: 'Do you feel groggy or foggy in the first hour after waking?', options: FREQUENCY },
    { id: 'q5', prompt: 'Do you rely on caffeine to get through the morning?', options: FREQUENCY },
  ],
  maxScore: 5 * 4,
  bands: [
    { min: 0,  max: 5,  title: 'Sleeping well', desc: 'Your nights look restorative — you fall asleep easily and wake fresh.', ideas: [
      'Stick with what works. Boring is good.',
      'Notice what protects this: bedtime, light, food, screens.',
    ]},
    { min: 6,  max: 10, title: 'Mostly good, with bumps', desc: 'Your sleep is doing most of its job, but some nights miss.', ideas: [
      'Watch caffeine after 14:00.',
      'Keep screens dim in the hour before bed.',
    ]},
    { min: 11, max: 15, title: 'Patchy nights', desc: 'You\'re losing rest more often than you should. The cumulative effect is worth taking seriously.', ideas: [
      'Pick one ritual and keep it for two weeks — wind-down, screens-off, or fixed wake-time.',
      'Track when you wake — patterns reveal causes.',
    ]},
    { min: 16, max: 20, title: 'Not enough rest', desc: 'Your nights aren\'t landing. There\'s real upside in addressing this — energy, mood and focus all hinge on it.', ideas: [
      'Talk with a clinician if poor sleep has lasted weeks.',
      'Remove obvious antagonists first: late alcohol, evening caffeine, irregular wake-times.',
      'Build a wind-down: low light, slow breath, the same order every night.',
    ]},
  ],
};

export const QUIZZES: Quiz[] = [CHRONOTYPE, SLEEP_NEED, ANXIETY, SLEEP_QUALITY];

export function lookupQuiz(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}

export function resultBand(quiz: Quiz, score: number): QuizResultBand {
  return quiz.bands.find((b) => score >= b.min && score <= b.max) ?? quiz.bands[quiz.bands.length - 1];
}
