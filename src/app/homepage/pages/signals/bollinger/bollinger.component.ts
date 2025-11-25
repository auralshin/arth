import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-bollinger',
  templateUrl: './bollinger.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BollingerComponent extends BasePageComponent {}
