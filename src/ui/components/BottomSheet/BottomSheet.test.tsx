import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(<BottomSheet open={false} onClose={() => {}} title="¿Descartar?" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a labelled modal dialog that closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} title="¿Descartar esta pausa?">
        <p>Resta 50 XP</p>
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog', { name: '¿Descartar esta pausa?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
