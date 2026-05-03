import { Fragment, useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar, SectionLabel, LiquidGlassNav } from '../components/shared';
import { CategoryGlyph, CheckIcon, ChevronDownIcon } from '../components/icons';

const BLOCK_CATEGORIES = [
  { id: 'social', name: 'Social', glyph: 'social', apps: [
    { id: 'instagram', name: 'Instagram' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'x', name: 'X' },
    { id: 'reddit', name: 'Reddit' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'snapchat', name: 'Snapchat' },
  ]},
  { id: 'games', name: 'Games', glyph: 'games', apps: [
    { id: 'roblox', name: 'Roblox' },
    { id: 'clash', name: 'Clash of Clans' },
    { id: 'candy', name: 'Candy Crush' },
    { id: 'pubg', name: 'PUBG Mobile' },
    { id: 'genshin', name: 'Genshin Impact' },
  ]},
  { id: 'entertainment', name: 'Entertainment', glyph: 'entertainment', apps: [
    { id: 'youtube', name: 'YouTube' },
    { id: 'netflix', name: 'Netflix' },
    { id: 'twitch', name: 'Twitch' },
    { id: 'spotify', name: 'Spotify' },
    { id: 'disney', name: 'Disney+' },
  ]},
  { id: 'creativity', name: 'Creativity', glyph: 'creativity', apps: [
    { id: 'figma', name: 'Figma' },
    { id: 'procreate', name: 'Procreate' },
    { id: 'lightroom', name: 'Lightroom' },
    { id: 'capcut', name: 'CapCut' },
  ]},
  { id: 'education', name: 'Education', glyph: 'education', apps: [
    { id: 'duolingo', name: 'Duolingo' },
    { id: 'khan', name: 'Khan Academy' },
    { id: 'coursera', name: 'Coursera' },
  ]},
  { id: 'health', name: 'Health & fitness', glyph: 'health', apps: [
    { id: 'strava', name: 'Strava' },
    { id: 'nike', name: 'Nike Training' },
    { id: 'calm', name: 'Calm' },
  ]},
  { id: 'reading', name: 'Reading', glyph: 'reading', apps: [
    { id: 'kindle', name: 'Kindle' },
    { id: 'medium', name: 'Medium' },
  ]},
  { id: 'shopping', name: 'Shopping', glyph: 'shopping', apps: [
    { id: 'amazon', name: 'Amazon' },
    { id: 'shein', name: 'Shein' },
    { id: 'ebay', name: 'eBay' },
  ]},
  { id: 'news', name: 'News', glyph: 'news', apps: [
    { id: 'apple-news', name: 'Apple News' },
    { id: 'nyt', name: 'The New York Times' },
    { id: 'bbc', name: 'BBC News' },
  ]},
];

