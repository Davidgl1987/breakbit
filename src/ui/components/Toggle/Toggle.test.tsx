import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Toggle } from './Toggle';

function Harness() {
  const [checked, setChecked] = useState(false);
  return <Toggle checked={checked} onChange={setChecked} label="Recordatorios" />;
}

describe('Toggle', () => {
  it('is a switch that toggles aria-checked', async () => {
    render(<Harness />);
    const toggle = screen.getByRole('switch', { name: 'Recordatorios' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});
