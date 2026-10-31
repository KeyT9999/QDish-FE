import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import type { MenuLocale } from '@/types/menuTranslation';

interface LocaleFlagIconProps {
  locale: MenuLocale;
  className?: string;
}

export const LocaleFlagIcon: React.FC<LocaleFlagIconProps> = ({ locale, className }) => {
  const clipId = useId();
  const baseClass = cn('shrink-0 rounded-full ring-1 ring-black/10', className);

  switch (locale) {
    case 'vi':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={baseClass}>
          <circle cx="12" cy="12" r="12" fill="#DA251D" />
          <polygon
            points="12,5.2 13.7,10.2 19,10.2 14.7,13.3 16.3,18.3 12,15.2 7.7,18.3 9.3,13.3 5,10.2 10.3,10.2"
            fill="#FFFF00"
          />
        </svg>
      );

    case 'en':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={baseClass}>
          <defs>
            <clipPath id={clipId}>
              <circle cx="12" cy="12" r="12" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <rect width="24" height="24" fill="#012169" />
            <path d="M0,0 L24,24 M24,0 L0,24" stroke="#FFFFFF" strokeWidth="4.6" />
            <path d="M0,0 L24,24 M24,0 L0,24" stroke="#C8102E" strokeWidth="2.2" />
            <path d="M12,0 V24 M0,12 H24" stroke="#FFFFFF" strokeWidth="7" />
            <path d="M12,0 V24 M0,12 H24" stroke="#C8102E" strokeWidth="4" />
          </g>
        </svg>
      );

    case 'zh-CN':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={baseClass}>
          <circle cx="12" cy="12" r="12" fill="#DE2910" />
          <polygon
            points="7.5,6 8.5,9 11.6,9 9.1,10.8 10,13.8 7.5,12 5,13.8 5.9,10.8 3.4,9 6.5,9"
            fill="#FFDE00"
          />
          <circle cx="14" cy="5.5" r="1" fill="#FFDE00" />
          <circle cx="16.2" cy="8" r="1" fill="#FFDE00" />
          <circle cx="16.2" cy="11.5" r="1" fill="#FFDE00" />
          <circle cx="14" cy="14" r="1" fill="#FFDE00" />
        </svg>
      );

    case 'ru':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={baseClass}>
          <defs>
            <clipPath id={clipId}>
              <circle cx="12" cy="12" r="12" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <rect y="0" width="24" height="8" fill="#FFFFFF" />
            <rect y="8" width="24" height="8" fill="#0039A6" />
            <rect y="16" width="24" height="8" fill="#D52B1E" />
          </g>
        </svg>
      );

    case 'ko':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={cn(baseClass, 'ring-black/15')}>
          <circle cx="12" cy="12" r="12" fill="#FFFFFF" />
          <path d="M12,7 A5,5 0 0,1 12,17 A2.5,2.5 0 0,1 12,12 A2.5,2.5 0 0,0 12,7 Z" fill="#CD2E3A" />
          <path d="M12,17 A5,5 0 0,1 12,7 A2.5,2.5 0 0,0 12,12 A2.5,2.5 0 0,1 12,17 Z" fill="#0047A0" />
          <rect x="5" y="5.5" width="3.5" height="1.2" transform="rotate(-35 6.5 6)" fill="#111827" />
          <rect x="15.5" y="5.5" width="3.5" height="1.2" transform="rotate(35 17 6)" fill="#111827" />
          <rect x="5" y="17" width="3.5" height="1.2" transform="rotate(35 6.5 17.5)" fill="#111827" />
          <rect x="15.5" y="17" width="3.5" height="1.2" transform="rotate(-35 17 17.5)" fill="#111827" />
        </svg>
      );

    case 'hi-IN':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={baseClass}>
          <defs>
            <clipPath id={clipId}>
              <circle cx="12" cy="12" r="12" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <rect y="0" width="24" height="8" fill="#FF9933" />
            <rect y="8" width="24" height="8" fill="#FFFFFF" />
            <rect y="16" width="24" height="8" fill="#138808" />
            <circle cx="12" cy="12" r="2.6" fill="none" stroke="#000080" strokeWidth="1.3" />
            <circle cx="12" cy="12" r="0.8" fill="#000080" />
          </g>
        </svg>
      );
  }
};
