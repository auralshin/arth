import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-impermanent-loss',
  templateUrl: './impermanent-loss.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpermanentLossComponent extends BasePageComponent {}
