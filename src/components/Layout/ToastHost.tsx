import { useToast } from '../../store/ui';

const iconMap: Record<string, string> = {
  processing: '/Hourglass.svg',
  success: '/Checkmark--outline.svg',
  error: '/Error--outline.svg',
};

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function ToastHost() {
  const { toasts } = useToast();
  if (!toasts.length) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50 space-y-3 w-[min(92vw,320px)] top-[42px]">
      {toasts.map((t) => {
        const color = t.type === 'error' ? '#F97066' : t.type === 'success' ? '#31D482' : '#ffffff';
        const textColor = color;
        const subColor = t.type === 'processing' ? 'rgba(255,255,255,0.8)' : hexToRgba(color, 0.8);
        const shadow = `0 0 0 4px ${hexToRgba(color, 0.35)}, 0 0 0 4px ${hexToRgba(color, 0.25)}`;
        return (
          <div
            key={t.id}
            className={`rounded-[12px] border-1 px-4 py-3 flex items-start gap-3 backdrop-blur-sm`}
            style={{
              background: 'rgba(0,0,0,0.85)',
              borderColor: color,
              boxShadow: shadow,
            }}
          >
            <img src={iconMap[t.type]} alt={t.type} className="w-6 h-6 opacity-90 mt-0.5" />
            <div>
              <div className="text-base font-semibold" style={{ color: textColor }}>
                {t.title}
              </div>
              {t.description && (
                <div className="text-sm mt-1" style={{ color: subColor }}>
                  {t.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ToastHost;


