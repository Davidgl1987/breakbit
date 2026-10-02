import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders a type="button" with the variant class', () => {
    render(<Button variant="destructive">Descartar pausa</Button>);
    const button = screen.getByRole('button', { name: 'Descartar pausa' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button.className).toContain('destructive');
  });

  it('calls onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Vamos</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Vamos' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Vamos
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Vamos' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('exposes the selected state as aria-pressed', () => {
    render(
      <>
        <Button pressed>+5 min</Button>
        <Button>+10 min</Button>
      </>,
    );
    expect(screen.getByRole('button', { name: '+5 min' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '+10 min' })).not.toHaveAttribute('aria-pressed');
  });
});
