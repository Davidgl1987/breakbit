import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { MultiChipGroup } from './MultiChipGroup';

const DAYS = [
  { value: '1', label: 'L', ariaLabel: 'lunes' },
  { value: '2', label: 'M', ariaLabel: 'martes' },
  { value: '3', label: 'X', ariaLabel: 'miércoles' },
] as const;

function Harness() {
  const [values, setValues] = useState<string[]>(['1']);
  return (
    <>
      <MultiChipGroup label="Días" options={DAYS} values={values} onChange={setValues} />
      <output>{values.join(',')}</output>
    </>
  );
}

describe('MultiChipGroup', () => {
  it('toggles chips independently, keeping option order', async () => {
    render(<Harness />);
    expect(screen.getByRole('group', { name: 'Días' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'lunes' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'miércoles' }));
    await userEvent.click(screen.getByRole('button', { name: 'martes' }));
    expect(screen.getByRole('status')).toHaveTextContent('1,2,3');

    await userEvent.click(screen.getByRole('button', { name: 'lunes' }));
    expect(screen.getByRole('button', { name: 'lunes' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('2,3');
  });
});
