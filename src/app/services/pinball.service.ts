import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface PinballMachine {
  abbreviation: string;
  long_name: string;
  room: string;
}

export interface Score {
  date: string;
  pinball_abbreviation: string;
  player_abbreviation: string;
  points: number;
}

export interface Player {
  abbreviation: string;
  name: string;
  guest?: boolean;  // Add the optional guest attribute

}

@Injectable({
  providedIn: 'root',
})
export class PinballService {
  private baseUrl = 'https://backend.aixplay.aixtraball.de';

  constructor(private http: HttpClient) {}

  getPinballMachines(): Observable<PinballMachine[]> {
    return this.http.get<PinballMachine[]>(`${this.baseUrl}/pinball`);
  }

  getScoresForPinball(abbreviation: string): Observable<Score[]> {
    return this.http.get<Score[]>(`${this.baseUrl}/scores/pinball/${abbreviation}`).pipe(
      map((scores) =>
        scores.filter((score) => {
          const today = new Date().toISOString().split('T')[0];
          return score.date === today;
        })
      )
    );
  }

  getAllScoresForToday(): Observable<{ [key: string]: Score[] }> {
    return this.getPinballMachines().pipe(
      switchMap((machines) => {
        const scoreObservables = machines.map((machine) =>
          this.getScoresForPinball(machine.abbreviation).pipe(
            map((scores) => ({ [machine.abbreviation]: scores }))
          )
        );
        return forkJoin(scoreObservables).pipe(
          map((scoresArray) =>
            scoresArray.reduce((acc, curr) => ({ ...acc, ...curr }), {})
          )
        );
      })
    );
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/players`);
  }

  deletePlayer(abbreviation: string): Observable<any> {
    const url = `${this.baseUrl}/player/${abbreviation}`;
    return this.http.delete(url);
  }

  deleteScore(pinballAbbreviation: string, playerAbbreviation: string, scoreValue: number): Observable<any> {
    const url = `${this.baseUrl}/delete_score/${pinballAbbreviation}/${playerAbbreviation}/${scoreValue}`;
    return this.http.delete(url);
  }

  addPlayer(name: string, abbreviation: string, guest: boolean = false): Observable<any> {
    const url = `${this.baseUrl}/player`;
    const body = { name, abbreviation, guest };
    return this.http.post(url, body);
  }
}