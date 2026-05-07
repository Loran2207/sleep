import { W } from '../tokens';
import { CheckIcon, MoodBlob } from './icons';
import { DIARY_QUESTIONS, QUALITY_OPTIONS } from '../data/diary';

// Reusable sleep-diary quiz. Used by the wake-up survey and the
// journal entry editor.
export function DiaryQuiz({ diary, onChange }: {
  diary: Record<string, string | string[]>;
  onChange: (next: Record<string, string | string[]>) => void;
}) {
  const quality = (diary['quality'] as string | undefined) ?? '';

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
      <div>
        <Prompt>How would you rate your sleep last night?</Prompt>
        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: 6,
          padding: '4px 4px 0',
        }}>
          {QUALITY_OPTIONS.map((opt) => {
            const on = quality === opt.id;
            return (
              <div key={opt.id} onClick={() => setSingle('quality', opt.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer',
                padding: '10px 4px', borderRadius: 16,
                background: on ? W.fill : 'transparent',
                border: `1px solid ${on ? W.veryweak : 'transparent'}`,
                transition: 'background .12s ease, border-color .12s ease',
              }}>
                <div style={{
                  filter: on ? 'none' : 'grayscale(0.25)',
                  opacity: on ? 1 : 0.85,
                  transition: 'filter .15s ease, opacity .15s ease',
                }}>
                  <MoodBlob type={opt.mood} size={36} />
                </div>
                <div style={{
                  fontSize: 11, lineHeight: 1.2, textAlign: 'center',
                  color: on ? W.ink : W.weak, fontWeight: on ? 600 : 500,
                }}>{opt.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {DIARY_QUESTIONS.map((q) => (
        <div key={q.id}>
          <Prompt>{q.prompt}</Prompt>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 4px' }}>
            {q.options.map((opt) => {
              const on = q.multi
                ? Array.isArray(diary[q.id]) && (diary[q.id] as string[]).includes(opt.id)
                : diary[q.id] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => q.multi ? toggleMulti(q.id, opt.id) : setSingle(q.id, opt.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '9px 14px', borderRadius: 999,
                    cursor: 'pointer',
                    background: on ? W.ink : 'transparent',
                    color: on ? W.bg : W.ink,
                    border: `1px solid ${on ? W.ink : W.fill}`,
                    transition: 'background .12s ease, color .12s ease',
                  }}
                >
                  {on && <CheckIcon size={12} stroke={W.bg} />}
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// How many of the 9 questions have a non-empty answer (for the
// summary card on Journal Entry).
export function diaryAnsweredCount(diary: Record<string, string | string[]>): number {
  let count = 0;
  if (diary['quality']) count++;
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

export const DIARY_TOTAL = DIARY_QUESTIONS.length + 1; // +1 for quality

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 14, fontWeight: 600, color: W.ink,
      padding: '0 4px 10px', lineHeight: 1.35,
    }}>{children}</div>
  );
}
