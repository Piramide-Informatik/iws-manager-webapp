import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrameworkAgreementsSummaryComponent } from './components/framework-agreements-summary/framework-agreements-summary.component';

const routes: Routes = [
    {path: '', component: FrameworkAgreementsSummaryComponent},
    {path: 'framework-agreements-summary', component: FrameworkAgreementsSummaryComponent},
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FrameworkAgreementsRoutingModule {}