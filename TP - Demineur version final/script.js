const canvas = document.getElementById("board");
const lvlSelector = document.getElementById("lvl-selector");

const ctx = canvas.getContext("2d");

const scale = 40;
const gameMode = {
  easy: {
    size: {
      x: 9,
      y: 9,
    },
    mine: 10,
  },
  medium: {
    size: {
      x: 16,
      y: 16,
    },
    mine: 40,
  },
  hard: {
    size: {
      x: 30,
      y: 16,
    },
    mine: 99,
  },
};
let selectedMode = gameMode[lvlSelector.value];
let cells;
let firstClickFlag = false;

/**
 * Descriptions: Setup les différent paramétre du jeux
 * Input: {}
 * Output: {}
 */
function setup() {
  // Initialise la taille de la grille qui correspond au mode de difficulté choisi
  canvas.width = selectedMode.size.x * scale;
  canvas.height = selectedMode.size.y * scale;

  // Créer un tableau de tableau qui correspond au mode de difficulté choisi
  // ex: [[null,null,null],[null,null,null],[null,null,null]
  cells = Array.from({ length: selectedMode.size.y }, (e) =>
    Array(selectedMode.size.x)
  );

  // Remplie le tableau d'objet Cellule
  for (let y = 0; y < selectedMode.size.y; y++) {
    for (let x = 0; x < selectedMode.size.x; x++) {
      cells[y][x] = new Cell(x, y, scale);
    }
  }

  render();
}


/**
 * Description: Remplie le tableau de cellule avec le nombre de bombe qui correspond au mode de difficulté selectionné
 * Input: {
 *  cells: Array | Tableau de cellule qui correspond au mode de difficulté choisi,
 *  x: Int,
 *  y: Int
 * }
 * Output: {}
 */
function generateMines(cells, x, y) {
  // Utilisation de la method getNeighbors de l'objet Cell pour obtenir ses voisin
  const neighbors = cells[y][x].getNeighbors(cells);

  // Boucle le nombre de bombe du mode de difficulté selectionné 
  for (let i = 0; i < selectedMode.mine; i++) {
    let mine;
    do {
      mine = {
        x: Math.floor(Math.random() * selectedMode.size.x),
        y: Math.floor(Math.random() * selectedMode.size.y),
      };
    } while (
      // Vérification que cell est pas déjà une mine
      cells[mine.y][mine.x].mine ||
      neighbors.filter(
        (neighbor) => neighbor.i == mine.x && neighbor.j == mine.y
      ).length > 0 ||
      (x == mine.x && y == mine.y)
    );
    cells[mine.y][mine.x].mine = true;
  }
}

/**
 * Description: Convertie la position de la souris
 * Input: {
 *  mouseEvent: Evenement de souris
 * }
 * Output: {
 *  pos: Position qui correspond au coordonnée des cellules de la grille [700,500]->[17,12]
 * }
 */
function getRelativeMousePos(mouseEvent) {
  return {
    x: Math.floor(mouseEvent.offsetX / scale),
    y: Math.floor(mouseEvent.offsetY / scale),
  };
}

/**
 * Description: Convertie la position de la souris
 * Input: {
 *  mouseEvent: Evenement de souris
 * }
 * Output: {
 *  pos: Position qui correspond au coordonnée réél arrondi [17,12]->[680,480]
 * }
 */
function getScaledMousePos(mouseEvent) {
  const { x, y } = getRelativeMousePos(mouseEvent);
  return {
    x: x * scale,
    y: y * scale,
  };
}

/**
 * Descriptions: Verifie si le joueur a gagné
 * Input: {}
 * Output: {
 *  victory: true/false
 * }
 */
function checkVictory() {
  const allCells = [].concat(...cells);

  // check si toute les cellule qui son des bombe sont marqué d'un drapeau et si les cellule qui ne sont pas des bombe sont bien découve
  if (
    allCells.filter((cell) => cell.mine && cell.flagged).length ==
      selectedMode.mine &&
    allCells.filter((cell) => !cell.mine && !cell.revealed).length == 0
  ) {
    window.alert("Vous avez gagné ! :)");
    firstClickFlag = false;
    setup();
    return true;
  }
  return false;
}

/**
 * Descriptions: Affiche le jeu
 * Input: {}
 * Output: {}
 */
function render() {
  for (let y = 0; y < selectedMode.size.y; y++) {
    for (let x = 0; x < selectedMode.size.x; x++) {
      cells[y][x].show(ctx, cells);
    }
  }
}

/**
 * Descriptions: Affiche la zone de la cellule (le carré bleu)
 * Input: {}
 * Output: {}
 */
canvas.addEventListener("mousemove", (e) => {
  const { x, y } = getScaledMousePos(e);
  render();

  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, scale, scale);

  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - scale, y - scale, scale * 3, scale * 3);
});

/**
 * Descriptions: Decouvre une cellule
 * Input: {}
 * Output: {}
 */
canvas.addEventListener("click", (e) => {
  const { x, y } = getRelativeMousePos(e);

  if (!firstClickFlag) {
    firstClickFlag = true;
    generateMines(cells, x, y);
  }

  if (!cells[y][x].flagged) {
    cells[y][x].revealed = true;
    if (cells[y][x].mine) {
      window.alert("Vous avez perdu ! :(");
      firstClickFlag = false;
      setup();
      return;
    }
  }
  render();
  checkVictory();
});

/**
 * Descriptions: Place un drapeau sur une cellule
 * Input: {}
 * Output: {}
 */
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const { x, y } = getRelativeMousePos(e);

  if (!cells[y][x].revealed) {
    cells[y][x].flagged = !cells[y][x].flagged;
    render();
    checkVictory();
  }
});

/**
 * Descriptions: Change le mode de difficulté et relance le setup du jeu
 * Input: {}
 * Output: {}
 */
lvlSelector.addEventListener("change", (e) => {
  e.preventDefault();
  firstClickFlag = false;
  selectedMode =
    gameMode[e.currentTarget.options[e.currentTarget.selectedIndex].value];
  setup();
});

setup();
