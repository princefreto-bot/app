import { animate, stagger } from 'animejs';

export { stagger };

interface AnimeParams {
  targets: string | Element | Element[] | NodeList | null;
  translateX?: number | number[] | string | string[];
  translateY?: number | number[] | string | string[];
  opacity?: number | number[];
  scale?: number | number[];
  rotate?: number | string | number[] | string[];
  duration?: number;
  delay?: number | ReturnType<typeof stagger>;
  easing?: string;
  complete?: () => void;
}

export function anime(params: AnimeParams) {
  if (!params.targets) return;
  
  const target = typeof params.targets === 'string' 
    ? document.querySelectorAll(params.targets)
    : params.targets instanceof Element 
      ? [params.targets]
      : params.targets;
  
  if (!target || (target instanceof NodeList && target.length === 0)) return;
  
  const elements = Array.from(target instanceof NodeList ? target : (Array.isArray(target) ? target : [target]));
  
  elements.forEach((el, index) => {
    if (!(el instanceof HTMLElement)) return;
    
    const delayMs = typeof params.delay === 'number' 
      ? params.delay 
      : typeof params.delay === 'function' 
        ? (params.delay as unknown as (i: number) => number)(index)
        : 0;
    
    setTimeout(() => {
      const duration = params.duration || 1000;
      el.style.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      
      if (params.translateX !== undefined) {
        const val = Array.isArray(params.translateX) ? params.translateX[1] : params.translateX;
        el.style.transform = `translateX(${val}px)`;
      }
      if (params.translateY !== undefined) {
        const val = Array.isArray(params.translateY) ? params.translateY[1] : params.translateY;
        el.style.transform = `translateY(${val}px)`;
      }
      if (params.opacity !== undefined) {
        const val = Array.isArray(params.opacity) ? params.opacity[1] : params.opacity;
        el.style.opacity = String(val);
      }
      if (params.scale !== undefined) {
        const val = Array.isArray(params.scale) ? params.scale[1] : params.scale;
        el.style.transform = `scale(${val})`;
      }
      if (params.rotate !== undefined) {
        const val = Array.isArray(params.rotate) ? params.rotate[1] : params.rotate;
        el.style.transform = `rotate(${val}deg)`;
      }
      
      if (params.complete) {
        setTimeout(params.complete, duration);
      }
    }, delayMs);
  });
}

// Simple animation helper using CSS transitions
export function animateElement(
  element: HTMLElement | null,
  properties: Record<string, string>,
  duration: number = 500,
  onComplete?: () => void
) {
  if (!element) return;
  
  element.style.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
  
  Object.entries(properties).forEach(([key, value]) => {
    (element.style as unknown as Record<string, string>)[key] = value;
  });
  
  if (onComplete) {
    setTimeout(onComplete, duration);
  }
}

export { animate as animeCore, stagger as animeStagger };
