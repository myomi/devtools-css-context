const PANE_NAME = "CSS Contexts";

function cssContext() {
  /**
   * Get Stacking Context
   * @param element stacking context
   */
  function getStackContext(element: HTMLElement): HTMLElement {
    // Root element of the document (<html>).
    if (element.nodeName === "HTML") {
      return element;
    }

    const computedStyle = window.getComputedStyle(
      element
    ) as CSSStyleDeclaration & {
      mixBlendMode: string | null;
      maskBorder: string | null;
      isolation: string | null;
      webkitOverflowScrolling: string | null;
      contain: string | null;
    };

    // Element with a position value fixed or sticky (sticky for all mobile browsers, but not older desktop).
    if (
      computedStyle.position === "fixed" ||
      computedStyle.position === "sticky"
    ) {
      return element;
    }

    // Element with a position value absolute or relative and z-index value other than auto.
    if (
      computedStyle.zIndex !== "auto" &&
      computedStyle.position !== "static"
    ) {
      return element;
    }

    // Element that is a child of a flex (flexbox) container, with z-index value other than auto.
    // Element that is a child of a grid (grid) container, with z-index value other than auto.
    if (computedStyle.zIndex !== "auto") {
      const parentStyle = window.getComputedStyle(element.parentElement);
      if (
        parentStyle.display === "flex" ||
        parentStyle.display === "inline-flex" ||
        parentStyle.display === "grid" ||
        parentStyle.display === "grid-inline"
      ) {
        return element;
      }
    }

    // Element with a opacity value less than 1 (See the specification for opacity).
    if (computedStyle.opacity !== "1") {
      return element;
    }

    // Element with a mix-blend-mode value other than normal.
    if (computedStyle.mixBlendMode && computedStyle.mixBlendMode !== "normal") {
      return element;
    }

    /* Element with any of the following properties with value other than none:
     *  transform
     * filter
     * perspective
     * clip-path
     * mask / mask-image / mask-border
     */
    if (
      (computedStyle.transform && computedStyle.transform !== "none") ||
      (computedStyle.filter && computedStyle.filter !== "none") ||
      (computedStyle.perspective && computedStyle.perspective !== "none") ||
      (computedStyle.clipPath && computedStyle.clipPath !== "none") ||
      (computedStyle.mask && computedStyle.mask !== "none") ||
      (computedStyle.maskImage && computedStyle.maskImage !== "none") ||
      (computedStyle.maskBorder && computedStyle.maskBorder !== "none")
    ) {
      return element;
    }

    // Element with a isolation value isolate.
    if (computedStyle.isolation === "isolate") {
      return element;
    }

    // Element with a -webkit-overflow-scrolling value touch.
    if (computedStyle.webkitOverflowScrolling === "touch") {
      return element;
    }

    // Element with a will-change value specifying any property that would create a stacking context on non-initial value.
    if (
      computedStyle.willChange === "transform" ||
      computedStyle.willChange === "opacity"
    ) {
      return element;
    }

    // Element with a contain value of layout, or paint, or a composite value that includes either of them (i.e. contain: strict, contain: content).
    if (
      computedStyle.contain === "layout" ||
      computedStyle.contain === "paint" ||
      computedStyle.contain === "strict" ||
      computedStyle.contain === "content"
    ) {
      return element;
    }

    return getStackContext(element.parentElement);
  }

  function getContainingBlock(element: HTMLElement): HTMLElement {
    // Root element of the document (<html>).
    if (element.nodeName === "HTML") {
      return element;
    }

    const computedStyle = window.getComputedStyle(element);

    if (
      computedStyle.position === "static" ||
      computedStyle.position === "relative" ||
      computedStyle.position === "sticky"
    ) {
      // block container or element creating formatting context
      return getNearestBlockContainerOrFormattingContextOwner(element);
    } else if (computedStyle.position === "absolute") {
      const transformContainingBlock = getNearestContainingBlockByTransform(
        element
      );
      // nearest ancestor element that has a position value other than static
      return transformContainingBlock
        ? transformContainingBlock
        : getNearestAbsolutelyPositioned(element);
    } else if (computedStyle.position === "fixed") {
      const transformContainingBlock = getNearestContainingBlockByTransform(
        element
      );
      // viewport
      return transformContainingBlock
        ? transformContainingBlock
        : document.documentElement;
    } else {
      // unknown
      return null;
    }
  }

  function getNearestContainingBlockByTransform(
    element: HTMLElement
  ): HTMLElement | null {
    const parent = element.parentElement;
    if (parent.nodeName === "HTML") {
      return null;
    }
    const computedStyle = window.getComputedStyle(parent);

    if (
      computedStyle.transform !== "none" ||
      computedStyle.perspective !== "none"
    ) {
      return parent;
    }
    
    if (
      computedStyle.willChange === "transform" ||
      computedStyle.willChange === "perspective"
    ) {
      return parent;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    if (
      userAgent === "firefox" &&
      (computedStyle.filter !== "none" || computedStyle.willChange === "filter")
    ) {
      // only Firefox
      return parent;
    }
    return getNearestContainingBlockByTransform(parent);
  }

  function getNearestBlockContainerOrFormattingContextOwner(
    element: HTMLElement
  ): HTMLElement {
    const parent = element.parentElement;
    if (parent.nodeName === "HTML") {
      // initial containing block
      return parent;
    }

    const computedStyle = getComputedStyle(parent);

    if (
      computedStyle.display.includes("block") ||
      computedStyle.display === "list-item" ||
      computedStyle.display === "flow-root" ||
      computedStyle.display === "table-caption" ||
      computedStyle.display === "table-cell"
    ) {
      // create new block container
      return parent;
    }

    if (
      computedStyle.display === "table" ||
      computedStyle.display.includes("flex") ||
      computedStyle.display.includes("grid") ||
      computedStyle.display === "ruby"
    ) {
      // create new formatting context
      return parent;
    }

    if (computedStyle.display === "inline") {
      // FIXME
    }

    return getNearestBlockContainerOrFormattingContextOwner(parent);
  }

  function getNearestAbsolutelyPositioned(element: HTMLElement): HTMLElement {
    const parent = element.parentElement;
    if (parent.nodeName === "HTML") {
      // initial containing block
      return parent;
    }

    const computedStyle = getComputedStyle(parent);
    if (computedStyle.position !== "static") {
      // absolutely positioned
      return parent;
    }

    return getNearestAbsolutelyPositioned(parent);
  }

  // enum FormattingContext {
  //   BLOCK,
  //   INLINE,
  //   TABLE,
  //   FLEX,
  //   GRID
  // }

  // function getFormattingContext(element: HTMLElement): FormattingContext {
  //   const parent = element.parentElement;
  //   if (parent.nodeName === "HTML") {
  //     return FormattingContext.BLOCK;
  //   }
  //   const computedStyle = getComputedStyle(parent);
  //   const display = computedStyle.display
  //   if (display.includes("grid")) {
  //     return FormattingContext.GRID;
  //   } else if (display.includes("flex")) {
  //     return FormattingContext.FLEX;
  //   } else if (display.includes("TABLE")) {
  //     return FormattingContext.TABLE;
  //   } else if (display === 'inline-block') {
  //     return FormattingContext.BLOCK;
  //   }
  // }

  const current = (this as any).$0 as HTMLElement | null;
  const computedStyle = window.getComputedStyle(current);
  const closeStackContext = current ? getStackContext(current) : null;
  const stackContext =
    closeStackContext === current && current.nodeName !== "HTML"
      ? getStackContext(current.parentElement)
      : closeStackContext;

  const result = {
    __proto__: null,
    current,
    display: computedStyle.display,
    position: computedStyle.position,
    float: computedStyle.float,
    clear: computedStyle.clear,
    containingBlock: getContainingBlock(current),
    stackContext,
    "z-index":
      computedStyle.zIndex === "auto" ? "auto" : parseInt(computedStyle.zIndex),
    "create stack context?": current === closeStackContext
  };
  return result;
}

chrome.devtools.panels.elements.createSidebarPane(PANE_NAME, sidebar => {
  function update() {
    sidebar.setExpression("(" + cssContext.toString() + ")()");
  }
  update();
  chrome.devtools.panels.elements.onSelectionChanged.addListener(update);
});
