/**
 * Media Utilities for Ares Platform
 * Handles watermarked downloads for both Cloudinary and Local storage.
 */

import { isCloudinaryUrl, shouldApplyWatermark, WatermarkSettings } from './watermark';

export const downloadMedia = async (
  url: string, 
  name: string, 
  vendor: any, 
  settings: WatermarkSettings | undefined,
  onStart?: () => void,
  onEnd?: () => void
) => {
  try {
    if (onStart) onStart();

    const applyWatermark = shouldApplyWatermark(
      vendor?.plan_id, 
      settings, 
      vendor?.plan_features?.watermark_enabled
    );
    const isCloudinary = isCloudinaryUrl(url);

    // Caso A: No hay marca de agua o es Cloudinary (la URL ya viene marcada)
    if (!applyWatermark || isCloudinary) {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${name.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      return;
    }

    // Caso B: Local Storage + Watermark (Usar Canvas)
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevenir problemas de CORS
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Error al cargar la imagen para procesar.'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No se pudo obtener el contexto del Canvas');

    // Dibujar imagen base
    ctx.drawImage(img, 0, 0);

    // Dibujar Marca de Agua
    const opacity = settings?.watermark_opacity || 0.5;
    ctx.globalAlpha = opacity;

    if (settings?.watermark_type === 'IMAGE' && settings.watermark_image_url) {
      const watermarkImg = new Image();
      watermarkImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        watermarkImg.onload = resolve;
        watermarkImg.onerror = resolve; // Continuar aunque falle el logo
        watermarkImg.src = settings.watermark_image_url;
      });

      if (watermarkImg.complete && watermarkImg.naturalWidth > 0) {
        const w = img.width * 0.3;
        const h = (watermarkImg.height / watermarkImg.width) * w;
        ctx.drawImage(watermarkImg, img.width - w - 40, img.height - h - 40, w, h);
      }
    } else {
      // Texto por defecto
      const text = settings?.watermark_text || 'ARES PLATFORM';
      const fontSize = Math.round(img.width * 0.05); // Dinámico basado en tamaño
      ctx.font = `900 ${fontSize}px Arial`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Sombra
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      
      ctx.save();
      ctx.translate(img.width / 2, img.height / 2);
      ctx.rotate(-45 * Math.PI / 180);
      ctx.fillText(text.toUpperCase(), 0, 0);
      ctx.restore();
    }

    // Exportar y descargar
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${name.replace(/\s+/g, '_')}_wm.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Download error:', error);
    alert('Error al procesar la descarga de la imagen.');
  } finally {
    if (onEnd) onEnd();
  }
};
