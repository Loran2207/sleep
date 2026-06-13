import { useEffect, useState } from 'react';
import { DeviceFrame } from './components/DeviceFrame';
import { MiniSoundsPlayer } from './components/shared';
import { useNavigation, useBrowserBack } from './state/navigation';
import { useOnboardingDone } from './state/store';
import { Onboarding } from './screens/Onboarding';
import type { ScreenId } from './tokens';

import { Home } from './screens/Home';
import { TrackPresets } from './screens/TrackPresets';
import { TrackNap, TrackNight } from './screens/TrackNapNight';
import { SoundsCatalog } from './screens/SoundsCatalog';
import { PlaceDevice } from './screens/PlaceDevice';
import { TrackingActive, TrackingMixer, TrackingStopConfirm } from './screens/Tracking';
import { RoutineSetup } from './screens/RoutineSetup';
import { CourseList, Lesson } from './screens/Course';
import { SleepSchedules } from './screens/SleepSchedules';
import { ScheduleMix } from './screens/ScheduleMixer';
import { HabitLibrary, RoutineCheckIn } from './screens/HabitsScreens';
import { PracticeIntro, PracticeSession, PracticeComplete } from './screens/Practice';
import { Journal } from './screens/Journal';
import { JournalEntryEdit } from './screens/JournalEntry';
import { WindDown } from './screens/WindDown';
import { SoundsPlayer } from './screens/Sounds';
import { WakeupSurvey } from './screens/WakeupSurvey';
import { NightShiftGuide } from './screens/NightShiftGuide';
import { Profile } from './screens/Profile';
import { Subscription } from './screens/Subscription';
import { QuizIntro, QuizSession, QuizResult } from './screens/Quiz';
import { AuthSignIn, AuthSignUp } from './screens/Auth';
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
  'tracking-stop-confirm': () => <TrackingStopConfirm />,
  'routine': () => <RoutineSetup />,
  'habit-library': () => <HabitLibrary />,
  'routine-checkin': () => <RoutineCheckIn />,
  'sleep-schedule': () => <SleepSchedules />,
  'schedule-mix': () => <ScheduleMix />,
  'course': () => <CourseList />,
  'lesson': () => <Lesson />,
  'practice-intro': () => <PracticeIntro />,
  'practice-session': () => <PracticeSession />,
  'practice-complete': () => <PracticeComplete />,
  'wind-down': () => <WindDown />,
  'sounds-player': () => <SoundsPlayer />,
  'wakeup-survey': () => <WakeupSurvey />,
  'night-shift-guide': () => <NightShiftGuide />,
  'analytics': () => <StubScreen title="Analytics" hint="Charts and trends will live here. Coming soon." />,
  'journal': () => <Journal />,
  'journal-entry': () => <JournalEntryEdit />,
  'profile': () => <Profile />,
  'subscription': () => <Subscription />,
  'quiz-intro': () => <QuizIntro />,
  'quiz-session': () => <QuizSession />,
  'quiz-result': () => <QuizResult />,
  'auth-sign-in': () => <AuthSignIn />,
  'auth-sign-up': () => <AuthSignUp />,
};

export function App() {
  useBrowserBack();
  const { screenId } = useNavigation();
  const isMobileViewport = useIsMobileViewport();
  const onboardingDone = useOnboardingDone();

  const Screen = SCREENS[screenId] || SCREENS['home'];

  // Before the app proper, run the first-run onboarding. It renders
  // inside the same frame so the phone chrome stays consistent, but
  // without the bottom nav / mini player. Auth screens can be entered
  // from the welcome step (or the profile banner) and override the
  // onboarding gate so the form takes over the frame cleanly.
  const isAuthScreen = screenId.startsWith('auth-');
  const body = isAuthScreen
    ? <Screen />
    : onboardingDone
      ? <><Screen /><MiniSoundsPlayer /></>
      : <Onboarding />;

  // Mobile: render full-bleed (no device frame). Desktop: show framed phone.
  if (isMobileViewport) {
    return (
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: '#000', color: '#fff',
      }}>
        {body}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', overflow: 'auto',
      background: '#000000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <DeviceFrame>
        {body}
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
