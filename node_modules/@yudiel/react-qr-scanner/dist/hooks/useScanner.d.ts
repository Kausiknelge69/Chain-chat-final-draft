import { type BarcodeFormat, type DetectedBarcode } from 'barcode-detector';
import { type RefObject } from 'react';
interface IUseScannerProps {
    videoElementRef: RefObject<HTMLVideoElement | null>;
    onScan: (result: DetectedBarcode[]) => void;
    onFound: (result: DetectedBarcode[]) => void;
    formats?: BarcodeFormat[];
    sound?: boolean | string;
    allowMultiple?: boolean;
    retryDelay?: number;
    scanDelay?: number;
}
export default function useScanner(props: IUseScannerProps): {
    startScanning: () => void;
    stopScanning: () => void;
};
export {};
//# sourceMappingURL=useScanner.d.ts.map