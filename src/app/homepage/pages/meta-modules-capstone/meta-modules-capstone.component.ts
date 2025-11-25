import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-meta-modules-capstone',
  templateUrl: './meta-modules-capstone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaModulesCapstoneComponent extends BasePageComponent {}
