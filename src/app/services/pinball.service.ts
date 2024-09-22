import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, Subject } from 'rxjs';
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
  guest?: boolean; // Optional guest attribute
}

@Injectable({
  providedIn: 'root',
})
export class PinballService {
  private baseUrl = 'https://backend.aixplay.aixtraball.de';
  private dataReloadSubject = new Subject<void>(); // Subject to notify components of data reload

  constructor(private http: HttpClient) {}

  // Existing methods with proper typings

  getPinballMachines(tournamentName?: string): Observable<PinballMachine[]> {
    const url = tournamentName
      ? `${this.baseUrl}/pinball?tournament_name=${tournamentName}`
      : `${this.baseUrl}/pinball`;
    return this.http.get<PinballMachine[]>(url);
  }

  getScoresForPinball(
    abbreviation: string,
    filter: string,
    tournamentName?: string
  ): Observable<Score[]> {
    const url = tournamentName
      ? `${this.baseUrl}/scores/pinball/${abbreviation}?tournament_name=${tournamentName}`
      : `${this.baseUrl}/scores/pinball/${abbreviation}`;
    return this.http.get<Score[]>(url).pipe(
      map((scores: Score[]) => {
        if (filter === 'latest') {
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const todayStr = today.toISOString().split('T')[0];
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          return scores.filter(
            (score: Score) =>
              score.date === todayStr || score.date === yesterdayStr
          );
        } else {
          return scores; // Return all scores
        }
      })
    );
  }

  getAllScores(
    filter: string,
    tournamentName?: string
  ): Observable<{ [key: string]: Score[] }> {
    return this.getPinballMachines(tournamentName).pipe(
      switchMap((machines: PinballMachine[]) => {
        const scoreObservables = machines.map((machine: PinballMachine) =>
          this.getScoresForPinball(
            machine.abbreviation,
            filter,
            tournamentName
          ).pipe(
            map((scores: Score[]) => ({
              [machine.abbreviation]: scores,
            }))
          )
        );
        return forkJoin(scoreObservables).pipe(
          map((scoresArray: { [key: string]: Score[] }[]) =>
            scoresArray.reduce(
              (acc: { [key: string]: Score[] }, curr: { [key: string]: Score[] }) => ({
                ...acc,
                ...curr,
              }),
              {}
            )
          )
        );
      })
    );
  }

  getPlayers(tournamentName?: string): Observable<Player[]> {
    const url = tournamentName
      ? `${this.baseUrl}/players?tournament_name=${tournamentName}`
      : `${this.baseUrl}/players`;
    return this.http.get<Player[]>(url);
  }

  deletePlayer(abbreviation: string, tournamentName?: string): Observable<any> {
    const url = tournamentName
      ? `${this.baseUrl}/player/${abbreviation}?tournament_name=${tournamentName}`
      : `${this.baseUrl}/player/${abbreviation}`;
    return this.http.delete(url);
  }

  deleteScore(
    pinballAbbreviation: string,
    playerAbbreviation: string,
    scoreValue: number,
    tournamentName?: string
  ): Observable<any> {
    const url = tournamentName
      ? `${this.baseUrl}/delete_score/${pinballAbbreviation}/${playerAbbreviation}/${scoreValue}?tournament_name=${tournamentName}`
      : `${this.baseUrl}/delete_score/${pinballAbbreviation}/${playerAbbreviation}/${scoreValue}`;
    return this.http.delete(url);
  }

  addPlayer(
    name: string,
    abbreviation: string,
    guest: boolean = false,
    tournamentName?: string
  ): Observable<any> {
    const url = tournamentName
      ? `${this.baseUrl}/player?tournament_name=${tournamentName}`
      : `${this.baseUrl}/player`;
    const body = { name, abbreviation, guest };
    return this.http.post(url, body);
  }

  toggleGuestStatus(
    playerAbbreviation: string,
    tournamentName?: string
  ): Observable<any> {
    const url = tournamentName
      ? `${this.baseUrl}/player/${playerAbbreviation}/toggle_guest_status?tournament_name=${tournamentName}`
      : `${this.baseUrl}/player/${playerAbbreviation}/toggle_guest_status`;
    return this.http.put(url, {});
  }

  // New methods for tournaments

  getActiveTournament(): Observable<{ active_tournament_name: string }> {
    return this.http.get<{ active_tournament_name: string }>(
      `${this.baseUrl}/get_active_tournament`
    );
  }

  setActiveTournament(tournamentName: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/set_active_tournament/${tournamentName}`,
      {}
    );
  }

  getTournaments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/tournaments`);
  }

  createTournament(
    name: string,
    templateTournamentName?: string
  ): Observable<{ message: string }> {
    const body = templateTournamentName
      ? { name, template_tournament_name: templateTournamentName }
      : { name };
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/tournaments`,
      body
    );
  }

  // Method to notify components to reload data
  triggerDataReload(): void {
    this.dataReloadSubject.next();
  }

  // Observable for components to subscribe to
  getDataReloadObservable(): Observable<void> {
    return this.dataReloadSubject.asObservable();
  }
}