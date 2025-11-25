import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-prerequisites',
  templateUrl: './prerequisites.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrerequisitesComponent extends BasePageComponent {}
