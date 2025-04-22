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
  ];

  cols = [
    { field: 'username', header: 'Benutzer' },
    { field: 'name', header: 'Name' },
    { field: 'active', header: 'Aktiv' },
  ];

  selectedColumns = [...this.cols];

  applyFilter(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase();

    console.log(`Filtrando por "${field}": ${value}`);
  }

  editUser(user: any) {
    console.log('Editando usuario:', user);
  }

  deleteUser(username: string) {
    this.users = this.users.filter((user) => user.username !== username);
    console.log('Usuario eliminado:', username);
  }

  createUser() {
    console.log('Creando nuevo usuario');
  }
}
