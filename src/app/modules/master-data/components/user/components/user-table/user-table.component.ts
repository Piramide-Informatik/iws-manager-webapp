import { Component } from '@angular/core';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
  standalone: false,
})
export class UserTableComponent {
  users = [
    { username: 'loschu', name: 'Schulte Lothar', active: true },
    { username: 'paze', name: 'Zessin Patrick', active: true },
    { username: 'mariah', name: 'Hernandez Maria', active: false },
    { username: 'jdoe', name: 'Doe John', active: true },
    { username: 'adamsa', name: 'Adams Sarah', active: true },
    { username: 'mgonzalez', name: 'Gonzalez Miguel', active: false },
    { username: 'klausw', name: 'Weber Klaus', active: true },
    { username: 'tanja', name: 'Müller Tanja', active: true },
    { username: 'bernardf', name: 'Fischer Bernard', active: false },
    { username: 'ljimenez', name: 'Jimenez Luis', active: true },
  ];

  cols = [
    { field: 'username', header: 'Benutzer' },
    { field: 'name', header: 'Name' },
    { field: 'active', header: 'Aktiv' },
  ];

  selectedColumns = [...this.cols];

  applyFilter(event: any, field: string) {
    const value = (event.target as HTMLInputElement).value;

    console.log(`Filtrar por ${field}: ${value}`);
  }

  editUser(user: any) {
    console.log('Editando usuario:', user);
  }

  deleteUser(username: string) {
    console.log('Eliminando usuario:', username);
  }

  createUser() {
    console.log('Creando nuevo usuario');
  }
}
