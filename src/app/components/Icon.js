import * as LucideIcons from 'lucide-react';

export default function Icon({ iconName, color }) {
    const LucideIcon = LucideIcons[iconName];
    const isGoogleIcon = iconName && !LucideIcon;

    if (LucideIcon) return <LucideIcon size={20} color={color} />;
    if (isGoogleIcon) return <span className="material-icons text-[20px]" style={{ color }}>{iconName}</span>;
    return null;
}