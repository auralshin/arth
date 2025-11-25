import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-delta-neutral',
  templateUrl: './delta-neutral.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeltaNeutralComponent extends BasePageComponent {}
