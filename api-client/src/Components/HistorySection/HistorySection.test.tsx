import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import HistorySection from './HistorySection';
import { getHistory } from '@/services/historyUtils';
import { setChosenHistoryVariables } from '@/slices/chosenHistoryVariablesSlice';
import { ReactElement } from 'react';
import { Action } from 'redux';

type MockAction = Action<string>;
const mockReducer = (
  state = { chosenHistoryVariables: { variables: [] } },
  action: MockAction
) => {
  switch (action.type) {
    case 'setChosenHistoryVariables':
      return {
        ...state,
        chosenHistoryVariables: { variables: [] },
      };
    case 'clearChosenHistoryVariables':
      return {
        ...state,
        chosenHistoryVariables: { variables: [] },
      };
    default:
      return state;
  }
};

const store = createStore(mockReducer);

// Создаем моки
const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh,
  }),
}));

vi.mock('@/services/historyUtils', () => ({
  getHistory: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const renderWithProvider = (component: ReactElement) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe('HistorySection', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    mockRouterRefresh.mockClear();
    (getHistory as ReturnType<typeof vi.fn>).mockClear();
    store.dispatch = vi.fn(); // Мокаем dispatch
  });

  it('renders empty state when no requests are in history', () => {
    (getHistory as ReturnType<typeof vi.fn>).mockReturnValue({});

    renderWithProvider(<HistorySection />);

    expect(screen.getByTestId('history-title')).toBeInTheDocument();
    expect(screen.getByTestId('no-requests-msg')).toBeInTheDocument();
    expect(screen.getByTestId('rest-link')).toBeInTheDocument();
    expect(screen.getByTestId('graphiql-link')).toBeInTheDocument();
  });

  it('renders history list when requests are in history', () => {
    (getHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      '/test-url': {
        method: 'get',
        fullUrl: 'http://example.com/api/test',
        headers: { 'Content-Type': 'application/json' },
        body: null,
        savedUrl: '/test-url',
      },
    });

    renderWithProvider(<HistorySection />);

    expect(screen.getByTestId('history-list')).toBeInTheDocument();
    expect(screen.getByTestId('history-item')).toBeInTheDocument();
  });

  it('dispatches setChosenHistoryVariables and navigates to the saved URL when a history item with variables is clicked', () => {
    (getHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      '/test-url': {
        method: 'get',
        fullUrl: 'http://example.com/api/test',
        headers: { 'Content-Type': 'application/json' },
        body: null,
        savedUrl: '/test-url',
        variables: [],
      },
    });

    renderWithProvider(<HistorySection />);

    const requestButton = screen.getByTestId('history-item');
    fireEvent.click(requestButton);

    expect(store.dispatch).toHaveBeenCalledWith(setChosenHistoryVariables([]));
    expect(mockRouterPush).toHaveBeenCalledWith('/test-url');
  });
});
