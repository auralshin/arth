import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-solana-svm',
  templateUrl: './solana-svm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolanaSvmComponent extends BasePageComponent {}
