import { render, screen } from '@testing-library/react';
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
});
