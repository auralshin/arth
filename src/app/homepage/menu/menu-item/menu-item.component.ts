import { Component, Input } from '@angular/core';
import { openCloseAnimation } from '../../../common';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [openCloseAnimation],
})
export class MenuItemComponent {
  @Input() isOpen = false;
  @Input() children?: Array<{
    title: string;
    path?: string;
    externalUrl?: string;
    icon?: string;
    isNew?: boolean;
    isPending?: boolean;
    children?: any[];
    isOpened?: boolean;
    defaultOpen?: boolean;
  }>;
  @Input() path?: string;
  @Input() title: string;
  @Input() icon?: string;
  @Input() externalUrl?: string;
  @Input() isNew?: boolean;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
