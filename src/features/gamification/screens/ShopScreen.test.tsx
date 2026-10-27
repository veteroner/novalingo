import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ShopScreen from './ShopScreen';

const testState = vi.hoisted(() => ({
  items: undefined as
    | Array<{
        id: string;
        name: string;
        category: string;
        price: number;
        currency: string;
        imageUrl: string;
        isPremium: boolean;
      }>
    | undefined,
  child: { id: 'test-child', stars: 400, gems: 250 },
  mutate: vi.fn(),
  toast: vi.fn(),
  category: vi.fn(),
}));
vi.mock('@hooks/queries', () => ({
  useShopItems: (category: string) => {
    testState.category(category);
    return { data: testState.items };
  },
  usePurchaseItem: () => ({ mutate: testState.mutate, isPending: false }),
}));
vi.mock('@stores/childStore', () => ({
  useChildStore: (select: (state: unknown) => unknown) => select({ activeChild: testState.child }),
}));
vi.mock('@stores/uiStore', () => ({
  useUIStore: (select: (state: unknown) => unknown) => select({ showToast: testState.toast }),
}));
vi.mock('@components/templates/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

describe('ShopScreen media and existing purchase behavior', () => {
  beforeEach(() => {
    testState.items = undefined;
    testState.mutate.mockClear();
    testState.category.mockClear();
  });

  it('uses the existing vector avatar artwork for default items', () => {
    const { container } = render(<ShopScreen />);
    expect(screen.getByText('items.avatar_fox')).toBeInTheDocument();
    expect(container.querySelector('svg[viewBox="0 0 100 100"]')).toBeInTheDocument();
    expect(screen.queryByText('🦊')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'screen.buy' })[0]!);
    expect(testState.mutate).toHaveBeenCalledWith(
      { childId: 'test-child', itemId: 'avatar_fox' },
      expect.any(Object),
    );
  });

  it('renders server images, recovers to artwork, and preserves unaffordable gating', () => {
    testState.items = [
      {
        id: 'constructor',
        name: 'Special pack',
        category: 'boosters',
        price: 500,
        currency: 'gems',
        imageUrl: 'https://media.example.test/pack.webp',
        isPremium: true,
      },
    ];
    const { container } = render(<ShopScreen />);
    const image = container.querySelector('img')!;
    expect(image).toHaveAttribute('src', 'https://media.example.test/pack.webp');
    expect(container).not.toHaveTextContent('https://');
    fireEvent.error(image);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('button', { name: 'screen.insufficient' })).toBeDisabled();
    expect(testState.mutate).not.toHaveBeenCalled();
  });

  it('exposes the selected category and changes the requested catalog', () => {
    render(<ShopScreen />);
    const tab = screen.getByRole('button', { name: 'screenCategories.boosters' });
    fireEvent.click(tab);
    expect(tab).toHaveAttribute('aria-pressed', 'true');
    expect(testState.category).toHaveBeenLastCalledWith('boosters');
    expect(screen.getByText('items.boost_hint_pack')).toBeInTheDocument();
  });
});
