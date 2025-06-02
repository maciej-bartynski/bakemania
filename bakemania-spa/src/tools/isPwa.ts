const isStandalone = (): boolean =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone: boolean }).standalone === true;

const isIos = (): boolean =>
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    /Safari/.test(navigator.userAgent) &&
    !/CriOS/.test(navigator.userAgent);

const isAndroid = (): boolean =>
    /Android/.test(navigator.userAgent) &&
    /Chrome/.test(navigator.userAgent);

export {
    isStandalone,
    isIos,
    isAndroid,
};