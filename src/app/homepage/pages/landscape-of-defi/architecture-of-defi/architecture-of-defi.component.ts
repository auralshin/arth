import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-architecture-of-defi',
  templateUrl: './architecture-of-defi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchitectureOfDefiComponent extends BasePageComponent {}
