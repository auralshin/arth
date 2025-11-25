import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-style',
  templateUrl: './style.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleComponent extends BasePageComponent {}
