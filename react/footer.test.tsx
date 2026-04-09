import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../Frontend/konyvkocka/src/components/layout/Footer';

describe('Footer', () => {
  it('megjeleniti a gyors linkeket', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Kezdőlap' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Keresés' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Támogatás' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Rólunk' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ÁSZF' })).toBeInTheDocument();
  });

  it('aktivnak jeloli az aktualis utvonalhoz tartozo linket', () => {
    render(
      <MemoryRouter initialEntries={['/kereses']}>
        <Footer />
      </MemoryRouter>,
    );

    const activeSearchLink = screen.getByRole('link', { name: 'Keresés' });
    expect(activeSearchLink).toHaveClass('active');
  });
});
