import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageTitle from '../../Frontend/konyvkocka/src/components/common/PageTitle';

describe('PageTitle', () => {
  it('beallitja a hirek oldal cimet', async () => {
    render(
      <MemoryRouter initialEntries={['/hirek']}>
        <PageTitle />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe('Hírek | KönyvKocka');
    });
  });

  it('ismeretlen utvonalnal az alapertelmezett cim marad', async () => {
    render(
      <MemoryRouter initialEntries={['/nem-letezo']}>
        <PageTitle />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe('KönyvKocka');
    });
  });
});
