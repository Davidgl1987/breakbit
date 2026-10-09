import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(<BottomSheet open={false} onClose={() => {}} title="¿Descartar?" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes with the X or backdrop, but keeps clicks inside the sheet', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} title="Pasos">
        <p>Cómo hacerlo</p>
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.mouseDown(dialog);
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(onClose).toHaveBeenCalledOnce();
    fireEvent.mouseDown(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(2);
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
