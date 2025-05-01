declare module 'bootstrap' {
  export class Modal {
    constructor(element: Element | string, options?: any);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    static getInstance(element: Element): Modal | null;
  }

  export class Tooltip {
    constructor(element: Element | string, options?: any);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    static getInstance(element: Element): Tooltip | null;
  }

  export class Popover {
    constructor(element: Element | string, options?: any);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    static getInstance(element: Element): Popover | null;
  }

  export class Alert {
    constructor(element: Element | string);
    close(): void;
    dispose(): void;
    static getInstance(element: Element): Alert | null;
  }

  export class Carousel {
    constructor(element: Element | string, options?: any);
    cycle(): void;
    pause(): void;
    prev(): void;
    next(): void;
    dispose(): void;
    static getInstance(element: Element): Carousel | null;
  }

  export class Collapse {
    constructor(element: Element | string, options?: any);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    static getInstance(element: Element): Collapse | null;
  }

  export class Dropdown {
    constructor(element: Element | string, options?: any);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    static getInstance(element: Element): Dropdown | null;
  }

  export class Offcanvas {
    constructor(element: Element | string, options?: any);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    static getInstance(element: Element): Offcanvas | null;
  }

  export class Tab {
    constructor(element: Element | string);
    show(): void;
    dispose(): void;
    static getInstance(element: Element): Tab | null;
  }

  export class Toast {
    constructor(element: Element | string, options?: any);
    show(): void;
    hide(): void;
    dispose(): void;
    static getInstance(element: Element): Toast | null;
  }
}