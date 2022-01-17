export const classNames = (...classes: any[]) => {
	return classes.filter(Boolean).join(' ');
};

export const hexToRGB = (hex: string, alpha?: number) => {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	if (alpha) return `${r},${g},${b},${alpha}`;

	return `${r},${g},${b}`;
};