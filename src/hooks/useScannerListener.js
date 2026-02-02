import { useEffect, useRef } from 'react';
import { parseScanData } from '../utils/scanner';

export const useScanListener = (onScan) => {
    const onScanRef = useRef(onScan);

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();

        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code) || e.key === ' ') {
                e.preventDefault();
            }

            const currentTime = Date.now();
            
            if (currentTime - lastKeyTime > 2000) buffer = ''; 
            lastKeyTime = currentTime;

            if (e.key === 'Enter') {
                e.preventDefault();
                buffer += " "; 
            } else if (e.key.length === 1) {
                buffer += e.key;
            }

            const detectedSku = parseScanData(buffer);
            if (detectedSku) {
                if (onScanRef.current) onScanRef.current(detectedSku);
                buffer = '';
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
};