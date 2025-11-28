import type { BarcodeFormat } from 'barcode-detector';
import { type ReactNode } from 'react';
import type { IDetectedBarcode, IScannerClassNames, IScannerComponents, IScannerStyles } from '../types';
export interface IScannerProps {
    onScan: (detectedCodes: IDetectedBarcode[]) => void;
    onError?: (error: unknown) => void;
    constraints?: MediaTrackConstraints;
    formats?: BarcodeFormat[];
    paused?: boolean;
    children?: ReactNode;
    components?: IScannerComponents;
    styles?: IScannerStyles;
    classNames?: IScannerClassNames;
    allowMultiple?: boolean;
    scanDelay?: number;
    sound?: boolean | string;
}
export declare function Scanner(props: IScannerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Scanner.d.ts.map