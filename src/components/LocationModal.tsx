import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Crosshair, MapPin, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateDistanceKm,
  findNearestKarachiArea,
  KARACHI_AREAS,
  RESTAURANT_LOCATION,
} from '../data/karachiAreas';
import { LOGO_IMAGE } from '../data/menuData';
import type { OrderType } from '../types';

export const LocationModal: React.FC = () => {
  const {
    hasConfirmedLocation,
    showLocationModal,
    setShowLocationModal,
    locationState,
    confirmLocation,
  } = useApp();

  const isOpen = showLocationModal || !hasConfirmedLocation;

  const [orderType, setOrderType] = useState<OrderType>(locationState.orderType);
  const [selectedAreaId, setSelectedAreaId] = useState<string>(locationState.areaId);
  const [areaSearch, setAreaSearch] = useState('');
  const [streetAddress, setStreetAddress] = useState(locationState.streetAddress);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | null>(null);

  const filteredAreas = useMemo(() => {
    const q = areaSearch.trim().toLowerCase();
    if (!q) return KARACHI_AREAS;
    return KARACHI_AREAS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.zone.toLowerCase().includes(q),
    );
  }, [areaSearch]);

  const selectedArea = useMemo(
    () => KARACHI_AREAS.find((a) => a.id === selectedAreaId) || KARACHI_AREAS[0],
    [selectedAreaId],
  );

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Location detection is not supported in this browser. Please select your Karachi area below.');
      return;
    }

    setGpsLoading(true);
    setGpsStatus('Detecting your current location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestKarachiArea(latitude, longitude);
        setSelectedAreaId(nearest.area.id);
        setCustomCoords({ lat: latitude, lng: longitude });
        setGpsStatus(`Detected nearest area: ${nearest.area.name}`);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setGpsStatus('Could not access GPS permission. Please choose your Karachi area from the list.');
      },
      { enableHighAccuracy: true, timeout: 9000 },
    );
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLat = customCoords ? customCoords.lat : selectedArea.lat;
    const targetLng = customCoords ? customCoords.lng : selectedArea.lng;
    const distanceKm =
      orderType === 'Delivery'
        ? calculateDistanceKm(
            RESTAURANT_LOCATION.lat,
            RESTAURANT_LOCATION.lng,
            targetLat,
            targetLng,
          )
        : 0;

    confirmLocation({
      orderType,
      areaId: selectedArea.id,
      areaName: selectedArea.name,
      lat: targetLat,
      lng: targetLng,
      distanceKm,
      streetAddress: streetAddress.trim(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-[#ead4d0] dark:border-[#391c20] bg-[#fffaf9] dark:bg-[#160a0c] text-[#1f0e10] dark:text-[#fbf3f2] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            <div className="bg-gradient-to-r from-[#8f1218] via-[#b91c1c] to-[#7c1015] px-5 pt-5 pb-6 text-white text-center relative shrink-0">
              {hasConfirmedLocation && (
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="absolute top-3 right-3 p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors"
                  aria-label="Close location modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="mx-auto w-16 h-16 rounded-full p-0.5 bg-white/90 shadow-lg overflow-hidden">
                <img
                  src={LOGO_IMAGE}
                  alt="Shahi Pizza"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h2
                id="location-modal-title"
                className="mt-3 font-display text-xl font-bold tracking-tight"
              >
                Select Your Order Type
              </h2>
              <p className="mt-1 text-xs text-red-100/90">
                Shahi Pizza — Fast Food &amp; Bar B Q · North Karachi
              </p>
            </div>

            <form
              onSubmit={handleConfirm}
              className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1"
            >
              {/* Order Type Segmented Tabs */}
              <div>
                <label className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-2">
                  How would you like to order?
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#f6e5e2] dark:bg-[#241114] border border-[#ebd4d0] dark:border-[#3d1e22]">
                  {(['Delivery', 'Takeaway', 'Dine-In'] as OrderType[]).map(
                    (type) => {
                      const active = orderType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setOrderType(type)}
                          className={`relative min-w-0 overflow-hidden py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-sm font-semibold leading-tight text-center transition-colors cursor-pointer ${
                            active
                              ? 'text-white'
                              : 'text-[#523034] dark:text-red-100/80 hover:text-red-700 dark:hover:text-white'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="location-order-type-pill"
                              transition={{
                                type: 'spring',
                                stiffness: 420,
                                damping: 32,
                              }}
                              className="absolute inset-0 rounded-lg bg-red-700 shadow-sm"
                            />
                          )}
                          <span className="relative z-10 block max-w-full truncate">
                            {type}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {orderType === 'Delivery' ? (
                <>
                  {/* GPS Auto-Detect Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={gpsLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-700/30 dark:border-red-500/40 bg-[#fcebe8] dark:bg-[#2a1216] text-red-800 dark:text-red-200 hover:bg-red-700 hover:text-white dark:hover:bg-red-700 dark:hover:text-white transition-colors text-sm font-semibold cursor-pointer disabled:opacity-60"
                    >
                      <Crosshair
                        className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`}
                      />
                      <span>
                        {gpsLoading
                          ? 'Detecting Current Location...'
                          : 'Use Current Location'}
                      </span>
                    </button>
                    {gpsStatus && (
                      <p className="mt-1.5 text-xs text-[#694246] dark:text-red-200/80">
                        {gpsStatus}
                      </p>
                    )}
                  </div>

                  {/* Karachi Area Search & Select */}
                  <div>
                    <label
                      htmlFor="karachi-area-select"
                      className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1.5"
                    >
                      Select Your Area in Karachi
                    </label>

                    <div className="relative mb-2">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6064] dark:text-red-200/60" />
                      <input
                        type="text"
                        value={areaSearch}
                        onChange={(e) => setAreaSearch(e.target.value)}
                        placeholder="Search Karachi area (e.g. North Karachi, Gulshan, DHA)..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#1f0e11] text-[#1f0e10] dark:text-white placeholder:text-[#9c7276] dark:placeholder:text-red-200/40 focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <select
                      id="karachi-area-select"
                      value={selectedAreaId}
                      onChange={(e) => {
                        setSelectedAreaId(e.target.value);
                        setCustomCoords(null);
                        setGpsStatus(null);
                      }}
                      size={5}
                      className="w-full rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#1f0e11] text-[#1f0e10] dark:text-white text-sm p-1.5 focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {filteredAreas.map((area) => (
                        <option
                          key={area.id}
                          value={area.id}
                          className="py-1.5 px-2.5 rounded-lg checked:bg-red-700 checked:text-white"
                        >
                          {area.name} ({area.zone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="street-address-input"
                      className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1.5"
                    >
                      House / Flat / Street Details (Optional now)
                    </label>
                    <input
                      id="street-address-input"
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House #, Block / Sector, Street or Landmark"
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#1f0e11] text-[#1f0e10] dark:text-white placeholder:text-[#9c7276] dark:placeholder:text-red-200/40 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-[#ead4d0] dark:border-[#391c20] bg-[#fcefe9] dark:bg-[#231013] p-4 text-sm space-y-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {orderType === 'Takeaway'
                          ? 'Pickup from Shahi Pizza Kitchen'
                          : 'Dine-In Table Service'}
                      </p>
                      <p className="mt-0.5 text-xs text-[#694246] dark:text-red-200/75 leading-relaxed">
                        {RESTAURANT_LOCATION.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-red-900/25 transition-all cursor-pointer"
              >
                {orderType === 'Delivery'
                  ? `Confirm ${selectedArea.name.split('(')[0].trim()}`
                  : `Continue with ${orderType}`}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
