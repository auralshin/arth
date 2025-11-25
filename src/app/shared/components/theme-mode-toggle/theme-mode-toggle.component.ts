import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
} from '@angular/core';
import { StorageService } from '../../services/storage.service';

type Theme =
  | 'light'
  | 'dark'
  | 'sunset'
  | 'ocean'
  | 'light-contrast'
  | 'dark-contrast'
  | 'neon';

interface ThemeOption {
  id: Theme;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-theme-mode-toggle',
  templateUrl: './theme-mode-toggle.component.html',
  styleUrls: ['./theme-mode-toggle.component.scss'],
})
export class ThemeModeToggleComponent implements OnInit {
  readonly themes: ThemeOption[] = [
    { id: 'light', label: 'Daybreak', icon: 'light_mode' },
    { id: 'dark', label: 'Midnight', icon: 'dark_mode' },
    { id: 'sunset', label: 'Sunset', icon: 'auto_awesome' },
    { id: 'ocean', label: 'Oceanic', icon: 'waves' },
    { id: 'light-contrast', label: 'High Light', icon: 'hdr_weak' },
    { id: 'dark-contrast', label: 'High Dark', icon: 'hdr_strong' },
    { id: 'neon', label: 'Neon Pulse', icon: 'bolt' },
  ];
  theme: Theme;
  menuOpen = false;
  constructor(
    @Inject(DOCUMENT)
    private readonly document: Document,
    private readonly mediaMatcher: MediaMatcher,
    private readonly storageService: StorageService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {}

  ngOnInit() {
    const darkSchemeMatcher = this.mediaMatcher.matchMedia(
      '(prefers-color-scheme: dark)',
    );

    darkSchemeMatcher.onchange = ({ matches }) => {
      if (!this.getStoredTheme()) this.setTheme(matches ? 'dark' : 'light');
    };

    const preferredScheme = darkSchemeMatcher.matches ? 'dark' : 'light';
    const storedTheme = this.getStoredTheme();

    this.setTheme(storedTheme ?? preferredScheme);
  }

  get currentTheme(): ThemeOption {
    return this.themes.find((theme) => theme.id === this.theme) ?? this.themes[0];
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  private selectTheme(theme: Theme) {
    this.storageService.set('theme', theme);
    this.setTheme(theme);
    this.menuOpen = false;
  }

  onOptionKeydown(event: KeyboardEvent, theme: Theme) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectTheme(theme);
    } else if (event.key === 'Tab') {
      this.menuOpen = false;
    }
  }

  private getStoredTheme() {
    return this.storageService.get('theme') as Theme | null;
  }

  private setTheme(theme: Theme) {
    this.theme = theme;
    this.document.documentElement.setAttribute('mode', theme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<Theme>('arth-theme-change', { detail: theme }),
      );
    }
    this.changeDetector.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (
      this.menuOpen &&
      !this.elementRef.nativeElement.contains(event.target as Node)
    ) {
      this.menuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.menuOpen = false;
  }

  onTriggerClick(event: MouseEvent) {
    event.stopPropagation();
    this.toggleMenu();
  }

  onOptionSelect(event: MouseEvent, theme: Theme) {
    event.stopPropagation();
    this.selectTheme(theme);
  }
}
