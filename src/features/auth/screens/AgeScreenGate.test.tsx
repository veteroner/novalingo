import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgeScreenGate } from './AgeScreenGate';
import { AGE_SCREEN_STORAGE_KEY } from '@services/ageScreen/ageScreenPolicy';

const mounted = vi.fn();
function Application() {
  mounted();
  return <div>application</div>;
}

describe('ilk açılış yaş ekranı', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', window.localStorage);
    localStorage.setItem(AGE_SCREEN_STORAGE_KEY, '{"version":0}');
    mounted.mockClear();
  });
  function renderGate() {
    return render(
      <AgeScreenGate>
        <Application />
      </AgeScreenGate>,
    );
  }
  it('alanlar boştur ve servis ağacı yaş girişinden önce mount edilmez', () => {
    renderGate();
    for (const input of screen.getAllByRole('textbox')) expect(input).toHaveValue('');
    expect(screen.getByRole('button', { name: 'ageScreen.continue' })).toBeDisabled();
    expect(mounted).not.toHaveBeenCalled();
  });
  it('geçersiz takvim tarihini kabul etmez', async () => {
    renderGate();
    await userEvent.type(screen.getByLabelText('ageScreen.day'), '31');
    await userEvent.type(screen.getByLabelText('ageScreen.month'), '2');
    await userEvent.type(screen.getByLabelText('ageScreen.year'), '2018');
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('alert')).toHaveTextContent('ageScreen.invalid');
    expect(mounted).not.toHaveBeenCalled();
  });
  it('çocuk tarihi tamamlanınca uygulamayı açar ve yalnızca erişim sınıfını saklar', async () => {
    renderGate();
    await userEvent.type(screen.getByLabelText('ageScreen.day'), '1');
    await userEvent.type(screen.getByLabelText('ageScreen.month'), '1');
    await userEvent.type(screen.getByLabelText('ageScreen.year'), '2018');
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('application')).toBeInTheDocument();
    expect(localStorage.getItem(AGE_SCREEN_STORAGE_KEY)).toBe('{"version":1,"band":"minor"}');
  });
  it('yeni açılışta doğrulanmış sınıfı korur', () => {
    localStorage.setItem(AGE_SCREEN_STORAGE_KEY, '{"version":1,"band":"minor"}');
    renderGate();
    expect(screen.getByText('application')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
