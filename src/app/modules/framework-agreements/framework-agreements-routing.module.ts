import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrameworkAgreementsSummaryComponent } from './components/framework-agreements-summary/framework-agreements-summary.component';
import { FrameworkAgreementsDetailsComponent } from './components/framework-agreement-details/framework-agreement-details.component';

const routes: Routes = [
    {path: '', component: FrameworkAgreementsSummaryComponent},
    {path: 'framework-agreements-summary', component: FrameworkAgreementsSummaryComponent},
    {path: '', component: FrameworkAgreementsDetailsComponent},
    { path: 'framework-agreement-details', component: FrameworkAgreementsDetailsComponent },
    { path: 'framework-agreement-details/:idContract', component: FrameworkAgreementsDetailsComponent },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FrameworkAgreementsRoutingModule {}