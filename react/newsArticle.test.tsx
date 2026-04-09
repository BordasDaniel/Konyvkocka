import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NewsArticle, { type NewsArticleData } from '../../Frontend/konyvkocka/src/components/features/NewsArticle';

const article: NewsArticleData = {
  id: 1,
  type: 'update',
  title: 'Teszt hír',
  date: '2026-04-09',
  tags: 'Frissítés',
  excerpt: 'Rövid összefoglaló',
  link: '/hirek/1',
  linkText: 'Tovább olvasom',
};

describe('NewsArticle', () => {
  it('Linket renderel, ha nincs onReadMore callback', () => {
    render(
      <MemoryRouter>
        <NewsArticle article={article} />
      </MemoryRouter>,
    );

    const ctaLink = screen.getByRole('link', { name: 'Tovább olvasom' });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/hirek/1');
  });

  it('Gombot renderel es callbacket hiv, ha van onReadMore', async () => {
    const user = userEvent.setup();
    const onReadMore = jest.fn();

    render(<NewsArticle article={article} onReadMore={onReadMore} />);

    const readMoreButton = screen.getByRole('button', { name: 'Tovább olvasom' });
    await user.click(readMoreButton);

    expect(onReadMore).toHaveBeenCalledTimes(1);
    expect(onReadMore).toHaveBeenCalledWith(article);
  });
});
