import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { ScreenStart } from './ScreenStart';

function App() {
  return (
    <MemoryRouter>
      <main>
        <Routes>
          <Route
            index
            element={
              <>
                <h1>Hoy</h1>
                <Link to="/progress">Progreso</Link>
              </>
            }
          />
          <Route path="progress" element={<h1>Progreso</h1>} />
        </Routes>
      </main>
      <Start />
    </MemoryRouter>
  );
}

function Start() {
  return <ScreenStart pathname={useLocation().pathname} />;
}

describe('ScreenStart', () => {
  it('leaves the first screen alone and moves focus to the next screen’s title', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Hoy' })).not.toHaveFocus();

    await userEvent.click(screen.getByRole('link', { name: 'Progreso' }));
    const title = screen.getByRole('heading', { name: 'Progreso' });
    expect(title).toHaveFocus();
    expect(title).toHaveAttribute('tabindex', '-1');
  });
});
