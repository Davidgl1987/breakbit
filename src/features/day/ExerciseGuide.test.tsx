import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISE_GUIDES } from '@/assets/exerciseGuides';
import { CATALOG } from '@/content/catalog';
import { MovePlayer } from '@/features/pause/MovePlayer';
import { useStepTimer } from '@/features/pause/useStepTimer';
import { ActivityGuide, MovesPreview } from './ActivityPresentation';
import { ExerciseGuide } from './ExerciseGuide';

const guide = EXERCISE_GUIDES.chin_tuck!;
const chin = CATALOG.exercises.find((exercise) => exercise.id === 'chin_tuck')!;

function loadFrames() {
  screen.getAllByRole('img', { hidden: true }).forEach((image) => fireEvent.load(image));
}

/** The posture on screen: the only frame that isn't hidden. */
function shownFrame() {
  return screen.getByRole('img');
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('exercise guide', () => {
  it('switches the gaze arrow from finger to distance and removes it on image failure', () => {
    const { container } = render(<ExerciseGuide guide={EXERCISE_GUIDES.near_far_focus!} />);
    loadFrames();
    const endpoint = () => Number(container.querySelector('line[marker-end]')?.getAttribute('x2'));
    const nearEndpoint = endpoint();
    fireEvent.click(screen.getByRole('button', { name: 'Postura siguiente' }));
    expect(endpoint()).toBeGreaterThan(nearEndpoint);
    fireEvent.click(screen.getByRole('button', { name: 'Postura anterior' }));
    expect(endpoint()).toBe(nearEndpoint);
    fireEvent.error(screen.getAllByRole('img', { hidden: true })[0]!);
    expect(container.querySelector('line[marker-end]')).not.toBeInTheDocument();
  });

  it('changes every second, returning to neutral between sides even for held stretches', () => {
    render(<ExerciseGuide guide={EXERCISE_GUIDES.neck_side_tilt!} />);
    loadFrames();
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getByText('Postura 1/3')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText('Postura 2/3')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Postura 1/3')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Postura 3/3')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Postura 1/3')).toBeInTheDocument();
  });

  it('waits for all images, cycles every second and pauses independently', () => {
    render(<ExerciseGuide guide={guide} />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText('Postura 1/2')).toBeInTheDocument();
    loadFrames();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Postura 2/2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar guía' }));
    act(() => vi.advanceTimersByTime(20_000));
    expect(screen.getByText('Postura 2/2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar guía' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Postura 1/2')).toBeInTheDocument();
  });

  it('manual navigation stops automatic changes and wraps in both directions', () => {
    render(<ExerciseGuide guide={guide} />);
    loadFrames();
    fireEvent.click(screen.getByRole('button', { name: 'Postura anterior' }));
    expect(screen.getByText('Postura 2/2')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText('Postura 2/2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Postura siguiente' }));
    expect(screen.getByText('Postura 1/2')).toBeInTheDocument();
  });

  it('uses manual playback by default for reduced motion', () => {
    const normal = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      ...normal(query),
      matches: query.includes('prefers-reduced-motion'),
    }));
    render(<ExerciseGuide guide={guide} />);
    loadFrames();
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText('Postura 1/2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reanudar guía' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Postura siguiente' }));
    expect(screen.getByText('Postura 2/2')).toBeInTheDocument();
  });

  it('resets at the first posture when the routine changes exercise and clears playback on exit', () => {
    const { rerender, unmount } = render(<ActivityGuide exercise={chin} />);
    loadFrames();
    fireEvent.click(screen.getByRole('button', { name: 'Postura siguiente' }));
    const squat = CATALOG.exercises.find((exercise) => exercise.id === 'air_squats')!;
    rerender(<ActivityGuide exercise={squat} />);
    expect(screen.getByText('Postura 1/2')).toBeInTheDocument();
    loadFrames();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('falls back to the headphone-free avatar if a frame cannot load', () => {
    render(<ExerciseGuide guide={guide} />);
    fireEvent.error(screen.getAllByRole('img', { hidden: true })[0]!);
    expect(screen.getByRole('img', { name: 'Demostración del ejercicio' })).toHaveAttribute(
      'src',
      '/exercises/avatar.png',
    );
    expect(screen.queryByRole('button', { name: 'Pausar guía' })).not.toBeInTheDocument();
  });

  it('pausing the guide leaves the running exercise timer counting down', () => {
    function Player() {
      const timer = useStepTimer([60], () => {});
      return <MovePlayer exercise={chin} timer={timer} top={null} last />;
    }
    render(<Player />);
    loadFrames();
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pausar guía' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('button', { name: 'Reanudar guía' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
    expect(shownFrame()).toHaveAttribute('src', guide.frames[0]!.src);
    expect(screen.getByText(/^0:5[0-9]$/)).toBeInTheDocument();
  });
});

describe('exercise guide without controls', () => {
  it('is only the moving art on the exercise screen: no navigation or caption', () => {
    function Player() {
      const timer = useStepTimer([60], () => {});
      return <MovePlayer exercise={chin} timer={timer} top={null} last />;
    }
    render(<Player />);
    loadFrames();
    const region = screen.getByRole('region', { name: 'Guía visual' });
    expect(within(region).queryByRole('button', { name: 'Postura siguiente' })).toBeNull();
    expect(within(region).queryByText(/^Postura \d/)).toBeNull();
    expect(within(region).queryByText(guide.frames[0]!.description.es)).toBeNull();
    expect(shownFrame()).toHaveAttribute('src', guide.frames[0]!.src);
    act(() => vi.advanceTimersByTime(1000));
    expect(shownFrame()).toHaveAttribute('src', guide.frames[1]!.src);
  });

  it('pauses and resumes with a tap on the art', () => {
    const { container } = render(<ExerciseGuide guide={guide} controls={false} />);
    loadFrames();
    expect(container.querySelector('svg')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar guía' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(shownFrame()).toHaveAttribute('src', guide.frames[0]!.src);
    // A paused guide says so on the art itself.
    expect(container.querySelector('svg')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar guía' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(shownFrame()).toHaveAttribute('src', guide.frames[1]!.src);
  });

  it('waits for a tap to move with reduced motion', () => {
    const normal = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      ...normal(query),
      matches: query.includes('prefers-reduced-motion'),
    }));
    render(<ExerciseGuide guide={guide} controls={false} />);
    loadFrames();
    act(() => vi.advanceTimersByTime(10_000));
    expect(shownFrame()).toHaveAttribute('src', guide.frames[0]!.src);
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar guía' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(shownFrame()).toHaveAttribute('src', guide.frames[1]!.src);
  });
});

describe('moves preview', () => {
  const squat = CATALOG.exercises.find((exercise) => exercise.id === 'air_squats')!;
  const squatGuide = EXERCISE_GUIDES.air_squats!;

  it('plays each move once, in order, and starts over', () => {
    render(<MovesPreview exercises={[chin, squat, chin]} />);
    loadFrames();
    const order = [...guide.sequence, ...squatGuide.sequence].map(
      (index, step) => (step < guide.sequence.length ? guide : squatGuide).frames[index]!.src,
    );
    for (const src of [...order, order[0]]) {
      expect(shownFrame()).toHaveAttribute('src', src);
      act(() => vi.advanceTimersByTime(1000));
    }
    expect(screen.queryByRole('button', { name: 'Postura siguiente' })).toBeNull();
  });

  it('shows the avatar when no move has guide art', () => {
    render(<MovesPreview exercises={[{ ...chin, id: 'retired' }]} />);
    expect(screen.getByRole('img', { name: 'Demostración del ejercicio' })).toHaveAttribute(
      'src',
      '/exercises/avatar.png',
    );
  });
});
