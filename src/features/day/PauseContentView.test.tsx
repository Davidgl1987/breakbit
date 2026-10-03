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

  it('says nothing about standing for moves that need standing anyway', () => {
    render(<PauseContentView content={{ kind: 'exercises', exerciseIds: ['air_squats'] }} />);
    expect(screen.queryByText('Si puedes, hazlo mejor de pie.')).not.toBeInTheDocument();
  });
});
