import { Component, Input, OnInit } from '@angular/core';
import { openCloseAnimation } from '../../../common';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [openCloseAnimation],
})
export class MenuItemComponent implements OnInit {
  @Input() isOpen = false;
  @Input() children?: {
    title: string;
    path?: string;
    externalUrl?: string;
    icon?: string;
    isNew?: boolean;
    isPending?: boolean;
    children?: any[];
    isOpened?: boolean;
    defaultOpen?: boolean;
  }[];
  @Input() path?: string;
  @Input() title: string;
  @Input() icon?: string;
  @Input() externalUrl?: string;
  @Input() isNew?: boolean;

  ngOnInit() {
    console.log('MenuItemComponent init:', {
      title: this.title,
      hasChildren: !!this.children,
      childrenLength: this.children?.length,
      path: this.path,
      externalUrl: this.externalUrl
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
