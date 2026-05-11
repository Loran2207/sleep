import { W } from '../tokens';
import { CheckIcon } from './icons';
import { DIARY_QUESTIONS, type DiaryQuestion } from '../data/diary';

// Reusable sleep-diary quiz. Each question shows its prompt and a vertical
// list of full-width option rows (radio for single-select, checkbox for
// multi-select). The vertical list reads better than wrapping chips, and
// the design feels native to iOS settings.
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {DIARY_QUESTIONS.map((q, i) => (
        <DiaryGroup
          key={q.id}
          index={i + 1}
          question={q}
          value={diary[q.id]}
          onSingle={(v) => setSingle(q.id, v)}
          onMulti={(v) => toggleMulti(q.id, v)}
        />
      ))}
    </div>
  );
}

export function DiaryGroup({ index, question, value, onSingle, onMulti }: {
  index?: number;
  question: DiaryQuestion;
  value: string | string[] | undefined;
  onSingle: (id: string) => void;
  onMulti: (id: string) => void;
}) {
  return (
    <div>
      <DiaryPrompt index={index}>{question.prompt}</DiaryPrompt>
      <div style={{
        background: W.paper,
        border: `1px solid ${W.fill}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {question.options.map((opt, i) => {
          const isLast = i === question.options.length - 1;
          const on = question.multi
            ? Array.isArray(value) && (value as string[]).includes(opt.id)
            : value === opt.id;
          return (
            <DiaryRow
              key={opt.id}
              label={opt.label}
              on={on}
              multi={!!question.multi}
              isLast={isLast}
              onClick={() => question.multi ? onMulti(opt.id) : onSingle(opt.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DiaryRow({ label, on, multi, isLast, onClick }: {
  label: string; on: boolean; multi: boolean; isLast: boolean; onClick: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : `1px solid ${W.fill}`,
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer',
      transition: 'background .12s ease',
    }}>
      <div style={{
        flex: 1, minWidth: 0,
        fontSize: 14, fontWeight: on ? 500 : 400,
        color: on ? W.ink : W.ink,
        lineHeight: 1.35,
      }}>{label}</div>
      <SelectIndicator on={on} multi={multi} />
    </div>
  );
}

function SelectIndicator({ on, multi }: { on: boolean; multi: boolean }) {
  if (multi) {
    return (
      <div style={{
        width: 20, height: 20, borderRadius: 5,
        border: `1.5px solid ${on ? W.ink : W.veryweak}`,
        background: on ? W.ink : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background .12s ease, border-color .12s ease',
      }}>
        {on && <CheckIcon size={12} stroke={W.bg} />}
      </div>
    );
  }
  return (
    <div style={{
      width: 20, height: 20, borderRadius: 10,
      border: `1.5px solid ${on ? W.ink : W.veryweak}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      transition: 'border-color .12s ease',
    }}>
      {on && (
        <div style={{
          width: 10, height: 10, borderRadius: 5, background: W.ink,
          transition: 'background .12s ease',
        }} />
      )}
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

export function DiaryPrompt({ index, children }: { index?: number; children: React.ReactNode }) {
  return (
    <div style={{ padding: '0 4px 10px' }}>
      {index !== undefined && (
        <div style={{
          fontSize: 11, color: W.weak, fontWeight: 500,
          marginBottom: 4, fontVariantNumeric: 'tabular-nums',
        }}>Question {index}</div>
      )}
      <div style={{
        fontSize: 15, fontWeight: 600, color: W.ink, lineHeight: 1.35,
      }}>{children}</div>
    </div>
  );
}
