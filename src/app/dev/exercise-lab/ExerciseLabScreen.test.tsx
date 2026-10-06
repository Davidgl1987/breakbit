import { screen, within } from '@testing-library/react';
import { clear, createStore } from 'idb-keyval';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { renderWithRouter } from '@/test/render';
import { ExerciseLabScreen } from './ExerciseLabScreen';
import { readReviews, saveReview } from './reviewStorage';

const [first, second] = CATALOG.exercises;
const total = CATALOG.exercises.length;
const ui = () => renderWithRouter(<ExerciseLabScreen />, { route: '/dev/exercises' });

describe('Exercise Lab', () => {
  beforeEach(() => {
    // jsdom has no layout.
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.scrollTo = vi.fn();
  });

  afterEach(async () => {
    await clear(createStore('breakbit-lab', 'reviews'));
  });

  it('tries, rates and decides an exercise, then moves on to the next pending one', async () => {
    const { user } = ui();
    expect(await screen.findByText(`0 / ${total} revisados`)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Empezar por el primero pendiente' }));
    expect(screen.getByRole('heading', { name: first!.name.es })).toBeInTheDocument();

    // The real timer, with the exercise's own duration.
    await user.click(screen.getByRole('button', { name: 'Probar ejercicio' }));
    expect(screen.getByText(/^Quedan \d:\d\d$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Terminar' }));
    expect(screen.getByText('¡Hecho! ¿Qué te ha parecido?')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Lo he probado' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: '😍 Muy bueno' }));
    const quality = screen.getByRole('radiogroup', { name: 'Calidad del ejercicio' });
    await user.click(within(quality).getByRole('radio', { name: '4' }));
    const fit = screen.getByRole('radiogroup', { name: 'Calidad como micropausa' });
    await user.click(within(fit).getByRole('radio', { name: '5' }));
    const decision = screen.getByRole('radiogroup', { name: 'Decisión' });
    await user.click(within(decision).getByRole('radio', { name: '✅ Mantener' }));
    await user.type(screen.getByRole('textbox', { name: 'Notas' }), 'Muy bueno sentado');

    expect(screen.getByText(`1 / ${total} revisados`)).toBeInTheDocument();
    expect(screen.getByText('✅ Mantener: 1')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Siguiente pendiente' })[0]!);
    expect(screen.getByRole('heading', { name: second!.name.es })).toBeInTheDocument();

    const saved = await readReviews();
    expect(saved[first!.id]).toMatchObject({
      tested: true,
      rating: 4,
      exerciseQuality: 4,
      microbreakQuality: 5,
      decision: 'keep',
      notes: 'Muy bueno sentado',
    });
  });

  it('picks up the saved reviews and filters the catalog by them', async () => {
    await saveReview({
      exerciseId: first!.id,
      tested: true,
      decision: 'delete',
      updatedAt: '2026-10-06T09:00:00.000Z',
    });
    const { user } = ui();
    expect(await screen.findByText(`1 / ${total} revisados`)).toBeInTheDocument();

    const status = screen.getByRole('radiogroup', { name: 'Estado' });
    await user.click(within(status).getByRole('radio', { name: '🗑️ Eliminar' }));
    const list = screen.getByRole('complementary', { name: 'Catálogo' });
    expect(within(list).getByText('1 ejercicio')).toBeInTheDocument();
    expect(within(list).getByRole('button', { name: new RegExp(first!.name.es) })).toBeVisible();
  });
});
