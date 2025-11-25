import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-amms-101',
  templateUrl: './amms-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Amms101Component extends BasePageComponent {}
