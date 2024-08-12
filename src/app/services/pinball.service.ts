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
  id: string; // Assuming each score has a unique identifier for UI, not used in deletion
  date: string;
  pinball_abbreviation: string;
  player_abbreviation: string;
  points: number;
}

@Injectable({
  providedIn: 'root',
})
export class PinballService {
  private baseUrl = 'https://liga.aixtraball.de';

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

  deleteScore(pinballAbbreviation: string, playerAbbreviation: string, scoreValue: number): Observable<any> {
    const url = `${this.baseUrl}/delete_score/${pinballAbbreviation}/${playerAbbreviation}/${scoreValue}`;
    return this.http.delete(url);
  }
}