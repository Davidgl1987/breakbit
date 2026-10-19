import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { ActivityContent } from '@/domain/types';
import { PauseContentView } from './PauseContentView';

// Seated or standing: "better standing" applies, except in a meeting.
const content: ActivityContent = { kind: 'exercises', exerciseIds: ['neck_rotation'] };

describe('PauseContentView', () => {
  it('suggests standing when the move allows it', () => {
    render(<PauseContentView content={content} slot="work" />);
    expect(screen.getByText('Si puedes, hazlo mejor de pie.')).toBeInTheDocument();
  });

  it('keeps quiet about standing during a meeting', () => {
    render(<PauseContentView content={content} slot="meeting" />);
    expect(screen.queryByText('Si puedes, hazlo mejor de pie.')).not.toBeInTheDocument();
  });

  it('shows each move as a minute, alone or in a routine', () => {
    const { unmount } = render(<PauseContentView content={content} />);
    expect(screen.getByText('1 min')).toBeInTheDocument();
    unmount();
    render(<PauseContentView content={{ kind: 'routine', routineId: 'wake_up' }} />);
    expect(screen.getAllByText('· 1 min')).toHaveLength(3);
  });

  it('shows a routine done twice once, with its rounds', () => {
    render(<PauseContentView content={{ kind: 'routine', routineId: 'mobility_5', rounds: 2 }} />);
    expect(screen.getByText('2 vueltas a la secuencia')).toBeInTheDocument();
    expect(screen.getAllByText('· 1 min')).toHaveLength(5);
  });

  it('says nothing about standing for moves that need standing anyway', () => {
    render(<PauseContentView content={{ kind: 'exercises', exerciseIds: ['air_squats'] }} />);
    expect(screen.queryByText('Si puedes, hazlo mejor de pie.')).not.toBeInTheDocument();
  });

  it('shows a single exercise guide immediately, with instructions and no timer', () => {
    render(<PauseContentView content={content} showGuides collapsible />);
    const guide = screen.getByRole('region', { name: 'Guía visual' });
    expect(within(guide).getByRole('img')).toHaveAttribute('src', '/exercises/neck_rotation/01.png');
    expect(screen.getByRole('list', { name: 'Cómo hacerlo' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('loads routine guides on expansion and removes playback when the move closes', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PauseContentView
        content={{ kind: 'routine', routineId: 'wake_up' }}
        showGuides
        collapsible
      />,
    );
    expect(container.querySelectorAll('img')).toHaveLength(0);
    const summary = container.querySelector('summary')!;
    await user.click(summary);
    expect(await screen.findByRole('region', { name: 'Guía visual' })).toBeInTheDocument();
    expect(
      within(summary.closest('details')!).getByRole('list', { name: 'Cómo hacerlo' }),
    ).toBeInTheDocument();
    await user.click(summary);
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Guía visual' })).not.toBeInTheDocument(),
    );
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });

  it('keeps only one routine move open when switching between exercises', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PauseContentView
        content={{ kind: 'routine', routineId: 'wake_up' }}
        showGuides
        collapsible
      />,
    );
    const summaries = container.querySelectorAll('summary');
    await user.click(summaries[0]!);
    await screen.findByRole('region', { name: 'Guía visual' });
    await user.click(summaries[1]!);
    await waitFor(() => {
      expect(container.querySelectorAll('details[open]')).toHaveLength(1);
      expect(summaries[0]!.closest('details')).not.toHaveAttribute('open');
      expect(summaries[1]!.closest('details')).toHaveAttribute('open');
      expect(screen.getAllByRole('region', { name: 'Guía visual' })).toHaveLength(1);
    });
    await user.click(summaries[1]!);
    await waitFor(() => expect(container.querySelectorAll('details[open]')).toHaveLength(0));
  });
});
