/**
 * Watermarking Utility for Ares Platform
 * Supports both Cloudinary (URL transformations) and Local (Canvas/CSS).
 */

export interface WatermarkSettings {
  watermark_enabled: boolean;
  watermark_type: string; // 'TEXT' | 'IMAGE'
  watermark_text: string;
  watermark_image_url: string;
  watermark_opacity: number;
}

/**
 * Checks if a URL is from Cloudinary.
 */
export function isCloudinaryUrl(url: string | undefined): boolean {
  return !!url && url.includes('cloudinary.com');
}

/**
 * Checks if the user's plan is subject to watermarking.
 */
export function shouldApplyWatermark(
  planId: string | undefined, 
  settings: WatermarkSettings | undefined,
  planEnabled?: boolean
): boolean {
  if (!settings || !settings.watermark_enabled) return false;
  
  // Si el plan tiene el flag explícito (nuevo sistema), lo usamos como prioridad
  if (planEnabled !== undefined) return planEnabled;

  // Fallback legacy para planes hardcoded
  const plan = planId?.toLowerCase() || '';
  const restrictedPlans = ['plan-gratis', 'plan-vendedor', 'gratis', 'vendedor'];
  return restrictedPlans.includes(plan);
}

/**
 * GET WATERMARKED URL (Only for Cloudinary)
 */
export function getWatermarkedUrl(
  originalUrl: string | undefined, 
  planId: string | undefined, 
  settings: WatermarkSettings | undefined,
  planEnabled?: boolean
): string {
  if (!originalUrl) return '';
  if (!shouldApplyWatermark(planId, settings, planEnabled)) return originalUrl;
  
  // Si no es Cloudinary, devolvemos la URL original (el componente usará CSS/Canvas)
  if (!isCloudinaryUrl(originalUrl)) return originalUrl;

  let transformation = '';
  const opacity = Math.round((settings?.watermark_opacity || 0.5) * 100);

  if (settings?.watermark_type === 'IMAGE' && settings.watermark_image_url) {
    const match = settings.watermark_image_url.match(/upload\/(?:v\d+\/)?(.+)$/);
    if (match) {
        const publicId = match[1].split('.')[0].replace(/\//g, ':');
        transformation = `l_${publicId},w_0.3,c_scale,o_${opacity},g_south_east,x_20,y_20/`;
    }
  } else {
    const text = encodeURIComponent(settings?.watermark_text || 'ARES PLATFORM');
    transformation = `l_text:Arial_80_bold:${text},co_rgb:ffffff,o_${opacity},g_center,angle_45/`;
  }

  if (!transformation) return originalUrl;

  if (originalUrl.includes('/upload/')) {
    return originalUrl.replace('/upload/', `/upload/${transformation}`);
  }

  return originalUrl;
}
