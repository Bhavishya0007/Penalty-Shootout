(function () {
  const { ALL_ZONES, resolveShot } = window.PenaltyGameLogic;

  const TOTAL_ATTEMPTS = 5;

  const BALL_TARGET = {
    "top-left": { left: "18%", bottom: "82%" },
    "top-center": { left: "50%", bottom: "86%" },
    "top-right": { left: "82%", bottom: "82%" },
    "bottom-left": { left: "18%", bottom: "14%" },
    "bottom-center": { left: "50%", bottom: "14%" },
    "bottom-right": { left: "82%", bottom: "14%" },
  };

  const POST_MISS_TARGET = {
    "top-left": { left: "-8%", bottom: "84%" },
    "top-right": { left: "108%", bottom: "84%" },
    "bottom-left": { left: "-8%", bottom: "14%" },
    "bottom-right": { left: "108%", bottom: "14%" },
  };

  const KEEPER_TARGET = {
    "top-left": { left: "18%", bottom: "58%" },
    "top-center": { left: "50%", bottom: "62%" },
    "top-right": { left: "82%", bottom: "58%" },
    "bottom-left": { left: "18%", bottom: "2%" },
    "bottom-center": { left: "50%", bottom: "2%" },
    "bottom-right": { left: "82%", bottom: "2%" },
  };

  const KEEPER_REST = { left: "50%", bottom: "0%" };
  const BALL_REST = { left: "50%", bottom: "4px" };

  const zoneButtons = Array.from(document.querySelectorAll(".zone"));
  const keeperEl = document.getElementById("keeper");
  const ballEl = document.getElementById("ball");
  const messageEl = document.getElementById("message");
  const attemptCountEl = document.getElementById("attempt-count");
  const scoreCountEl = document.getElementById("score-count");
  const hintEl = document.getElementById("hint");
  const restartBtn = document.getElementById("restart-btn");

  let attempt = 1;
  let score = 0;
  let busy = false;
  let shotHistory = {};

  function resetState() {
    attempt = 1;
    score = 0;
    busy = false;
    shotHistory = {};
    ALL_ZONES.forEach((z) => (shotHistory[z] = 0));
    attemptCountEl.textContent = attempt;
    scoreCountEl.textContent = score;
    hintEl.textContent = "Click a spot in the goal to take your shot.";
    hintEl.hidden = false;
    restartBtn.hidden = true;
    setZonesEnabled(true);
    positionKeeper(KEEPER_REST, false);
    resetBall();
    hideMessage();
  }

  function setZonesEnabled(enabled) {
    zoneButtons.forEach((btn) => (btn.disabled = !enabled));
  }

  function positionKeeper(target) {
    keeperEl.style.left = target.left;
    keeperEl.style.bottom = target.bottom;
  }

  function resetBall() {
    ballEl.style.transition = "none";
    ballEl.classList.remove("flying");
    ballEl.style.left = BALL_REST.left;
    ballEl.style.bottom = BALL_REST.bottom;
    ballEl.style.opacity = "0";
    // force reflow so the next transition re-enables cleanly
    void ballEl.offsetHeight;
    ballEl.style.transition = "";
  }

  function hideMessage() {
    messageEl.className = "message";
    messageEl.textContent = "";
  }

  function showMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = `message show ${kind}`;
  }

  function takeShot(shotZone) {
    if (busy) return;
    busy = true;
    setZonesEnabled(false);
    hideMessage();

    shotHistory[shotZone]++;

    const { result, keeperZone } = resolveShot(shotZone, attempt, shotHistory);

    // Keeper dives (or stays put if the shot flies wide).
    positionKeeper(keeperZone ? KEEPER_TARGET[keeperZone] : KEEPER_REST);

    // Kick off the ball.
    resetBall();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = result === "post" ? POST_MISS_TARGET[shotZone] : BALL_TARGET[shotZone];
        ballEl.classList.add("flying");
        ballEl.style.opacity = "1";
        ballEl.style.left = target.left;
        ballEl.style.bottom = target.bottom;
      });
    });

    setTimeout(() => {
      if (result === "goal") {
        score++;
        scoreCountEl.textContent = score;
        showMessage("GOAL!", "goal");
      } else if (result === "saved") {
        showMessage("SAVED!", "saved");
      } else {
        showMessage("OFF TARGET!", "post");
      }

      setTimeout(() => {
        if (attempt >= TOTAL_ATTEMPTS) {
          finishGame();
        } else {
          attempt++;
          attemptCountEl.textContent = attempt;
          positionKeeper(KEEPER_REST);
          resetBall();
          hideMessage();
          setZonesEnabled(true);
          busy = false;
        }
      }, 1100);
    }, 480);
  }

  function finishGame() {
    let verdict;
    if (score === TOTAL_ATTEMPTS) verdict = "Perfect! Golden Boot!";
    else if (score >= TOTAL_ATTEMPTS - 1) verdict = "Brilliant shootout!";
    else if (score >= TOTAL_ATTEMPTS / 2) verdict = "Solid nerve under pressure.";
    else verdict = "Tough night at the spot.";

    hintEl.textContent = `Final score: ${score}/${TOTAL_ATTEMPTS} — ${verdict}`;
    restartBtn.hidden = false;
    setZonesEnabled(false);
    busy = true;
  }

  zoneButtons.forEach((btn) => {
    btn.addEventListener("click", () => takeShot(btn.dataset.zone));
  });

  restartBtn.addEventListener("click", resetState);

  resetState();
})();
