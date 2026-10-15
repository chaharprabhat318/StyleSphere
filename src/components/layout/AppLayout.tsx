import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ItemUploadModal } from '../wardrobe/ItemUploadModal';
import { wardrobeService } from '../../services/wardrobeService';

export const AppLayout: React.FC = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(12);
  const location = useLocation();

  const fetchCount = async () => {
    const items = await wardrobeService.getItems();
    setTotalCount(items.length);
  };

  useEffect(() => {
    fetchCount();
  }, [location.pathname]);

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/wardrobe':
        return {
          title: 'My Wardrobe',
          subtitle: 'Manage and categorize your personal clothing collection',
        };
      case '/recommendations':
        return {
          title: 'Outfit Generator',
          subtitle: 'Generate harmonized outfit combinations tailored to your occasion, weather, and style',
        };
      case '/try-on':
        return {
          title: 'Virtual Try-On',
          subtitle: 'Live webcam fitting & clothing link simulator inspired by Anywear',
        };
      case '/shopping':
        return {
          title: 'Smart Shopping',
          subtitle: 'AI-curated essentials from top brands to complete your wardrobe and unlock new outfits',
        };
      case '/room-makeover':
        return {
          title: 'Room Makeover',
          subtitle: 'AI interior styling & aesthetic closet space transformer (Coming Soon)',
        };
      case '/dashboard':
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Systematic overview of your wardrobe intelligence, daily look, and style stats',
        };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex">
      {/* Fixed Sidebar */}
      <Sidebar totalItemsCount={totalCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet context={{ refreshItems: fetchCount, openUpload: () => setIsUploadOpen(true) }} />
        </main>
      </div>

      {/* Global Upload Modal */}
      <ItemUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onItemAdded={() => {
          fetchCount();
          // Dispatch custom event for child views to re-fetch
          window.dispatchEvent(new CustomEvent('stylesphere:wardrobe-updated'));
        }}
      />
    </div>
  );
};
