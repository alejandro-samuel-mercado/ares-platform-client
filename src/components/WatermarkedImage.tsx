'use client';

import React from 'react';
import { getWatermarkedUrl, isCloudinaryUrl, shouldApplyWatermark, WatermarkSettings } from '@/lib/watermark';
import { useAuth } from '@/lib/auth';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  settings: WatermarkSettings | undefined;
}

export const WatermarkedImage: React.FC<WatermarkedImageProps> = ({ 
  src, 
  settings, 
  alt = '', 
  style, 
  ...props 
}) => {
  const { vendor } = useAuth();
  const applyWatermark = shouldApplyWatermark(vendor?.plan_id, settings, vendor?.plan_features?.watermark_enabled);
  const isCloudinary = isCloudinaryUrl(src as string);

  // Caso 1: No aplica marca de agua o no hay imagen
  if (!applyWatermark || !src) {
    return <img src={src as string} alt={alt} style={style} {...props} />;
  }

  // Caso 2: Cloudinary (URL transformada)
  if (isCloudinary) {
    const watermarkedUrl = getWatermarkedUrl(src as string, vendor?.plan_id, settings, vendor?.plan_features?.watermark_enabled);
    return <img src={watermarkedUrl} alt={alt} style={style} {...props} />;
  }

  // Caso 3: Local (CSS Overlay)
  const opacity = settings?.watermark_opacity || 0.5;

  return (
    <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', ...style }}>
      <img src={src} alt={alt} style={{ width: '100%', height: 'auto', display: 'block' }} {...props} />
      
      {/* Overlay de Marca de Agua CSS */}
      <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          opacity: opacity,
          userSelect: 'none'
      }}>
          {settings?.watermark_type === 'IMAGE' && settings.watermark_image_url ? (
            <img 
              src={settings.watermark_image_url} 
              alt="" 
              style={{ 
                maxWidth: '30%', 
                maxHeight: '30%', 
                opacity: 1,
                position: 'absolute',
                bottom: '20px',
                right: '20px'
              }} 
            />
          ) : (
            <div style={{
                color: 'white',
                fontSize: '2rem',
                fontWeight: 900,
                transform: 'rotate(-45deg)',
                border: '4px solid white',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
                {settings?.watermark_text || 'ARES PLATFORM'}
            </div>
          )}
      </div>
    </div>
  );
};
