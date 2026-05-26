import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-[180px] bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] rounded-[24px] border border-slate-200 animate-shimmer"
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
