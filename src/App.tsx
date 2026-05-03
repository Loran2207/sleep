import { useEffect, useState } from 'react';
import { DeviceFrame } from './components/DeviceFrame';
import { useNavigation, useBrowserBack } from './state/navigation';
import type { ScreenId } from './tokens';

import { Home } from './screens/Home';
import { TrackPresets } from './screens/TrackPresets';
import { TrackNap, TrackNight } from './screens/TrackNapNight';
import { SoundsCatalog } from './screens/SoundsCatalog';
import { PlaceDevice } from './screens/PlaceDevice';
import { TrackingActive, TrackingMixer, TrackingSounds, TrackingStopConfirm } from './screens/Tracking';
import { RoutineSetup } from './screens/RoutineSetup';
import { CourseList, Lesson } from './screens/Course';
import { SleepSchedules } from './screens/SleepSchedules';
import { ScheduleMix, ScheduleSounds } from './screens/ScheduleMixer';
import { HabitLibrary, RoutineCheckIn } from './screens/HabitsScreens';
import { PracticeIntro, PracticeSession, PracticeComplete } from './screens/Practice';
import { Journal } from './screens/Journal';
import { JournalEntryEdit } from './screens/JournalEntry';
import { StubScreen } from './screens/Stub';

const SCREENS: Record<ScreenId, () => JSX.Element> = {
  'home': () => <Home />,
  'track-mode': () => <TrackPresets />,
  'track-nap': () => <TrackNap />,
  'track-night': () => <TrackNight />,
  'sounds': () => <SoundsCatalog />,
  'place-device': () => <PlaceDevice />,
  'tracking-active': () => <TrackingActive />,
  'tracking-mixer': () => <TrackingMixer />,
  'tracking-sounds': () => <TrackingSounds />,
  'tracking-stop-confirm': () => <TrackingStopConfirm />,
  'routine': () => <RoutineSetup />,
  'habit-library': () => <HabitLibrary />,
  'routine-checkin': () => <RoutineCheckIn />,
  'sleep-schedule': () => <SleepSchedules />,
  'schedule-mix': () => <ScheduleMix />,
  'schedule-sounds': () => <ScheduleSounds />,
  'course': () => <CourseList />,
  'lesson': () => <Lesson />,
  'practice-intro': () => <PracticeIntro />,
  'practice-session': () => <PracticeSession />,
  'practice-complete': () => <PracticeComplete />,
  'analytics': () => <StubScreen title="Analytics" hint="Charts and trends will live here. Coming soon." />,
  'journal': () => <Journal />,
  'journal-entry': () => <JournalEntryEdit />,
  'profile': () => <StubScreen title="Profile" hint="Account, sounds, preferences. Coming soon." />,
};

export function App() {
  useBrowserBack();
  const { screenId } = useNavigation();
  const isMobileViewport = useIsMobileViewport();

  const Screen = SCREENS[screenId] || SCREENS['home'];

  // Mobile: render full-bleed (no device frame). Desktop: show framed phone.
  if (isMobileViewport) {
    return (
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: '#000', color: '#fff',
      }}>
        <Screen />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', overflow: 'auto',
      background: '#0E0E11',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <DeviceFrame>
        <Screen />
      </DeviceFrame>
    </div>
  );
}

// Mobile breakpoint: viewport narrower than the phone's design width
function useIsMobileViewport() {
  const [is, setIs] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 480,
  );
  useEffect(() => {
    const onResize = () => setIs(window.innerWidth <= 480);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return is;
}
