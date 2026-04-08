import { Link } from 'react-router-dom';

export interface NewsArticleData {
  id: number;
  type: 'update' | 'feature' | 'info' | 'event';
  title: string;
  date: string;
  tags: string;
  excerpt: string;
  fullDescription?: string;
  link: string;
  linkText: string;
}

interface NewsArticleProps {
  article: NewsArticleData;
  onReadMore?: (article: NewsArticleData) => void;
}

export default function NewsArticle({ article, onReadMore }: NewsArticleProps) {
  return (
    <article className="news-card" data-type={article.type}>
      <div className="news-content">
        <h2 className="news-title">{article.title}</h2>
        <div className="news-meta">
          <span className="news-date">
            <i className="bi bi-calendar3 me-1"></i>
            {article.date}
          </span>
          <span className="news-tags">
            <i className="bi bi-tag me-1"></i>
            {article.tags}
          </span>
        </div>
        <p className="news-excerpt">{article.excerpt}</p>
        <div className="news-cta">
          {onReadMore ? (
            <button type="button" className="btn-read" onClick={() => onReadMore(article)}>
              {article.linkText}
            </button>
          ) : (
            <Link to={article.link} className="btn-read">
              {article.linkText}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
