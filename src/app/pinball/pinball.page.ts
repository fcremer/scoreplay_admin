import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Define the interface for a machine
interface Machine {
  opdb_id: string;
  is_machine: boolean;
  name: string;
  shortname: string | null;
  manufacture_date: string;
  manufacturer: {
    manufacturer_id: number;
    name: string;
    full_name: string;
    created_at: string;
    updated_at: string;
  };
  added: boolean; // This property tracks whether the machine has been added
}

@Component({
  selector: 'app-pinball',
  templateUrl: './pinball.page.html',
  styleUrls: ['./pinball.page.scss'],
})
export class PinballPage {
  searchTerm: string = '';
  searchResults: Machine[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  private searchApiUrl = 'https://opdb.org/api/search';
  private addApiUrl = 'https://liga.aixtraball.de/pinball';

  constructor(private http: HttpClient) {}

  onSearchChange(event: any) {
    const query = event.target.value;
    if (query && query.length > 1) {
      this.searchMachines(query).subscribe(
        (results) => {
          this.searchResults = results.map((machine: Machine) => ({ ...machine, added: false }));
        },
        (error) => {
          console.error('Error fetching search results:', error);
          this.searchResults = [];
        }
      );
    } else {
      this.searchResults = [];
    }
  }

  searchMachines(query: string): Observable<Machine[]> {
    const params = {
      q: query,
      include_groups: '0',
      include_aliases: '1',
      api_token: '7MBP4K2hlkYDA0irxS424zklbHVFPEU2VWxIxWuGWSuHdflIElgT7VPgjXFN'
    };

    return this.http.get<Machine[]>(this.searchApiUrl, { params }).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((data) => of(data)),
      catchError((error) => {
        console.error('Error during API call', error);
        return of([]); // Return an empty array on error
      })
    );
  }

  addMachine(machine: Machine) {
    const payload = {
      long_name: machine.name,
      abbreviation: machine.shortname || 'N/A',
      room: '1'
    };

    this.http.post(this.addApiUrl, payload).subscribe(
      () => {
        machine.added = true;
        this.successMessage = `Successfully added ${machine.name}.`;
        this.errorMessage = '';
      },
      (error) => {
        console.error('Failed to add machine:', error);
        this.errorMessage = `Failed to add ${machine.name}. Please try again later.`;
        this.successMessage = '';
      }
    );
  }
}