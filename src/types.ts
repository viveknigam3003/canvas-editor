export interface Artboard {
    id: string;
    name: string;
    width: number;
    height: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state?: Record<string, any>;
}

export type colorSpaceType = 'srgb' | 'display-p3'