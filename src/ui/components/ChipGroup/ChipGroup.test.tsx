import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ChipGroup } from './ChipGroup';

const OPTIONS = [
  { value: 'soft', label: 'Suave' },
  { value: 'normal', label: 'Normal' },
  { value: 'active', label: 'Activo' },
] as const;

function Harness() {
  const [value, setValue] = useState<(typeof OPTIONS)[number]['value']>('normal');
  return <ChipGroup label="Intensidad" options={OPTIONS} value={value} onChange={setValue} />;
}

describe('ChipGroup', () => {
  it('is a radio group with a single selected chip', async () => {
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Intensidad' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Normal' })).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('radio', { name: 'Activo' }));
    expect(screen.getByRole('radio', { name: 'Activo' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Normal' })).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps only the selected chip in the tab order', () => {
    render(<Harness />);
    expect(screen.getByRole('radio', { name: 'Normal' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Suave' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves the selection with the arrow keys, wrapping around', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: 'Normal' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Activo' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Activo' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Suave' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Activo' })).toHaveAttribute('aria-checked', 'true');
  });
});
