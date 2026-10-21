import { themes } from '@/config/theme';
import { Style } from '@capacitor/status-bar';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

const platform = vi.hoisted(() => ({ native: false, android: false }));
vi.mock('@/utils/platform', () => ({
  isNative: () => platform.native,
  isAndroid: () => platform.android,
}));
const statusBar = vi.hoisted(() => ({
  setStyle: vi.fn().mockResolvedValue(undefined),
  setBackgroundColor: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@capacitor/status-bar', () => ({
  StatusBar: statusBar,
  Style: { Light: 'LIGHT', Dark: 'DARK' },
}));
vi.mock('@stores/childStore', () => ({ useChildStore: () => undefined }));

function Switch() {
  const { toggleColorMode } = useTheme();
  return <button onClick={toggleColorMode}>Switch theme</button>;
}
function setup() {
  render(
    <ThemeProvider>
      <Switch />
    </ThemeProvider>,
  );
}

describe('native theme contrast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    platform.native = false;
    platform.android = false;
  });

  it('does not invoke native status bar APIs in a browser', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Switch theme' }));
    expect(statusBar.setStyle).not.toHaveBeenCalled();
    expect(statusBar.setBackgroundColor).not.toHaveBeenCalled();
  });

  it('changes iOS status text contrast with the theme without calling the Android-only API', () => {
    platform.native = true;
    setup();
    expect(statusBar.setStyle).toHaveBeenLastCalledWith({ style: Style.Light });
    fireEvent.click(screen.getByRole('button', { name: 'Switch theme' }));
    expect(statusBar.setStyle).toHaveBeenLastCalledWith({ style: Style.Dark });
    expect(statusBar.setBackgroundColor).not.toHaveBeenCalled();
  });

  it('keeps the Android status bar background aligned with the app surface', () => {
    platform.native = true;
    platform.android = true;
    setup();
    expect(statusBar.setBackgroundColor).toHaveBeenLastCalledWith({
      color: themes.cubs.light.colors.background,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Switch theme' }));
    expect(statusBar.setBackgroundColor).toHaveBeenLastCalledWith({
      color: themes.cubs.dark.colors.background,
    });
  });
});
