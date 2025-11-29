import { Renderer } from 'marked';
import { escapeAts, escapeBrackets } from '../../../shared';

export function wrapRendererWithEscapeAts(renderer: Renderer, method: string) {
  const originalRenderer = renderer[method];

  const wrapped = (...args: any[]) => {
    return escapeAts(originalRenderer.call(renderer, ...args));
  };

  renderer[method] = wrapped;
}

export function wrapRendererWithEscapeBrackets(renderer: Renderer, method: string) {
  const originalRenderer = renderer[method];

  const wrapped = (...args: any[]) => {
    return escapeBrackets(originalRenderer.call(renderer, ...args));
  };

  renderer[method] = wrapped;
}
