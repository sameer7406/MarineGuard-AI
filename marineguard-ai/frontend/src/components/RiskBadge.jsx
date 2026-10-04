import React from 'react';
import { getPriorityBadgeClass } from '../services/mapUtils';

const RiskBadge = ({ priority, text }) => {
  const badgeClass = getPriorityBadgeClass(priority);
  const displayText = text || priority;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wider border ${badgeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      <span>{displayText}</span>
    </span>
  );
};

export default RiskBadge;
