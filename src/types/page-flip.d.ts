declare module "page-flip" {
  export type FlipCorner = "top" | "bottom";
  export type FlippingState = "user_fold" | "fold_corner" | "flipping" | "read";
  export type Orientation = "portrait" | "landscape";

  export interface FlipSetting {
    startPage?: number;
    size?: "fixed" | "stretch";
    width?: number;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface PageFlipEventMap {
    flip: number;
    changeState: FlippingState;
    changeOrientation: Orientation;
    init: { page: number; mode: Orientation };
    update: { page: number; mode: Orientation };
  }

  export class PageFlip {
    constructor(container: HTMLElement, settings: FlipSetting);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    loadFromImages(imagesHref: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    update(): void;
    destroy(): void;
    turnToPage(page: number): void;
    turnToPrevPage(): void;
    turnToNextPage(): void;
    flip(page: number, corner?: FlipCorner): void;
    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): Orientation;
    getState(): FlippingState;
    on<K extends keyof PageFlipEventMap>(
      eventName: K,
      callback: (e: { data: PageFlipEventMap[K]; object: PageFlip }) => void
    ): void;
  }
}
