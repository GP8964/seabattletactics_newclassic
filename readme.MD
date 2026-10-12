# Sea Battle Tactics

An independent naval strategy game prototype, created as a tribute to the
Navy Blue game series developed by Use Corporation for Game Boy and Famicom.
The project uses its own name, code, and assets.

「海戦Tactics」 is a possible Japanese rendering of the title; the prototype
currently supports English and Japanese.

## Project layout

- `prototype/` — playable HTML, CSS, and JavaScript single-player prototype.
- `frontend/` — React Router and React frontend starter.
- `backend/` — Express API starter and OpenAPI definition.

## Current functionality

- The browser prototype supports manual fleet deployment, a 60-credit
  equipment budget, equipment attacks, and a basic random-attack AI.
- The prototype can be switched between English and Japanese, including
  existing combat-log entries and the current status message.
- The backend currently provides a health endpoint and Swagger UI at `/docs`.

The React frontend is still the framework starter; it is not yet connected to
the prototype or backend. The backend does not yet provide accounts, game
sessions, or persistent storage.

## Planned gameplay and services

- Unauthenticated players: single-player games against the introductory AI;
  games are not saved.
- Authenticated single-player: introductory, normal, and hard AI difficulties.
  Normal AI should use additional equipment within the 60-credit budget and
  consider surviving ships; hard AI should improve targeting after near misses
  and hits and use stronger equipment.
- Versus mode: room creation and joining, ready states for deployment and
  battle, followed by a randomized first attacker.
- Replay: store complete gameplay events for seven days and provide
  step-by-step online playback.
- Player score: a zero-sum result based on unhit ship cells (maximum 23 points
  for the winner, the corresponding negative score for the loser). Show only
  each player's own average over the previous seven days, with zero when there
  are no games in that period.
- SQLite initially, with daily cleanup of gameplay history older than seven
  days and a future option to support other database engines.

These planned features are not implemented yet. In particular, accounts and
authentication, game and room APIs, AI difficulty levels, battle persistence,
replay, score calculation, scheduled cleanup, and gameplay/database tests
remain to be built.

## Running the current project

Open `prototype/sbt_nc_prototype.html` in a browser to play the prototype.

For the backend, run `npm ci` in `backend/`, set any required environment
variables, then run `npm run dev`. The health check is available at `/health`;
the API documentation is available at `/docs`.

For the React frontend, run `npm ci` in `frontend/` followed by `npm run dev`.
It remains an unconnected starter application.

## Clean-room note

The project is an independent tribute. It does not reuse the original game's
animations or ship sprites and was not developed by reverse-engineering its
ROM.
