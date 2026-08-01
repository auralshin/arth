import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-feynman-kac',
  templateUrl: './feynman-kac.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeynmanKacComponent extends BasePageComponent {}
