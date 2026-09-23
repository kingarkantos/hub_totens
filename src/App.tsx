import React, { useState, useEffect } from 'react';
import { AdminHubView } from './views/AdminHubView';
import { TotemCampaignView } from './views/TotemCampaignView';
import { ResellerPortfolioView } from './views/ResellerPortfolioView';

export function App() {
  // Extract path and search params from current window location
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(window.location.pathname);
    setCurrentSearch(window.location.search);
  };

  const searchParams = new URLSearchParams(currentSearch);
  const portfolioQuery = searchParams.get('portfolio') || searchParams.get('reseller');

  // Clean slug from pathname (e.g. "/campanha-honda" -> "campanha-honda")
  const slug = currentPath.replace(/^\//, '').trim();

  // If path is portfolio route: /portfolio/slug or /revendedor/slug
  if (slug.startsWith('portfolio/') || slug.startsWith('revendedor/')) {
    const portfolioSlug = slug.replace(/^(portfolio|revendedor)\//, '').trim();
    return <ResellerPortfolioView slug={portfolioSlug} onNavigate={navigate} />;
  }

  // If query parameter ?portfolio=slug or ?reseller=slug
  if (portfolioQuery) {
    return <ResellerPortfolioView slug={portfolioQuery} onNavigate={navigate} />;
  }

  // If path is root or "/admin", show Admin Hub
  if (!slug || slug === 'admin') {
    return (
      <AdminHubView
        onNavigateToCampaign={(campSlug) => navigate(`/${campSlug}`)}
        onNavigateToPortfolio={(portSlug) => navigate(`/portfolio/${portSlug}`)}
      />
    );
  }

  // Otherwise, it's a Totem Campaign Route (e.g. /campanha-honda or /campanha-X)
  return <TotemCampaignView slug={slug} />;
}

export default App;
