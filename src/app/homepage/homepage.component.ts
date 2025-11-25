import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BasePageComponent } from '@base-page';

// const CARBON_WIDTH_BREAKPOINT = 1200;

type ThemeVariant =
  | 'light'
  | 'dark'
  | 'sunset'
  | 'ocean'
  | 'light-contrast'
  | 'dark-contrast'
  | 'neon';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomepageComponent implements OnInit, OnDestroy, AfterViewInit {
  isSidebarOpened = true;
  previousWidth: number;
  contentRef: HTMLElement;
  isMarkupReady: boolean;
  logoSrc = this.buildLogoPath('arth_sunset_gold_logo_512.png');

  private scrollSubscription: Subscription;
  private readonly scrollDebounceTime = 100;
  private pendingSearchFocus = false;
  private isSearchScriptLoading = false;
  private searchFocusAttempts = 0;
  private readonly searchFocusListener = () => this.handleExternalSearchFocus();
  private readonly searchErrorListener = () => {
    this.isSearchScriptLoading = false;
  };
  private readonly themeLogoMap: Record<ThemeVariant, string> = {
    light: 'arth_sunset_gold_logo_512.png',
    dark: 'arth_charcoal_silver_logo_512.png',
    sunset: 'arth_sunset_gold_logo_512.png',
    ocean: 'arth_deep_blue_logo_512.png',
    'light-contrast': 'arth_indigo_teal_logo_512.png',
    'dark-contrast': 'arth_emerald_blue_logo_512.png',
    neon: 'arth_deep_blue_logo_512.png',
  };
  private readonly themeChangeListener = (event: Event) => {
    const detail = (event as CustomEvent<ThemeVariant>).detail;
    if (!detail) {
      return;
    }
    this.applyThemeAssets(detail);
  };

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly router: Router,
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
  ) {}

    ngOnInit() {
    if (window.innerWidth < 768) {
      this.isSidebarOpened = false;
      this.router.events
        .pipe(filter((ev) => ev instanceof NavigationEnd))
        .subscribe(() => {
          this.isSidebarOpened = false;
        });
    } else {
      this.isSidebarOpened = true;
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(
        'arth-theme-change',
        this.themeChangeListener as EventListener,
      );
      this.applyThemeAssets(this.getActiveTheme());
    }

    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.checkWindowWidth(window.innerWidth);
    this.ensureSearch();
  }

  ngOnDestroy() {
    window.removeEventListener('arth-search-focus', this.searchFocusListener);
    window.removeEventListener('pagefind-ui-error', this.searchErrorListener);
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'arth-theme-change',
        this.themeChangeListener as EventListener,
      );
    }
    if (!this.scrollSubscription) {
      return;
    }
    this.scrollSubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkWindowWidth(event.target.innerWidth);
  }

  toggleSidebar() {
    this.isSidebarOpened = !this.isSidebarOpened;
  }

  checkWindowWidth(innerWidth?: number) {
    innerWidth = innerWidth ? innerWidth : window.innerWidth;
    console.log('checkWindowWidth - innerWidth:', innerWidth, 'previousWidth:', this.previousWidth);
    if (this.previousWidth !== innerWidth) {
      this.previousWidth = innerWidth;
      if (innerWidth <= 768) {
        this.isSidebarOpened = false;
        console.log('Setting isSidebarOpened to FALSE (mobile)');
      } else {
        this.isSidebarOpened = true;
        console.log('Setting isSidebarOpened to TRUE (desktop)');
      }
      this.cd.detectChanges();
    }
  }

  checkViewportBoundaries() {
    // Carbon ads disabled.
    // const nativeElement: HTMLElement = this.elementRef.nativeElement;
    // const footerRef: HTMLElement = nativeElement.querySelector('app-footer');
    // const carbonRef = nativeElement.querySelector('#carbonads');
    // if (!footerRef || !carbonRef) {
    //   return;
    // }
    // if (window.innerWidth < 768) {
    //   this.renderer.removeStyle(carbonRef, 'position');
    //   this.renderer.removeStyle(carbonRef, 'bottom');
    //   return;
    // }
    //
    // const viewportBottom = window.pageYOffset + window.innerHeight;
    // const footerTop =
    //   footerRef.getBoundingClientRect().top + window.pageYOffset;
    //
    // if (viewportBottom >= footerTop) {
    //   this.renderer.setStyle(carbonRef, 'position', 'absolute');
    //   this.renderer.setStyle(carbonRef, 'bottom', '350px');
    // } else {
    //   this.renderer.removeStyle(carbonRef, 'position');
    //   this.renderer.removeStyle(carbonRef, 'bottom');
    // }
  }

  onRouteActivate(component: BasePageComponent) {
    if (!component) {
      return;
    }
    const nativeElement = component.nativeElement;
    if (!nativeElement) {
      return;
    }

    this.contentRef =
      nativeElement.querySelector('.content') ??
      nativeElement.querySelector('[data-content-root]');
    // Carbon ads disabled.
    // if (this.contentRef && !this.contentRef.querySelector('.carbon-wrapper')) {
    //   const scriptTag = this.createCarbonScriptTag();
    //   const carbonWrapper = document.createElement('div');
    //   carbonWrapper.classList.add('carbon-wrapper');
    //
    //   if (window.innerWidth > CARBON_WIDTH_BREAKPOINT) {
    //     carbonWrapper.classList.add('hide');
    //   }
    //   carbonWrapper.prepend(scriptTag);
    //
    //   this.contentRef.prepend(carbonWrapper);
    // }

    this.cd.markForCheck();

    // // Schedule check as TOC might not be rendered yet
    // const adOverlapCheckDelay = 300;
    // setTimeout(() => this.hideAdIfTocOverflow(), adOverlapCheckDelay);
  }

  // createCarbonScriptTag(): HTMLScriptElement {
  //   const scriptTag = document.createElement('script');
  //   scriptTag.type = 'text/javascript';
  //   scriptTag.src =
  //     '//cdn.carbonads.com/carbon.js?serve=CK7I653M&placement=arthcom';
  //   scriptTag.id = '_carbonads_js';
  //   return scriptTag;
  // }

  private applyThemeAssets(theme: ThemeVariant) {
    const resolvedTheme = this.themeLogoMap[theme] ? theme : 'light';
    const nextLogo = this.buildLogoPath(this.themeLogoMap[resolvedTheme]);
    if (this.logoSrc !== nextLogo) {
      this.logoSrc = nextLogo;
      this.cd.markForCheck();
    }
  }

  private getActiveTheme(): ThemeVariant {
    const modeAttr = document?.documentElement?.getAttribute(
      'mode',
    ) as ThemeVariant | null;
    if (modeAttr && this.themeLogoMap[modeAttr]) {
      return modeAttr;
    }
    return 'light';
  }

  private buildLogoPath(fileName: string): string {
    return `/assets/logos/${fileName}`;
  }

  private ensureSearch(focus = false) {
    if (focus) {
      this.pendingSearchFocus = true;
    }
    if ((window as any).PagefindUI) {
      this.isSearchScriptLoading = false;
      this.initializeSearch();
      return;
    }
    if (this.isSearchScriptLoading) {
      return;
    }
    const onReady = () => {
      window.removeEventListener('pagefind-ui-ready', onReady);
      window.removeEventListener('pagefind-ui-error', onError);
      this.initializeSearch();
    };
    const onError = () => {
      window.removeEventListener('pagefind-ui-ready', onReady);
      window.removeEventListener('pagefind-ui-error', onError);
      this.isSearchScriptLoading = false;
      console.error('Pagefind UI failed to load');
    };
    window.addEventListener('pagefind-ui-ready', onReady);
    window.addEventListener('pagefind-ui-error', onError);
    this.isSearchScriptLoading = true;
    this.loadPagefindCore()
      .then(() => this.ensurePagefindUiScript())
      .catch(() =>
        this.loadPagefindCore(true)
          .then(() => this.ensurePagefindUiScript(true))
          .catch(() => {
            console.error('Failed to load Pagefind core from CDN');
            window.dispatchEvent(new CustomEvent('pagefind-ui-error'));
          }),
      );
  }

  private loadPagefindCore(useCdn = false): Promise<void> {
    const selector = useCdn
      ? 'script[data-pagefind-core-cdn]'
      : 'script[data-pagefind-core]';
    const hasExisting =
      document.querySelector(selector) || (window as any).pagefind;
    if (hasExisting && (window as any).pagefind) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const readyEvent = useCdn
        ? 'pagefind-core-ready-cdn'
        : 'pagefind-core-ready';
      const errorEvent = useCdn
        ? 'pagefind-core-error-cdn'
        : 'pagefind-core-error';

      const onReady = () => {
        window.removeEventListener(errorEvent, onError);
        resolve();
      };
      const onError = () => {
        window.removeEventListener(readyEvent, onReady);
        reject();
      };
      window.addEventListener(readyEvent, onReady, { once: true });
      window.addEventListener(errorEvent, onError, { once: true });

      const script = this.createPagefindModuleLoader(
        useCdn
          ? 'https://cdn.jsdelivr.net/npm/pagefind@1/dist/pagefind.js'
          : '/assets/pagefind/pagefind.js',
        useCdn ? 'data-pagefind-core-cdn' : 'data-pagefind-core',
        readyEvent,
        errorEvent,
      );
      document.body?.appendChild(script);
    });
  }

  private createPagefindModuleLoader(
    src: string,
    attribute: string,
    readyEvent: string,
    errorEvent: string,
  ): HTMLScriptElement {
    const script = document.createElement('script');
    script.type = 'module';
    script.setAttribute(attribute, 'true');
    script.textContent = `
      (async () => {
        try {
          const pagefind = await import('${src}');
          window.pagefind = pagefind;
          window.dispatchEvent(new CustomEvent('${readyEvent}'));
        } catch (error) {
          window.dispatchEvent(new CustomEvent('${errorEvent}', { detail: error }));
        }
      })();
    `;
    return script;
  }

  private ensurePagefindUiScript(forceCdn = false) {
    const win = window as any;
    if (win.PagefindUI && !forceCdn) {
      window.dispatchEvent(new CustomEvent('pagefind-ui-ready'));
      return;
    }
    const head = document.head || document.body;
    if (!head) {
      return;
    }
    if (forceCdn) {
      this.loadPagefindFromCdn(true);
      return;
    }
    if (head.querySelector('script[data-pagefind-ui-script]')) {
      return;
    }
    const uiScript = document.createElement('script');
    uiScript.src = '/assets/pagefind/pagefind-ui.js';
    uiScript.setAttribute('data-pagefind-ui-script', 'true');
    uiScript.onload = () => {
      if ((window as any).PagefindUI) {
        window.dispatchEvent(new CustomEvent('pagefind-ui-ready'));
      } else {
        this.loadPagefindFromCdn(true);
      }
    };
    uiScript.onerror = () => {
      console.warn('Failed to load local Pagefind UI - falling back to CDN');
      this.loadPagefindFromCdn(true);
    };
    head.appendChild(uiScript);
  }

  private loadPagefindFromCdn(triggerEvent = false) {
    const head = document.head;
    if (!head) {
      return;
    }
    if (!head.querySelector('script[data-pagefind-ui-cdn]')) {
      const cdnScript = document.createElement('script');
      cdnScript.src =
        'https://cdn.jsdelivr.net/npm/@pagefind/default-ui@1/dist/pagefind-ui.js';
      cdnScript.setAttribute('data-pagefind-ui-cdn', 'true');
      cdnScript.onload = () => {
        if ((window as any).PagefindUI) {
          window.dispatchEvent(new CustomEvent('pagefind-ui-ready'));
        } else {
          window.dispatchEvent(new CustomEvent('pagefind-ui-error'));
        }
      };
      cdnScript.onerror = () => {
        console.error('Failed to load Pagefind UI from CDN');
        window.dispatchEvent(new CustomEvent('pagefind-ui-error'));
      };
      head.appendChild(cdnScript);
    } else if (triggerEvent) {
      if ((window as any).PagefindUI) {
        window.dispatchEvent(new CustomEvent('pagefind-ui-ready'));
      } else {
        window.dispatchEvent(new CustomEvent('pagefind-ui-error'));
      }
    }
    this.ensurePagefindCss(true);
  }

  private ensurePagefindCss(force = false) {
    const head = document.head;
    if (!head) {
      return;
    }

    const applyOverride = () => this.ensurePagefindOverrideCss();

    const hasLocal =
      head.querySelector('link[data-pagefind-ui-css]') ||
      head.querySelector('link[data-pagefind-ui-css-cdn]');
    if (hasLocal && !force) {
      applyOverride();
      return;
    }

    if (!head.querySelector('link[data-pagefind-ui-css]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = '/assets/pagefind/pagefind-ui.css';
      cssLink.setAttribute('data-pagefind-ui-css', 'true');
      cssLink.onload = applyOverride;
      cssLink.onerror = () => {
        cssLink.remove();
        if (!head.querySelector('link[data-pagefind-ui-css-cdn]')) {
          const cdnCss = document.createElement('link');
          cdnCss.rel = 'stylesheet';
          cdnCss.href =
            'https://cdn.jsdelivr.net/npm/@pagefind/default-ui@1/dist/pagefind-ui.css';
          cdnCss.setAttribute('data-pagefind-ui-css-cdn', 'true');
          cdnCss.onload = applyOverride;
          cdnCss.onerror = () =>
            console.error('Failed to load Pagefind UI styles');
          head.appendChild(cdnCss);
        }
      };
      head.appendChild(cssLink);
    } else {
      applyOverride();
    }
  }

  private ensurePagefindOverrideCss() {
    const head = document.head;
    if (!head) {
      return;
    }
    if (head.querySelector('link[data-pagefind-ui-override]')) {
      return;
    }
    const overrideLink = document.createElement('link');
    overrideLink.rel = 'stylesheet';
    overrideLink.href = '/assets/pagefind/pagefind-overrides.css';
    overrideLink.setAttribute('data-pagefind-ui-override', 'true');
    head.appendChild(overrideLink);
  }

  private initializeSearch() {
    const win = window as any;
    
    // Check if Pagefind UI is already initialized
    if (win.pagefindUI) {
      console.log('Pagefind UI already initialized, skipping');
      if (this.pendingSearchFocus) {
        this.searchFocusAttempts = 0;
        this.focusSearchInput();
      }
      return;
    }

    if (!win.PagefindUI) {
      console.warn('Pagefind UI constructor not available yet');
      return;
    }

    const searchElement = document.querySelector('#search');
    if (!searchElement) {
      console.warn('Search element not found');
      return;
    }

    // Don't clear if already has pagefind content
    const hasPagefindContent = searchElement.querySelector('.pagefind-ui');
    if (hasPagefindContent) {
      console.log('Pagefind UI already rendered, skipping initialization');
      return;
    }

    const placeholderInput = document.querySelector(
      '.search-placeholder .search-input',
    ) as HTMLInputElement | null;
    const placeholder = document.querySelector(
      '.search-placeholder',
    ) as HTMLElement | null;

    searchElement.innerHTML = '';
    this.ensurePagefindCss();

    const bundlePath = '/assets/pagefind/';

    const initPagefind = () => {
      try {
        console.log('Initializing Pagefind UI...', { bundlePath, searchElement });
        win.pagefindUI = new win.PagefindUI({
          element: searchElement,
          showImages: false,
          resetStyles: false,
          bundlePath: '/assets/pagefind/',
          processResult: (result) => {
            // Strip /assets/ prefix and .html extension from URLs to match Angular routing
            if (result.url) {
              result.url = result.url.replace(/^\/assets\//, '/').replace(/\.html$/, '');
            }
            return result;
          },
          translations: {
            placeholder: 'Search docs...',
            zeroResults: 'No results for [SEARCH_TERM]',
            loadMore: 'Load more results',
          },
        });
        console.log('Pagefind UI initialized successfully');
        
        // Remove the placeholder class to hide old search input
        if (searchElement.classList.contains('search-placeholder')) {
          searchElement.classList.remove('search-placeholder');
        }
      } catch (err) {
        console.error('Failed to initialize Pagefind UI', err);
      }

      this.isSearchScriptLoading = false;
      this.searchFocusAttempts = 0;
      if (this.pendingSearchFocus) {
        this.focusSearchInput(placeholderInput?.value || '');
      }
    };

    const indexCheckUrl = `${bundlePath}pagefind-entry.json`;
    try {
      fetch(indexCheckUrl, { method: 'HEAD', cache: 'no-cache' })
        .catch((err) => {
          console.warn('Pagefind index check failed', err);
        })
        .finally(() => initPagefind());
    } catch (err) {
      console.warn('Pagefind index check could not be performed', err);
      initPagefind();
    }
  }

  private handleExternalSearchFocus() {
    this.searchFocusAttempts = 0;
    this.ensureSearch(true);
  }

  private focusSearchInput(prefill = '') {
    setTimeout(() => {
      if (this.searchFocusAttempts > 10) {
        this.pendingSearchFocus = false;
        this.searchFocusAttempts = 0;
        return;
      }
      const input = document.querySelector(
        '.pagefind-ui__search-input',
      ) as HTMLInputElement | null;
      if (input) {
        if (prefill && !input.value) {
          input.value = prefill;
          input.dispatchEvent(new Event('input'));
        }
        input.focus();
        this.pendingSearchFocus = false;
        this.searchFocusAttempts = 0;
      } else {
        this.searchFocusAttempts += 1;
        this.focusSearchInput(prefill);
      }
    }, 50);
  }

  // hideAdIfTocOverflow() {
  //   const carbonHeight = 160;
  //   const offset = 200;
  //   const viewportHeight = window.innerHeight;
  //   const maxTocHeight = viewportHeight - carbonHeight - offset;
  //
  //   const tocElRef = document.querySelector('.toc-wrapper ul');
  //   if (!tocElRef) {
  //     return;
  //   }
  //
  //   if (
  //     tocElRef.clientHeight > maxTocHeight &&
  //     window.innerWidth > CARBON_WIDTH_BREAKPOINT
  //   ) {
  //     this.contentRef.querySelector('.carbon-wrapper').classList.add('hide');
  //   } else {
  //     this.contentRef.querySelector('.carbon-wrapper').classList.remove('hide');
  //   }
  // }
}
