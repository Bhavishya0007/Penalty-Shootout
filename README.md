# Penalty Shootout

A browser-based penalty shootout game. Take 5 penalties against an adaptive AI goalkeeper — pick your spot in the goal, watch the keeper dive, and see if you score.

## How to play

- Click a zone in the goal (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right) to take your shot.
- The keeper dives based on your shot history — the more you favor a corner, the more it starts covering that side, especially in later rounds.
- Corner shots carry a small chance of flying wide, even if the keeper dives the wrong way.
- If the keeper dives to the exact zone you shot at, it's always a save.
- You get 5 attempts. Your final score and a verdict are shown at the end, with a **Play Again** button to restart.

## Running it locally

### Browser version

```bash
cd /Users/bhavishsingh/Documents/game
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Streamlit version

Embeds the same HTML/CSS/JS game inside a Streamlit page.

```bash
cd /Users/bhavishsingh/Documents/game
pip install -r requirements.txt   # only needed once
streamlit run streamlit_app.py
```

This opens automatically in your browser (usually `http://localhost:8501`).

### Unit tests

Tests cover the core game logic (keeper zone selection, shot resolution) using Node's built-in test runner — no dependencies required.

```bash
cd /Users/bhavishsingh/Documents/game
npm test
```

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Game markup (goal, keeper, ball, scoreboard) |
| `style.css` | Visual styling and animations |
| `gameLogic.js` | Pure game logic — keeper AI and shot resolution, shared by the browser game and covered by unit tests |
| `script.js` | DOM wiring — click handling, animations, game loop |
| `gameLogic.test.js` | Unit tests for `gameLogic.js` |
| `streamlit_app.py` | Streamlit entry point that embeds the browser game |
| `requirements.txt` | Python dependencies for the Streamlit version |
| `package.json` | Test script (`npm test`) |

## Design notes

- **Adaptive keeper**: the keeper's dive is weighted toward zones you've shot at before, with that weighting increasing each round — so attempt 5 reads your patterns more aggressively than attempt 1.
- **Post-miss risk**: corner shots have an ~8% chance of going wide regardless of the keeper's dive, adding risk to greedy corner placement.
- **Guaranteed save on exact reads**: if the keeper dives to the same zone you shot at, it's always saved — no partial luck on a clean read.
