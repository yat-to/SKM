"use client";

import { TailSpin } from 'react-loader-spinner';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <TailSpin
        visible={true}
        height="80"
        width="80"
        color="#3b82f6"
        ariaLabel="tail-spin-loading"
        radius="1"
      />
    </div>
  );
}