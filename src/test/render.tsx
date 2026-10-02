import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

/** Renders `ui` inside a router at `route` and returns a user-event instance. */
export function renderWithRouter(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return {
    user: userEvent.setup(),
    ...render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>),
  };
}
