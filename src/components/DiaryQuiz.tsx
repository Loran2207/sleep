import { W } from '../tokens';
import { CheckIcon } from './icons';
import { DIARY_QUESTIONS, type DiaryOption, type DiaryQuestion } from '../data/diary';

// Reusable sleep-diary quiz used by the journal entry editor.
// Renders every question on a single scrollable page.
export function DiaryQuiz({ diary, onChange }: {
  diary: Record<string, string | string[]>;
  onChange: (next: Record<string, string | string[]>) => void;
}) {
  function setSingle(qId: string, value: string) {
    onChange({ ...diary, [qId]: diary[qId] === value ? '' : value });
  }
  function toggleMulti(qId: string, value: string) {
    const cur = (diary[qId] as string[] | undefined) ?? [];
    const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
    onChange({ ...diary, [qId]: next });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 12 }}>
      {DIARY_QUESTIONS.map((q) => (
        <div key={q.id}>
          <DiaryPrompt>{q.prompt}</DiaryPrompt>
          <DiaryOptions
            question={q}
            value={diary[q.id]}
            onSingle={(v) => setSingle(q.id, v)}
            onMulti={(v) => toggleMulti(q.id, v)}
          />
        </div>
      ))}
    </div>
  );
}

export function DiaryOptions({ question, value, onSingle, onMulti }: {
  question: DiaryQuestion;
  value: string | string[] | undefined;
  onSingle: (id: string) => void;
  onMulti: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 4px' }}>
      {question.options.map((opt) => {
        const on = question.multi
          ? Array.isArray(value) && (value as string[]).includes(opt.id)
          : value === opt.id;
        return (
          <DiaryChip
            key={opt.id}
            option={opt}
            on={on}
            onClick={() => question.multi ? onMulti(opt.id) : onSingle(opt.id)}
          />
        );
      })}
    </div>
  );
}

function DiaryChip({ option, on, onClick }: { option: DiaryOption; on: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '9px 14px', borderRadius: 999,
      cursor: 'pointer',
      background: on ? W.ink : 'transparent',
      color: on ? W.bg : W.ink,
      border: `1px solid ${on ? W.ink : W.fill}`,
      transition: 'background .12s ease, color .12s ease',
    }}>
      {on && <CheckIcon size={12} stroke={W.bg} />}
      <span style={{ fontSize: 13, fontWeight: 500 }}>{option.label}</span>
    </div>
  );
}

// How many of the diary questions have a non-empty answer.
export function diaryAnsweredCount(diary: Record<string, string | string[]>): number {
  let count = 0;
  for (const q of DIARY_QUESTIONS) {
    const v = diary[q.id];
    if (q.multi) {
      if (Array.isArray(v) && v.length > 0) count++;
    } else {
      if (typeof v === 'string' && v) count++;
    }
  }
  return count;
}

export const DIARY_TOTAL = DIARY_QUESTIONS.length;

export function DiaryPrompt({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 14, fontWeight: 600, color: W.ink,
      padding: '0 4px 10px', lineHeight: 1.35,
    }}>{children}</div>
  );
}
