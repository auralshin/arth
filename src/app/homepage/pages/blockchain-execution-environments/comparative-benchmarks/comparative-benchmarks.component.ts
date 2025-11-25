import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-comparative-benchmarks',
  templateUrl: './comparative-benchmarks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparativeBenchmarksComponent extends BasePageComponent {}
