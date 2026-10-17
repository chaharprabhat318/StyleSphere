import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Link2,
  Sparkles,
  ShieldCheck,
  Eye,
  RefreshCw,
  Sliders,
  Store,
  Upload,
  Shirt,
  Check,
  ExternalLink,
} from 'lucide-react';
import type { WardrobeItem } from '../types/wardrobe';
import { wardrobeService } from '../services/wardrobeService';

interface GarmentTarget {
  id: string;
  name: string;
  store: string;
  category: string;
  gender?: 'men' | 'women' | 'unisex';
  price: string;
  imageUrl: string;
  linkUrl: string;
}

export const TryOnPage: React.FC = () => {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [sourceType, setSourceType] = useState<'wardrobe' | 'suggested' | 'link'>('wardrobe');
  const [tryOnGender, setTryOnGender] = useState<'all' | 'men' | 'women'>('all');
  const [wardrobeCategory, setWardrobeCategory] = useState<string>('all');
  const [inputUrl, setInputUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Demo clothing presets inspired by contemporary 2025/2026 streetwear & clean fits
  const demoGarments: GarmentTarget[] = [
    {
      id: 'demo-1',
      name: '300GSM Heavyweight Washed Cropped Boxy Tee',
      store: 'Represent',
      category: 'Tops',
      gender: 'unisex',
      price: '$55.00',
      imageUrl:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.representclo.com/products/cropped-boxy-tee',
    },
    {
      id: 'demo-2',
      name: 'Ultra-Wide Baggy Puddle Hem Denim',
      store: 'Our Legacy',
      category: 'Bottoms',
      gender: 'unisex',
      price: '$110.00',
      imageUrl:
        'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.ourlegacy.com/third-cut-denim',
    },
    {
      id: 'demo-3',
      name: 'Cropped Washed Canvas Worker Jacket',
      store: 'Stüssy',
      category: 'Outerwear',
      gender: 'men',
      price: '$145.00',
      imageUrl:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.stussy.com/products/canvas-worker-jacket',
    },
    {
      id: 'demo-4',
      name: '90s Ribbed Slim-Fit Baby Tee',
      store: 'Courrèges',
      category: 'Tops',
      gender: 'women',
      price: '$45.00',
      imageUrl:
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.courreges.com/products/ribbed-baby-tee',
    },
    {
      id: 'demo-5',
      name: 'Double-Pleated Wide-Leg Fluid Trousers',
      store: 'Studio Nicholson',
      category: 'Bottoms',
      gender: 'men',
      price: '$120.00',
      imageUrl:
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.studionicholson.com/products/wide-leg-trousers',
    },
    {
      id: 'demo-6',
      name: 'High-Waist Fluid Tailored Wide Slacks',
      store: 'The Row',
      category: 'Bottoms',
      gender: 'women',
      price: '$95.00',
      imageUrl:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.therow.com/products/fluid-wide-slacks',
    },
  ];

  const [activeGarment, setActiveGarment] = useState<GarmentTarget>(demoGarments[0]);

  // Model & Webcam State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'webcam' | 'studio'>('webcam');

  // Studio fallback photo
  const studioModels = [
    {
      name: 'Studio Woman (A)',
      gender: 'women',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    },
    {
      name: 'Studio Man (B)',
      gender: 'men',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
    },
    {
      name: 'Studio Woman (C)',
      gender: 'women',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85',
    },
    {
      name: 'Studio Man (D)',
      gender: 'men',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=85',
    },
  ];
  const [activeStudioModel, setActiveStudioModel] = useState(studioModels[0].url);

  // Fitting simulation parameters
  const [isFitting, setIsFitting] = useState(false);
  const [drapeOpacity, setDrapeOpacity] = useState(90);
  const [drapeScale, setDrapeScale] = useState(100);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [showMeshGuidelines, setShowMeshGuidelines] = useState(true);
  const [fittedSuccess, setFittedSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load Wardrobe items
  useEffect(() => {
    const load = async () => {
      const items = await wardrobeService.getItems();
      setWardrobeItems(items);
      if (items.length > 0) {
        setActiveGarment({
          id: items[0].id,
          name: items[0].name,
          store: items[0].brand || 'My Wardrobe',
          category: items[0].category,
          gender: items[0].gender,
          price: 'In Your Closet',
          imageUrl: items[0].imageUrl,
          linkUrl: '',
        });
      }
    };
    load();
  }, []);

  // Callback ref guarantees video node attaches stream immediately upon DOM mounting
  const setVideoElement = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      if (node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
      }
      node.play().catch((err) => {
        console.warn('Video play error:', err);
      });
    }
  }, []);

  // Handle Webcam Start / Stop with 3-tier fallback & HTTPS context detection
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsStartingCamera(true);

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';

    if (!window.isSecureContext && !isLocalhost) {
      setCameraError(
        'Camera access requires a secure HTTPS connection. Please ensure your website is accessed over https:// (e.g. on Vercel/Netlify).'
      );
      setCameraActive(false);
      setIsStartingCamera(false);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        'Webcam is not supported or blocked by browser security. Please open using Chrome, Edge, or Safari.'
      );
      setCameraActive(false);
      setIsStartingCamera(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Tier 1: Front camera with ideal HD
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        try {
          // Tier 2: Front camera without strict resolution
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          });
        } catch {
          // Tier 3: Any available video device (best mobile fallback)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video autoplay warning:', e);
        }
      }
      setCameraActive(true);
      setCameraError(null);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Camera access error:', error);
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera access was denied. Please allow camera permissions in your browser address bar and click "Allow / Retry Camera".'
        );
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can switch to Studio Portrait mode.');
      } else if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
        setCameraError(
          'Camera is in use by another app (e.g. Zoom or another browser tab). Please close it and retry.'
        );
      } else {
        setCameraError(error?.message || 'Unable to access camera on this device.');
      }
      setCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (cameraMode === 'webcam') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [cameraMode, startCamera, stopCamera]);

  // Handle URL Extraction (Anywear link parser simulation)
  const handleExtractFromUrl = (targetUrl?: string) => {
    const urlToParse = targetUrl || inputUrl;
    if (!urlToParse) return;

    setIsExtracting(true);
    setFittedSuccess(false);

    setTimeout(() => {
      let storeName = 'Partner Store';
      const lower = urlToParse.toLowerCase();
      if (lower.includes('zara')) storeName = 'Zara';
      else if (lower.includes('myntra')) storeName = 'Myntra';
      else if (lower.includes('uniqlo')) storeName = 'Uniqlo';
      else if (lower.includes('hm') || lower.includes('h&m')) storeName = 'H&M';
      else if (lower.includes('amazon')) storeName = 'Amazon Fashion';

      const matchedPreset =
        demoGarments.find((d) => d.store.toLowerCase() === storeName.toLowerCase()) || demoGarments[0];

      setActiveGarment({
        id: `extracted-${Date.now()}`,
        name: matchedPreset.name,
        store: storeName,
        category: matchedPreset.category,
        price: matchedPreset.price,
        imageUrl: matchedPreset.imageUrl,
        linkUrl: urlToParse,
      });

      setIsExtracting(false);
      triggerDrapeScan();
    }, 1200);
  };

  const triggerDrapeScan = () => {
    setIsFitting(true);
    setTimeout(() => {
      setIsFitting(false);
      setFittedSuccess(true);
    }, 1800);
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveStudioModel(reader.result as string);
        setCameraMode('studio');
        triggerDrapeScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveGarment({
          id: `custom-${Date.now()}`,
          name: 'Custom Uploaded Garment',
          store: 'User Upload',
          category: 'Tops',
          price: '$0.00',
          imageUrl: reader.result as string,
          linkUrl: '',
        });
        triggerDrapeScan();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0e244d] px-2.5 py-1 rounded-full border border-[#1e3a8a]">
              Anywear AI Engine
            </span>
            <span className="text-[10px] font-bold text-[#132d5e] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#132d5e]" />
              Live Camera Drape Simulation
            </span>
          </div>
          <h1 className="font-editorial text-3xl md:text-4xl text-slate-900 font-bold mt-2">
            Virtual Try-On
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl font-sans-clean leading-relaxed">
            Inspired by Anywear Live Try-On. Paste any product link from Zara, Myntra, Uniqlo, or H&M, turn on your webcam, and let our computer vision mesh align the garment directly onto your silhouette in real-time.
          </p>
        </div>

        {/* Studio Pipeline Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#060a14] border border-slate-800 text-xs text-slate-300 font-sans-clean shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Pose & Warp Stream Active</span>
        </div>
      </div>

      {/* Interactive Garment Selection Hub */}
      <div className="p-6 rounded-3xl bg-[#060a14] border border-slate-800 text-white shadow-xl space-y-5">
        {/* Source Mode Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <h2 className="text-xs font-bold tracking-wide uppercase text-slate-200">
              Select Garment To Try On
            </h2>
          </div>

          {/* 3 Main Mode Selectors */}
          <div className="inline-flex p-1 bg-[#0b1329] rounded-2xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setSourceType('wardrobe')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                sourceType === 'wardrobe'
                  ? 'bg-[#0e244d] text-white border border-[#1e3a8a] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5 text-blue-300" />
              <span>From Your Wardrobe</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-900/40 text-blue-300 font-semibold">
                {wardrobeItems.length}
              </span>
            </button>

            <button
              onClick={() => setSourceType('suggested')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                sourceType === 'suggested'
                  ? 'bg-[#0e244d] text-white border border-[#1e3a8a] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-blue-300" />
              <span>Suggested Clothes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-900/40 text-blue-300 font-semibold">
                {demoGarments.length}
              </span>
            </button>

            <button
              onClick={() => setSourceType('link')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                sourceType === 'link'
                  ? 'bg-[#0e244d] text-white border border-[#1e3a8a] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Link / Upload</span>
            </button>
          </div>
        </div>

        {/* ─── Mode 1: From Your Wardrobe ───────────────────────── */}
        {sourceType === 'wardrobe' && (
          <div className="space-y-4">
            {/* Filter Bar: Piece Type & Category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {/* Piece Type Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Pieces' },
                  { id: 'tops', label: 'Tops' },
                  { id: 'bottoms', label: 'Bottoms' },
                  { id: 'outerwear', label: 'Outerwear' },
                  { id: 'footwear', label: 'Footwear' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setWardrobeCategory(c.id)}
                    className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                      wardrobeCategory === c.id
                        ? 'bg-[#132d5e] text-white border border-[#1e3a8a]'
                        : 'bg-[#0b1329] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Category (Gender) Pills */}
              <div className="flex items-center gap-1.5 bg-[#0b1329] p-1 rounded-xl border border-slate-800 text-[10px]">
                <span className="text-slate-500 font-bold uppercase px-1.5 hidden sm:inline">
                  Category:
                </span>
                {(['all', 'men', 'women'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setTryOnGender(g)}
                    className={`px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      tryOnGender === g
                        ? 'bg-[#0e244d] text-white border border-[#1e3a8a]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {g === 'all' ? 'All' : g === 'men' ? 'Men' : 'Women'}
                  </button>
                ))}
              </div>
            </div>

            {/* Wardrobe Items Grid */}
            {wardrobeItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-1 scrollbar-thin">
                {wardrobeItems
                  .filter((item) => {
                    const catMatch = wardrobeCategory === 'all' || item.category === wardrobeCategory;
                    const genderMatch =
                      tryOnGender === 'all' || item.gender === tryOnGender || item.gender === 'unisex';
                    return catMatch && genderMatch;
                  })
                  .map((item) => {
                    const isSelected = activeGarment.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveGarment({
                            id: item.id,
                            name: item.name,
                            store: item.brand || 'My Wardrobe',
                            category: item.category,
                            gender: item.gender,
                            price: 'In Your Closet',
                            imageUrl: item.imageUrl,
                            linkUrl: '',
                          });
                          triggerDrapeScan();
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all group relative cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#132d5e] border-[#3b82f6] shadow-md ring-1 ring-blue-400/80'
                            : 'bg-[#0b1329] border-slate-800 hover:border-slate-700 hover:bg-[#0e1a38]'
                        }`}
                      >
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 relative mb-2">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-slate-300">
                            {item.category}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-xs flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>Fitted</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[9px] uppercase font-bold text-blue-300 block truncate">
                            {item.brand || 'Wardrobe Staple'}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate mt-0.5">
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span className="capitalize">{item.color}</span>
                            {item.gender && (
                              <span className="uppercase text-[9px] px-1 py-0.2 rounded bg-black/60 text-blue-200 font-bold border border-slate-700">
                                {item.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No garments found in your wardrobe matching this filter.
              </div>
            )}
          </div>
        )}

        {/* ─── Mode 2: Suggested Store Clothes ─────────────────── */}
        {sourceType === 'suggested' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Curated retail designs ready for instant 1-click drape:
              </span>
              <div className="flex items-center gap-1.5 bg-[#0b1329] p-1 rounded-xl border border-slate-800 text-[10px]">
                <span className="text-slate-500 font-bold uppercase px-1.5 hidden sm:inline">
                  Category:
                </span>
                {(['all', 'men', 'women'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setTryOnGender(g)}
                    className={`px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      tryOnGender === g
                        ? 'bg-[#0e244d] text-white border border-[#1e3a8a]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {g === 'all' ? 'All' : g === 'men' ? 'Men' : 'Women'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-1 scrollbar-thin">
              {demoGarments
                .filter((g) => tryOnGender === 'all' || g.gender === tryOnGender || g.gender === 'unisex')
                .map((garment) => {
                  const isSelected = activeGarment.id === garment.id;
                  return (
                    <button
                      key={garment.id}
                      onClick={() => {
                        setActiveGarment(garment);
                        triggerDrapeScan();
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all group relative cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#132d5e] border-[#3b82f6] shadow-md ring-1 ring-blue-400/80'
                          : 'bg-[#0b1329] border-slate-800 hover:border-slate-700 hover:bg-[#0e1a38]'
                      }`}
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 relative mb-2">
                        <img
                          src={garment.imageUrl}
                          alt={garment.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-blue-300">
                          {garment.store}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-xs flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Fitted</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white truncate">
                          {garment.name}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] mt-1">
                          <span className="text-emerald-400 font-bold">{garment.price}</span>
                          {garment.gender && (
                            <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-black/60 text-slate-300 font-bold border border-slate-700">
                              {garment.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* ─── Mode 3: Link Extractor & Photo Upload ───────────── */}
        {sourceType === 'link' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-slate-300">
                Paste any product page link from Zara, Myntra, Uniqlo, H&M, or ASOS:
              </span>
              <span className="text-[11px] text-slate-400">
                Anywear Neural Web Crawler Active
              </span>
            </div>

            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste cloth web URL (e.g. https://www.zara.com/us/en/textured-overshirt-p012...)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#0b1329] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <button
                onClick={() => handleExtractFromUrl()}
                disabled={isExtracting}
                className="px-6 py-3 rounded-2xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean flex items-center justify-center gap-2 transition-colors border border-[#1e3a8a] shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-300" />
                    <span>Extracting Garment...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-blue-300" />
                    <span>Fetch & Try On</span>
                  </>
                )}
              </button>
            </div>

            {/* Or Upload Garment Photo */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Or upload your own clothing photo:</span>
                <span className="text-[11px] text-slate-400">Supported formats: PNG, JPG, WEBP</span>
              </div>
              <label className="px-4 py-2 rounded-xl bg-[#0b1329] hover:bg-[#132d5e] border border-slate-700 text-xs font-bold text-white cursor-pointer transition-colors inline-flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-blue-300" />
                <span>Upload Garment File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomGarmentUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Canvas (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#060a14] border border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[580px] text-white">
          {/* Ambient Blue Radial Glow */}
          <div className="absolute inset-0 bg-radial from-blue-500/[0.08] via-transparent to-transparent pointer-events-none" />

          {/* Top Canvas Controls Bar */}
          <div className="w-full flex items-center justify-between z-20 pb-4 border-b border-slate-800/80 mb-4">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0b1329] border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setCameraMode('webcam')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  cameraMode === 'webcam'
                    ? 'bg-[#0e244d] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live Webcam (Anywear)</span>
              </button>

              <button
                onClick={() => setCameraMode('studio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  cameraMode === 'studio'
                    ? 'bg-[#0e244d] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Studio Portrait</span>
              </button>
            </div>

            {/* Studio Model Switcher if in studio mode */}
            {cameraMode === 'studio' && (
              <div className="flex items-center gap-1 bg-[#0b1329] p-1 rounded-2xl border border-slate-800 overflow-x-auto">
                {studioModels.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setActiveStudioModel(m.url)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeStudioModel === m.url
                        ? 'bg-[#0e244d] text-white border border-[#1e3a8a]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}

            {/* Overlay Mesh Guide Toggle */}
            <button
              onClick={() => setShowMeshGuidelines(!showMeshGuidelines)}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border ${
                showMeshGuidelines
                  ? 'bg-blue-900/30 text-blue-200 border-blue-700/50'
                  : 'bg-[#0b1329] text-slate-400 border-slate-800'
              }`}
              title="Toggle AI Pose Alignment Grid"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pose Mesh</span>
            </button>
          </div>

          {/* Canvas Main Stage */}
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* 1. Live Video Stream for Webcam Mode */}
            {cameraMode === 'webcam' ? (
              <>
                <video
                  ref={setVideoElement}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                />
                {!cameraActive && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#0a1124]">
                    {isStartingCamera ? (
                      <>
                        <div className="w-12 h-12 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white tracking-wide">
                            Accessing Camera...
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Please allow camera permissions if prompted by your browser.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                          <CameraOff className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="space-y-1 max-w-xs">
                          <h4 className="text-xs font-bold text-white">Live Camera Inactive</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {cameraError || 'Camera permissions are required for live virtual try-on.'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 w-full max-w-[210px] pt-1">
                          <button
                            onClick={startCamera}
                            className="w-full py-2.5 rounded-xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#1e3a8a]"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Allow / Retry Camera</span>
                          </button>
                          <button
                            onClick={() => setCameraMode('studio')}
                            className="w-full py-2 rounded-xl bg-[#0b1329] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all border border-slate-800 cursor-pointer"
                          >
                            Use Studio Portrait Instead
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* 2. Studio Model / Uploaded Image */
              <img
                src={activeStudioModel}
                alt="Silhouette Portrait"
                className="w-full h-full object-cover"
              />
            )}

            {/* 3. AI Pose Alignment Guide Overlay (Anywear signature feature) */}
            {showMeshGuidelines && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                {/* Shoulder and Torso Target Bounds */}
                <div className="w-48 h-20 border border-dashed border-blue-400/40 rounded-full mt-10 flex items-center justify-center">
                  <span className="text-[9px] uppercase tracking-widest text-blue-300/80 font-bold bg-black/60 px-2 py-0.5 rounded-full">
                    Shoulder Alignment
                  </span>
                </div>

                <div className="w-56 h-48 border border-dashed border-blue-400/30 rounded-2xl flex items-center justify-center">
                  <span className="text-[9px] uppercase tracking-widest text-blue-300/70 font-bold bg-black/60 px-2 py-0.5 rounded-full">
                    Torso Drape Zone
                  </span>
                </div>

                <div className="text-[10px] text-blue-200/80 bg-black/80 px-3 py-1 rounded-full border border-blue-800/60 font-mono">
                  Pose Tracking: Active (30 FPS)
                </div>
              </div>
            )}

            {/* 4. Real-time Garment Overlay / Fitted State */}
            {fittedSuccess && (
              <div
                style={{
                  opacity: drapeOpacity / 100,
                  transform: `translateY(${verticalOffset}px) scale(${drapeScale / 100})`,
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
              >
                <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl mix-blend-multiply opacity-95">
                  <img
                    src={activeGarment.imageUrl}
                    alt={activeGarment.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>
            )}

            {/* 5. Neural Fitting Scanning Animation */}
            {isFitting && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-4 z-30">
                <div className="w-14 h-14 rounded-full border-2 border-blue-400 border-t-transparent animate-spin flex items-center justify-center text-blue-300">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-white tracking-wide">
                    Anywear Neural Warp Engine
                  </p>
                  <p className="text-[11px] text-blue-300 font-mono">
                    Mapping fabric contour onto your silhouette...
                  </p>
                </div>
              </div>
            )}

            {/* Status Pill in Corner */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1.5 z-20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{fittedSuccess ? 'Garment Fitted' : 'Ready to Try On'}</span>
            </div>
          </div>

          {/* Interactive Simulation Trigger Button */}
          <div className="w-full max-w-sm mt-5 space-y-3 z-20">
            <button
              onClick={triggerDrapeScan}
              disabled={isFitting}
              className="w-full py-3.5 rounded-2xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean flex items-center justify-center gap-2 transition-all border border-[#1e3a8a] shadow-lg disabled:opacity-50 active:scale-98"
            >
              <RefreshCw className={`w-4 h-4 ${isFitting ? 'animate-spin' : ''}`} />
              <span>{fittedSuccess ? 'Re-align Fabric Drape' : 'Drape Garment on Body'}</span>
            </button>

            {/* Fine-Tuning Controls */}
            {fittedSuccess && (
              <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Fabric Blend Opacity</span>
                  <span className="font-mono text-white">{drapeOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={drapeOpacity}
                  onChange={(e) => setDrapeOpacity(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                  <span>Silhouette Scale</span>
                  <span className="font-mono text-white">{drapeScale}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="120"
                  value={drapeScale}
                  onChange={(e) => setDrapeScale(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                  <span>Vertical Position</span>
                  <span className="font-mono text-white">{verticalOffset}px</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={verticalOffset}
                  onChange={(e) => setVerticalOffset(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Garment Selector & Stylist Fit Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Garment Spotlight Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#132d5e]">
                Active Garment Selected
              </span>
              <span className="text-[10px] font-bold text-white bg-[#0e244d] px-2.5 py-0.5 rounded-full">
                {activeGarment.store}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                <img
                  src={activeGarment.imageUrl}
                  alt={activeGarment.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-editorial text-lg text-slate-900 font-bold leading-snug">
                  {activeGarment.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{activeGarment.category}</p>
                <p className="text-sm font-bold text-[#0e244d] mt-2">{activeGarment.price}</p>
              </div>
            </div>

            {/* Stylist Fit Diagnostics */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fit Compatibility:</span>
                <span className="font-bold text-emerald-700">96% Drape Harmony</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Size Prediction:</span>
                <span className="font-bold text-slate-800">True to Size (Medium)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/80">
                Shoulder lines align precisely with your natural frame. Clean hem proportion drops 2 inches below your beltline.
              </p>
            </div>
          </div>

          {/* Fit Adjustment & Drape Fine-Tuning */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0e244d]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Drape & Fabric Alignment
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {fittedSuccess ? 'Drape Active' : 'Ready'}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span>Fabric Blend Opacity</span>
                  <span className="font-mono font-bold text-slate-800">{drapeOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={drapeOpacity}
                  onChange={(e) => setDrapeOpacity(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span>Silhouette Fit Scale</span>
                  <span className="font-mono font-bold text-slate-800">{drapeScale}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="120"
                  value={drapeScale}
                  onChange={(e) => setDrapeScale(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span>Vertical Hem Alignment</span>
                  <span className="font-mono font-bold text-slate-800">{verticalOffset}px</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={verticalOffset}
                  onChange={(e) => setVerticalOffset(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={triggerDrapeScan}
                  disabled={isFitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFitting ? 'animate-spin' : ''}`} />
                  <span>{fittedSuccess ? 'Re-align Drape' : 'Drape On Model'}</span>
                </button>

                {activeGarment.linkUrl && (
                  <a
                    href={activeGarment.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center"
                    title="Open Product Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Upload Portrait Option for Studio Mode */}
          {cameraMode === 'studio' && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <h5 className="font-bold text-slate-800">Want to use your own photo?</h5>
                <p className="text-[11px] text-slate-500">Upload a full-length portrait to test fit.</p>
              </div>
              <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors">
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomPhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
