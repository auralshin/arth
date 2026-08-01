import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-pca',
  templateUrl: './pca.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PcaComponent extends BasePageComponent {}
