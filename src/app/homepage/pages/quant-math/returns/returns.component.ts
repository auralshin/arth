import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-returns',
  templateUrl: './returns.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnsComponent extends BasePageComponent {}
