import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-what-is-defi',
  templateUrl: './what-is-defi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatIsDefiComponent extends BasePageComponent {}
