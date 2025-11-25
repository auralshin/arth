import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-what-is-signal',
  templateUrl: './what-is-signal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatIsSignalComponent extends BasePageComponent {}
