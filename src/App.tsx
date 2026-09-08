import React, { useState, useEffect } from 'react';
import { AdminHubView } from './views/AdminHubView';
import { TotemCampaignView } from './views/TotemCampaignView';

export function App() {
  // Extract path from current window location
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Clean slug from pathname (e.g. "/campanha-honda" -> "campanha-honda")
  const slug = currentPath.replace(/^\//, '').trim();

  // If path is root or "/admin", show Admin Hub
  if (!slug || slug === 'admin') {
    return (
      <AdminHubView
        onNavigateToCampaign={(campSlug) => navigate(`/${campSlug}`)}
      />
    );
  }

  // Otherwise, it's a Totem Campaign Route (e.g. /campanha-honda or /campanha-X)
  return <TotemCampaignView slug={slug} />;
}

export default App;
