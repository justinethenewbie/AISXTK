import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { sanitizeAndFixMathText } from './components/MathFormula.tsx';

declare global {
  interface Window {
    renderMathInElement?: (element: HTMLElement, options: any) => void;
  }
}

/**
 * Global Math Scanner & Auto-render Engine for any HTML container
 */
function processMathInContainer(container: HTMLElement) {
  if (!container || typeof window === 'undefined' || !window.renderMathInElement) return;

  try {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const textNodes: Node[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parentTag = node.parentNode ? (node.parentNode as HTMLElement).tagName : '';
      const parentElement = node.parentNode as HTMLElement;

      if (
        !['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE', 'MATH-FIELD'].includes(parentTag) &&
        !parentElement?.closest?.('.katex')
      ) {
        if (node.nodeValue && /\\[a-zA-Z]+/.test(node.nodeValue)) {
          textNodes.push(node);
        }
      }
    }

    textNodes.forEach((node) => {
      if (node.nodeValue) {
        const fixed = sanitizeAndFixMathText(node.nodeValue);
        if (fixed !== node.nodeValue) {
          node.nodeValue = fixed;
        }
      }
    });

    window.renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false, // Never crash on syntax errors
      strict: false,
    });
  } catch (e) {
    // Ignore render error
  }
}

// Global MutationObserver to automatically detect new hints, steps, popups and render math immediately
if (typeof window !== 'undefined') {
  const initMathObserver = () => {
    processMathInContainer(document.body);

    let renderTimeout: any = null;
    const observer = new MutationObserver((mutations) => {
      let shouldRender = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0 && !(m.target as HTMLElement).closest?.('.katex')) {
          shouldRender = true;
          break;
        }
      }
      if (shouldRender) {
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => {
          processMathInContainer(document.body);
        }, 60);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMathObserver);
  } else {
    setTimeout(initMathObserver, 100);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
