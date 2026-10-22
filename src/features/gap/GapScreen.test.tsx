import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { gapPath, ROUTES } from '@/app/routes';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { DateKey, HHmm } from '@/domain/types';
import { atTime } from '@/domain/time';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { SAMPLE_DATE as DATE, sampleAt as at, sampleDay } from '@/test/sampleDay';
import { renderWithRouter } from '@/test/render';

const store = () => useAppStore.getState();
const ui = (route: string) => renderWithRouter(<AppRoutes />, { route });
function setUp(time: HHmm, { started = true } = {}) {
  store().completeOnboarding(DEFAULT_SETTINGS);
  if (started) store().startDay(sampleDay());
  clock.travelTo(at(time));
}

afterEach(() => clock.setOffset(0));

describe('Tengo un hueco', () => {
  it('asks how much time there is', () => {
    setUp('09:20');
    ui(ROUTES.gap);
    expect(screen.getByRole('dialog', { name: 'Tengo un hueco' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '¿Cuánto tiempo tienes?' })).toBeInTheDocument();
    for (const [title, href] of [
      ['1 minuto', gapPath('m1')],
      ['3 minutos', gapPath('m3')],
      ['5 minutos', gapPath('m5')],
      ['10+ minutos', gapPath('m10')],
    ]) {
      expect(
        screen.getByRole('link', {
          name: new RegExp(`^${title!.replace('+', '\\+')}`),
        }),
      ).toHaveAttribute('href', href);
    }
    // The main activity is still to do: 10+ minutes is a good time for it.
    expect(screen.getByRole('link', { name: /10\+ minutos/ })).toHaveTextContent(
      'Tu actividad · 20 min',
    );
  });

  it('asks to start the day first', () => {
    setUp('09:20', { started: false });
    ui(ROUTES.gap);
    expect(screen.getByRole('heading', { name: 'Prepara tu jornada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Preparar jornada' })).toHaveAttribute(
      'href',
      ROUTES.dayStart,
    );
  });

  it('does the next pause now when it is close', async () => {
    setUp('09:40');
    const { user } = ui(gapPath('m1'));
    expect(screen.getByText('Tu próxima pausa, ahora')).toBeInTheDocument();
    expect(screen.getByText('+100 XP · al completarla')).toBeInTheDocument();
    expect(screen.getByText('Cuenta como tu próxima pausa')).toBeInTheDocument();
    expect(screen.getByText('La de las 10:00: ya no te avisará.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Empezar ahora' }));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    expect(screen.getByRole('heading', { level: 1, name: '¡Pausa hecha!' })).toBeInTheDocument();
    expect(screen.getByText('+100 pausa')).toBeInTheDocument();
  });

  it('is an extra pause otherwise, that leaves the plan as it is', async () => {
    setUp('09:20');
    const { user } = ui(gapPath('m1'));
    expect(screen.getByText('Pausa extra')).toBeInTheDocument();
    expect(screen.getByText('Tus pausas siguen igual.')).toBeInTheDocument();
    expect(screen.getByText('+10 XP · por la pausa extra')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Empezar ahora' }));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    expect(screen.getByText('+10 pausa extra')).toBeInTheDocument();
    expect(screen.getByText('+1 pausa extra')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Volver a lo mío' }));
    const timeline = screen
      .getByRole('heading', {
        name: 'Tu jornada',
      })
      .closest('section')!;
    expect(within(timeline).getByText('Pausa extra')).toBeInTheDocument();
    expect(screen.getByText('1 pausa extra')).toBeInTheDocument();
  });

  it('says when an extra pause earns no XP, and why', async () => {
    setUp('09:20');
    const { user } = ui(gapPath('m1'));
    await user.click(screen.getByRole('button', { name: 'Empezar ahora' }));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    await user.click(screen.getByRole('button', { name: 'Volver a lo mío' }));

    await user.click(screen.getByRole('link', { name: 'Tengo un hueco' }));
    await user.click(screen.getByRole('link', { name: /^1 minuto/ }));
    expect(screen.getByText('Pausa extra · sin XP esta vez')).toBeInTheDocument();
    expect(
      screen.getByText('Te has movido hace poco. Muévete igualmente: tus pausas siguen igual.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^\+0 XP$/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Empezar ahora' }));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    expect(screen.getByText('Pausa extra · sin XP esta vez')).toBeInTheDocument();
    expect(screen.getByText('Suma igualmente a tu movimiento de hoy.')).toBeInTheDocument();
    expect(screen.queryByText('+0 XP')).not.toBeInTheDocument();
  });

  it('goes for the pause already waiting', async () => {
    setUp('10:05');
    await act(() => store().reconcile(at('10:05')));
    ui(gapPath('m3'));
    expect(screen.getByText('Es tu pausa de las 10:00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Otra propuesta' })).not.toBeInTheDocument();
  });

  it('proposes the main activity for 10+ minutes', async () => {
    setUp('09:20');
    const { user } = ui(gapPath('m10'));
    expect(
      screen.getByRole('heading', { level: 2, name: 'Paseo por la calle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('+300 XP · por tu actividad')).toBeInTheDocument();
    expect(screen.getByText('Tu actividad de hoy')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Empezar ahora' }));
    expect(screen.getByRole('progressbar', { name: 'Tiempo de la actividad' })).toBeInTheDocument();
    expect(
      store().days[DATE]!.plan!.activities.find((item) => item.kind === 'main')!.startedAt,
    ).toBeDefined();
  });

  it('only suggests the main activity when it can be done now', () => {
    // A kettlebell block, but no kettlebell in the settings.
    store().completeOnboarding({ ...DEFAULT_SETTINGS, equipment: [] });
    const plan = sampleDay();
    store().startDay({
      ...plan,
      activities: plan.activities.map((item) =>
        item.kind === 'main'
          ? {
              ...item,
              content: { kind: 'main', activityId: 'kettlebell_block' },
            }
          : item,
      ),
    });
    clock.travelTo(at('09:20'));
    ui(ROUTES.gap);
    expect(screen.getByRole('link', { name: /10\+ minutos/ })).toHaveTextContent(
      'Un reset más largo',
    );
  });

  it('shows the real pending duration and explains a different time choice', async () => {
    setUp('10:05');
    await act(() => store().reconcile(at('10:05')));
    ui(gapPath('m3'));
    expect(screen.getAllByText('40 s').length).toBeGreaterThan(0);
    expect(
      screen.getByText('Elegiste 3 minutos; esta pausa pendiente dura 40 s.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Sin material')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Cómo hacerlo' })).toBeVisible();
  });

  it('keeps routine steps collapsed until a movement is opened, with duration and rounds', async () => {
    setUp('09:20');
    const plan = sampleDay();
    store().startDay({
      ...plan,
      activities: plan.activities.filter((item) => item.kind !== 'main'),
    });
    const { user, container } = ui(gapPath('m10'));
    expect(screen.getByText('10 min')).toBeInTheDocument();
    expect(screen.getByText('2 vueltas a la secuencia')).toBeInTheDocument();
    const moves = container.querySelectorAll('details');
    expect(moves.length).toBe(5);
    expect([...moves].every((move) => !move.open)).toBe(true);
    await user.click(moves[0]!.querySelector('summary')!);
    expect(moves[0]!.open).toBe(true);
    expect(within(moves[0]!).getByRole('list', { name: 'Cómo hacerlo' })).toBeVisible();
    expect(moves[1]!.open).toBe(false);
  });

  it('previews the moves to do, art only, instead of the avatar', () => {
    setUp('09:20');
    const plan = sampleDay();
    store().startDay({
      ...plan,
      activities: plan.activities.filter((item) => item.kind !== 'main'),
    });
    ui(gapPath('m10'));
    const preview = screen.getByRole('region', { name: 'Guía visual' });
    const sources = within(preview)
      .getAllByRole('img', { hidden: true })
      .map((image) => image.getAttribute('src')!);
    // Every move of the routine, each with its own postures.
    expect(sources.every((src) => /^\/exercises\/\w+\/0\d\.png$/.test(src))).toBe(true);
    expect(new Set(sources.map((src) => src.split('/')[2])).size).toBe(5);
    expect(within(preview).getByRole('button', { name: 'Pausar guía' })).toBeInTheDocument();
    expect(within(preview).queryByRole('button', { name: 'Postura siguiente' })).toBeNull();
    expect(document.querySelector('img[src^="/avatar/"]')).toBeNull();
  });

  it('shows the main activity duration rather than the time option', () => {
    setUp('09:20');
    ui(gapPath('m10'));
    expect(screen.getByText('20 min')).toBeInTheDocument();
    expect(screen.queryByText('10 min')).not.toBeInTheDocument();
    expect(screen.getByText('Cadera y piernas')).toBeInTheDocument();
  });

  it('shows the closed day summary without offering gaps', () => {
    setUp('17:05');
    store().closeDay(DATE);
    ui(ROUTES.gap);
    expect(screen.getByRole('heading', { name: 'Por hoy, listo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver el resumen de hoy' })).toHaveAttribute(
      'href',
      ROUTES.today,
    );
    expect(screen.getByText('0/3')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^1 minuto/ })).not.toBeInTheDocument();
  });

  it.each(['rest', 'day_off'])('offers preparation on %s, without recording a gap', (kind) => {
    setUp('09:20', { started: false });
    if (kind === 'rest') clock.travelTo(atTime('2026-10-10' as DateKey, '09:20'));
    else store().markDayOff(DATE);
    ui(ROUTES.gap);
    expect(screen.getByRole('heading', { name: 'Hoy, sin prisa' })).toBeInTheDocument();
    expect(screen.getByText('El descanso no rompe tu racha.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hoy sí trabajo' })).toHaveAttribute(
      'href',
      ROUTES.dayStart,
    );
    expect(screen.queryByRole('link', { name: /^1 minuto/ })).not.toBeInTheDocument();
  });

  it('offers another idea', async () => {
    setUp('09:20');
    const { user } = ui(gapPath('m1'));
    const name = () => document.getElementById('gap-proposal-title')?.textContent;
    const first = name();
    const seen = new Set([first]);
    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByRole('button', { name: 'Otra propuesta' }));
      seen.add(name());
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
