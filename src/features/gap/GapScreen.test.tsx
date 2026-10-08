import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { gapPath, ROUTES } from '@/app/routes';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { HHmm } from '@/domain/types';
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
    expect(screen.getByRole('heading', { level: 1, name: 'Tengo un hueco' })).toBeInTheDocument();
    expect(screen.getByText('¡Cualquier momento es bueno para moverte!')).toBeInTheDocument();
    for (const [title, href] of [
      ['1 minuto', gapPath('m1')],
      ['3 minutos', gapPath('m3')],
      ['5 minutos', gapPath('m5')],
      ['10+ minutos', gapPath('m10')],
    ]) {
      expect(
        screen.getByRole('link', { name: new RegExp(`^${title!.replace('+', '\\+')}`) }),
      ).toHaveAttribute('href', href);
    }
    // The main activity is still to do: 10+ minutes is a good time for it.
    expect(screen.getByRole('link', { name: /10\+ minutos/ })).toHaveTextContent(
      'Buen momento para tu actividad',
    );
  });

  it('asks to start the day first', () => {
    setUp('09:20', { started: false });
    ui(ROUTES.gap);
    expect(screen.getByText('Tu jornada aún no ha empezado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empezar jornada' })).toHaveAttribute(
      'href',
      ROUTES.dayStart,
    );
  });

  it('does the next pause now when it is close', async () => {
    setUp('09:40');
    const { user } = ui(gapPath('m1'));
    expect(screen.getByText('Propuesta de 1 minuto')).toBeInTheDocument();
    expect(screen.getByText('+100 XP')).toBeInTheDocument();
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
    expect(screen.getByText('+10 XP')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Empezar ahora' }));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    expect(screen.getByText('+10 pausa extra')).toBeInTheDocument();
    expect(screen.getByText('+1 pausa extra')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Volver a lo mío' }));
    const timeline = screen.getByRole('heading', { name: 'Tu jornada' }).parentElement!;
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
      screen.getByRole('heading', { level: 1, name: 'Paseo por la calle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('+300 XP')).toBeInTheDocument();
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
          ? { ...item, content: { kind: 'main', activityId: 'kettlebell_block' } }
          : item,
      ),
    });
    clock.travelTo(at('09:20'));
    ui(ROUTES.gap);
    expect(screen.getByRole('link', { name: /10\+ minutos/ })).toHaveTextContent(
      'Un reset más largo',
    );
  });

  it('offers another idea', async () => {
    setUp('09:20');
    const { user } = ui(gapPath('m1'));
    const name = () => screen.getByRole('heading', { level: 1 }).textContent;
    const first = name();
    const seen = new Set([first]);
    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByRole('button', { name: 'Otra propuesta' }));
      seen.add(name());
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
