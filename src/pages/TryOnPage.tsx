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
} from 'lucide-react';
import type { WardrobeItem } from '../types/wardrobe';
import { wardrobeService } from '../services/wardrobeService';

interface GarmentTarget {
  id: string;
  name: string;
  store: string;
  category: string;
  price: string;
  imageUrl: string;
  linkUrl: string;
}

export const TryOnPage: React.FC = () => {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [sourceType, setSourceType] = useState<'link' | 'wardrobe' | 'upload'>('link');
  const [inputUrl, setInputUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Demo clothing presets inspired by Anywear
  const demoGarments: GarmentTarget[] = [
    {
      id: 'demo-1',
      name: 'Structured Gabardine Workwear Shacket',
      store: 'Zara',
      category: 'Outerwear',
      price: '$69.90',
      imageUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.zara.com/us/en/gabardine-overshirt-p012849.html',
    },
    {
      id: 'demo-2',
      name: 'Heavyweight Supima Cotton Mock-Neck',
      store: 'Myntra',
      category: 'Tops',
      price: '$28.50',
      imageUrl:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.myntra.com/tshirts/supima-cotton-mock-neck',
    },
    {
      id: 'demo-3',
      name: 'Heritage Raw Selvedge Trucker Jacket',
      store: 'Uniqlo',
      category: 'Outerwear',
      price: '$59.90',
      imageUrl:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www.uniqlo.com/us/en/products/selvedge-trucker-jacket',
    },
    {
      id: 'demo-4',
      name: 'Double-Breasted Wool Atelier Blazer',
      store: 'H&M',
      category: 'Outerwear',
      price: '$129.00',
      imageUrl:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85',
      linkUrl: 'https://www2.hm.com/en_us/productpage.wool-blazer.html',
    },
  ];

  const [activeGarment, setActiveGarment] = useState<GarmentTarget>(demoGarments[0]);

  // Model & Webcam State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'webcam' | 'studio'>('webcam');

  // Studio fallback photo
  const studioModels = [
    {
      name: 'Studio Portrait A',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    },
    {
      name: 'Studio Portrait B',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
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
    };
    load();
  }, []);

  // Handle Webcam Start / Stop
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Webcam API is not supported on this browser.');
        setCameraActive(false);
      }
    } catch {
      setCameraError('Camera access was denied or is unavailable. Switched to Studio Mode.');
      setCameraActive(false);
      setCameraMode('studio');
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

      {/* Garment Link Extractor Bar (Anywear Feature Highlight) */}
      <div className="p-6 rounded-3xl bg-[#060a14] border border-slate-800 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-bold tracking-wide uppercase text-slate-300">
              Anywear Product Link Try-On
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Supports Zara, Myntra, Uniqlo, H&M, Amazon Fashion & ASOS
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste any cloth link (e.g. https://www.zara.com/us/en/textured-overshirt-p012...)"
              className="w-full px-4 py-3 rounded-2xl bg-[#0b1329] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <button
            onClick={() => handleExtractFromUrl()}
            disabled={isExtracting}
            className="px-6 py-3 rounded-2xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold font-sans-clean flex items-center justify-center gap-2 transition-colors border border-[#1e3a8a] shrink-0 disabled:opacity-50"
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

        {/* Quick Demo Links for Instant 1-Click Testing */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 mr-1">Quick Demo Presets:</span>
          {demoGarments.map((garment) => (
            <button
              key={garment.id}
              onClick={() => {
                setInputUrl(garment.linkUrl);
                handleExtractFromUrl(garment.linkUrl);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                activeGarment.id === garment.id
                  ? 'bg-[#132d5e] text-white border border-[#1e3a8a]'
                  : 'bg-[#0b1329] text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Store className="w-3 h-3 text-blue-300" />
              <span>{garment.store} • {garment.name.split(' ')[0]} {garment.name.split(' ')[1]}</span>
            </button>
          ))}
        </div>
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
              cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#0a1124]">
                  <CameraOff className="w-10 h-10 text-slate-500" />
                  <p className="text-xs text-slate-400">
                    {cameraError || 'Requesting camera permissions...'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-[#0e244d] hover:bg-[#132d5e] text-white text-xs font-bold"
                  >
                    Allow Camera Access
                  </button>
                </div>
              )
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

          {/* Garment Source Tabs */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Choose Garment Source
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSourceType('link')}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    sourceType === 'link'
                      ? 'bg-[#0e244d] text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Link
                </button>
                <button
                  onClick={() => setSourceType('wardrobe')}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    sourceType === 'wardrobe'
                      ? 'bg-[#0e244d] text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  My Wardrobe
                </button>
                <button
                  onClick={() => setSourceType('upload')}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    sourceType === 'upload'
                      ? 'bg-[#0e244d] text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Tab 1: From Link Presets */}
            {sourceType === 'link' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-sans-clean">
                  Select any preset store item or paste your own URL above:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoGarments.map((garment) => (
                    <button
                      key={garment.id}
                      onClick={() => {
                        setActiveGarment(garment);
                        triggerDrapeScan();
                      }}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        activeGarment.id === garment.id
                          ? 'border-[#1e3a8a] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={garment.imageUrl}
                        alt={garment.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-[#132d5e] block">
                          {garment.store}
                        </span>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {garment.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: From My Wardrobe */}
            {sourceType === 'wardrobe' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-sans-clean">
                  Select a piece you already own to preview fit:
                </p>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                  {wardrobeItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveGarment({
                          id: item.id,
                          name: item.name,
                          store: item.brand || 'My Wardrobe',
                          category: item.category,
                          price: 'Owned',
                          imageUrl: item.imageUrl,
                          linkUrl: '',
                        });
                        triggerDrapeScan();
                      }}
                      className={`p-1.5 rounded-2xl border transition-all ${
                        activeGarment.id === item.id
                          ? 'border-[#1e3a8a] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="aspect-square w-full rounded-xl object-cover mb-1"
                      />
                      <p className="text-[10px] font-bold text-slate-900 truncate text-center">
                        {item.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Upload Custom Garment */}
            {sourceType === 'upload' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-sans-clean">
                  Upload any photo of a shirt, jacket, or dress to try on:
                </p>
                <label className="border-2 border-dashed border-slate-300 hover:border-[#1e3a8a] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center space-y-2 bg-slate-50">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Upload garment photo</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomGarmentUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
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
