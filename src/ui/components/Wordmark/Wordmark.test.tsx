import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Wordmark } from './Wordmark';

describe('Wordmark', () => {
  it('has the light and the dark art, named Breakbit (CSS shows the one for the theme)', () => {
    render(<Wordmark />);
    const sources = screen
      .getAllByRole('img', { name: 'Breakbit' })
      .map((image) => image.getAttribute('src'));
    expect(sources).toEqual(['/brand/wordmark-light.png', '/brand/wordmark-dark.png']);
  });
});
