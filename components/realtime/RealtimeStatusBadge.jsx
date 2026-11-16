'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Radio, RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function RealtimeIndicator() {
  const { isConnected, isReconnecting } = useSocket();

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300">
      {isConnected ? (
        <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Updates Active</span>
        </span>
      ) : isReconnecting ? (
        <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border-amber-200">
          <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
          <span>Reconnecting...</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 border-slate-200">
          <span className="h-2 w-2 rounded-full bg-slate-400"></span>
          <span>Syncing via Cloud</span>
        </span>
      )}
    </div>
  );
}

export function RealtimeToast() {
  const { lastUpdate } = useSocket();
  const [visible, setVisible] = useState(false);
  const [currentUpdate, setCurrentUpdate] = useState(null);

  useEffect(() => {
    if (lastUpdate && lastUpdate.bookingId) {
      setCurrentUpdate(lastUpdate);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  if (!visible || !currentUpdate) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex-1 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
              Real-Time Booking Update
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(currentUpdate.receivedAt || Date.now()).toLocaleTimeString()}
            </span>
          </div>
          <p className="font-semibold text-white text-sm">
            Booking #{currentUpdate.bookingId.slice(-6)}
          </p>
          <p className="text-slate-300">
            Status changed to <strong className="text-emerald-300">{currentUpdate.status}</strong>
            {currentUpdate.callStatus === 'Called' && ' (Technician Called)'}
            {currentUpdate.technicianStatus === 'On The Way' && ' (Technician On The Way)'}
            {currentUpdate.workStatus === 'Done' && ' (Service Completed)'}
          </p>
          {currentUpdate.updatedAt && (
            <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
              <Clock className="w-3 h-3" />
              <span>Timestamp: {new Date(currentUpdate.updatedAt).toLocaleTimeString()}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-white text-sm font-bold ml-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