export function RoutineSetup() {
  const initialApps: Record<string, boolean> = {};
  BLOCK_CATEGORIES.forEach((c) => {
    if (c.id === 'social' || c.id === 'games') {
      c.apps.forEach((a) => { initialApps[a.id] = true; });
    }
  });
  const [appsOn, setAppsOn] = useState(initialApps);
  const [allApps, setAllApps] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const leadOptions = [0, 10, 30, 60, 90];
  const [leadMin, setLeadMin] = useState(30);

  const bedtime = '22:30';
  const blockStart = (() => {
    const [h, m] = bedtime.split(':').map(Number);
    const total = (h * 60 + m - leadMin + 24 * 60) % (24 * 60);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  })();

  const catSelectedCount = (cat: typeof BLOCK_CATEGORIES[number]) => cat.apps.filter((a) => appsOn[a.id]).length;
  const catAllOn = (cat: typeof BLOCK_CATEGORIES[number]) => cat.apps.every((a) => appsOn[a.id]);
  const catNoneOn = (cat: typeof BLOCK_CATEGORIES[number]) => cat.apps.every((a) => !appsOn[a.id]);
  const catState = (cat: typeof BLOCK_CATEGORIES[number]) =>
    catAllOn(cat) ? 'all' : catNoneOn(cat) ? 'none' : 'some';

  const toggleApp = (appId: string) => {
    if (allApps) return;
    setAppsOn((s) => ({ ...s, [appId]: !s[appId] }));
  };
  const toggleCategory = (cat: typeof BLOCK_CATEGORIES[number]) => {
    if (allApps) return;
    const target = !catAllOn(cat);
    setAppsOn((s) => {
      const next = { ...s };
      cat.apps.forEach((a) => { next[a.id] = target; });
      return next;
    });
  };
  const toggleExpand = (catId: string) => {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(catId)) n.delete(catId); else n.add(catId);
      return n;
    });
  };
  const toggleAll = () => setAllApps((v) => !v);

  const totalSelected = BLOCK_CATEGORIES.reduce((sum, c) => sum + catSelectedCount(c), 0);
  const totalApps = BLOCK_CATEGORIES.reduce((sum, c) => sum + c.apps.length, 0);
  const blockedLabel = allApps
    ? `All ${totalApps} apps`
    : totalSelected === 0 ? 'Nothing selected' : `${totalSelected} ${totalSelected === 1 ? 'app' : 'apps'} selected`;

  const leadStartLabel = leadMin === 0 ? `At ${bedtime}` : `From ${blockStart}`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad />
      <HeaderBar title="Block apps" onBack={() => go('home')} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 220px' }}>
        <div style={{ marginTop: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '0 4px 10px',
          }}>
            <SectionLabel inline>Start blocking</SectionLabel>
            <div style={{ fontSize: 12, color: W.weak, fontVariantNumeric: 'tabular-nums' }}>
              {leadStartLabel}
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4,
            background: W.paper, borderRadius: 14, padding: 4,
            border: `1px solid ${W.fill}`,
          }}>
            {leadOptions.map((min) => {
              const active = leadMin === min;
              const label = min === 0 ? 'At bed' : `−${min}m`;
              return (
                <div key={min} onClick={() => setLeadMin(min)} style={{
                  padding: '10px 0', textAlign: 'center', borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
                  fontVariantNumeric: 'tabular-nums',
                  background: active ? W.ink : 'transparent',
                  color: active ? W.bg : W.ink,
                  transition: 'background .12s, color .12s',
                }}>{label}</div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 10px' }}>
            <SectionLabel inline>What to block</SectionLabel>
            <div style={{ fontSize: 12, color: W.ink, fontWeight: 500 }}>{blockedLabel}</div>
          </div>

          <div style={{
            background: W.paper, borderRadius: 18,
            border: `1px solid ${W.fill}`, overflow: 'hidden',
          }}>
            <CategoryRow
              glyph="all" name="All apps and categories"
              checked={allApps} onToggleCheck={toggleAll} isFirst
            />
            {BLOCK_CATEGORIES.map((c) => {
              const state = catState(c);
              const isOpen = expanded.has(c.id);
              const checked = allApps ? true : (state === 'all');
              const partial = !allApps && state === 'some';
              const rightLabel = allApps
                ? 'All'
                : state === 'all' ? `${c.apps.length}/${c.apps.length}`
                  : state === 'some' ? `${catSelectedCount(c)}/${c.apps.length}`
                    : `${c.apps.length}`;

              return (
                <Fragment key={c.id}>
                  <CategoryRow
                    glyph={c.glyph}
                    name={c.name}
                    rightLabel={rightLabel}
                    checked={checked}
                    partial={partial}
                    disabled={allApps}
                    onToggleCheck={() => toggleCategory(c)}
                    onClickRow={() => !allApps && toggleExpand(c.id)}
                    expanded={isOpen}
                    expandable
                  />
                  {isOpen && !allApps && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderTop: `1px solid ${W.fill}`,
                    }}>
                      {c.apps.map((app) => (
                        <AppSubRow
                          key={app.id}
                          name={app.name}
                          checked={!!appsOn[app.id]}
                          onToggle={() => toggleApp(app.id)}
                        />
                      ))}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 4 }}>
        <div onClick={() => go('home')} style={{
          padding: '16px 0', textAlign: 'center', background: W.ink, color: W.paper,
          borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        }}>Save routine</div>
      </div>

      <LiquidGlassNav active="home" />
    </div>
  );
}

function CategoryRow({
  glyph, name, rightLabel = null, checked, partial = false, disabled = false,
  onToggleCheck, onClickRow, expandable = false, expanded = false, isFirst = false,
}: {
  glyph: string; name: string;
  rightLabel?: string | null;
  checked: boolean; partial?: boolean; disabled?: boolean;
  onToggleCheck?: () => void; onClickRow?: () => void;
  expandable?: boolean; expanded?: boolean; isFirst?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 14px',
      borderTop: isFirst ? 'none' : `1px solid ${W.fill}`,
      opacity: disabled ? 0.45 : 1,
      transition: 'opacity .15s, background .15s',
      background: expanded ? 'rgba(255,255,255,0.02)' : 'transparent',
    }}>
      <div onClick={(e) => { if (disabled) return; e.stopPropagation(); onToggleCheck && onToggleCheck(); }}
        style={{
          width: 22, height: 22, borderRadius: 11, flexShrink: 0,
          border: checked ? 'none' : `1.5px solid ${W.veryweak}`,
          background: checked ? W.ink : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? 'default' : 'pointer',
        }}>
        {checked && !partial && <CheckIcon size={12} stroke={W.bg} />}
        {partial && <div style={{ width: 10, height: 2, background: W.bg, borderRadius: 1 }} />}
      </div>

      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: W.fill, border: `1px solid ${W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><CategoryGlyph name={glyph} size={18} stroke={W.ink} /></div>

      <div onClick={() => { if (disabled) return; onClickRow && onClickRow(); }} style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10,
        cursor: (expandable && !disabled) ? 'pointer' : 'default',
      }}>
        <div style={{
          flex: 1, minWidth: 0,
          fontSize: 14, fontWeight: 500, color: W.ink,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{name}</div>

        {rightLabel && (
          <div style={{ fontSize: 12, color: W.weak, fontVariantNumeric: 'tabular-nums' }}>
            {rightLabel}
          </div>
        )}
        {expandable && (
          <div style={{ transition: 'transform .15s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            <ChevronDownIcon size={14} stroke={W.veryweak} />
          </div>
        )}
      </div>
    </div>
  );
}

function AppSubRow({ name, checked, onToggle }: { name: string; checked: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px 11px 58px',
      cursor: 'pointer',
      borderTop: `1px solid ${W.fill}`,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10, flexShrink: 0,
        border: checked ? 'none' : `1.5px solid ${W.veryweak}`,
        background: checked ? W.ink : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{checked && <CheckIcon size={11} stroke={W.bg} />}</div>
      <div style={{
        fontSize: 13, color: checked ? W.ink : W.weak,
        fontWeight: checked ? 500 : 400,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        flex: 1, minWidth: 0,
      }}>{name}</div>
    </div>
  );
}
