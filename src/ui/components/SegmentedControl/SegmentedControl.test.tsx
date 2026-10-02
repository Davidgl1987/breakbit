import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl', () => {
  it('reports the chosen segment', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Apariencia"
        value="light"
        onChange={onChange}
        options={[
          { value: 'light', label: 'Claro' },
          { value: 'dark', label: 'Oscuro' },
          { value: 'system', label: 'Sistema' },
        ]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Claro' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('radio', { name: 'Oscuro' }));
    expect(onChange).toHaveBeenCalledWith('dark');
  });
});
