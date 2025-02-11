// utils/color.ts
export const validateColor = (color: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
};

export const defaultColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#E67E22'
] as const;