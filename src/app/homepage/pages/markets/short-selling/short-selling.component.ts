import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-short-selling',
  templateUrl: './short-selling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortSellingComponent extends BasePageComponent {}
