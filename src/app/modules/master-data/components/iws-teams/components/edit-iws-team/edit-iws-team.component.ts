import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-iws-team',
  standalone: false,
  templateUrl: './edit-iws-team.component.html',
  styleUrl: './edit-iws-team.component.scss',
})
export class EditIwsTeamComponent implements OnInit {
  teamForm!: FormGroup;

  leaders = [
    { id: 1, fullName: 'Patrick Zessin' },
    { id: 2, fullName: 'Philipp Glockner' },
    { id: 3, fullName: 'Helga Zacherle' },
  ];

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.teamForm = this.fb.group({
      teamName: [''],
      teamLeader: [null],
    });
  }

  saveTeam(): void {
    console.log('Saving Team:', this.teamForm.value);
  }

  cancelEdit(): void {
    console.log('Cancel editing team');
    this.teamForm.reset();
  }
}
