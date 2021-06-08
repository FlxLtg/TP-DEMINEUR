
/**
 * Descriptions: Class Cell
 * Input: {
 *  i: Int | position x,
 *  j: Int | position y,
 *  w: Int | taille de la cellule
 * }
 * Output: {}
 */
function Cell(i, j, w) {
  // Constructor de Cell
  this.i = i;
  this.j = j;
  this.x = i * w;
  this.y = j * w;
  this.w = w;
  this.neighborCount = 0;
  this.flagged = false;
  this.mine = false;
  this.revealed = false;
}

/**
 * Descriptions: methode qui gére l'affichage de la cellule
 * Input: {
 *  ctx: CanvasRenderingContext2D | context de l'element canvas
 *  cells: Array | tableau de cellule
 * }
 * Output: {}
 */
Cell.prototype.show = function (ctx, cells) {
  if (this.revealed) {
    if (this.mine) {
      this.showMine(ctx);
    } else {
      this.showRevealed(ctx, cells);
    }
  } else {
    this.showHidden(ctx);
  }
};

/**
 * Descriptions: Dessine la mine 
 * Input: {
 *  ctx: CanvasRenderingContext2D | context de l'element canvas
 * }
 * Output: {}
 */
Cell.prototype.showMine = function (ctx) {
  // ctx.strokeStyle = "rgba(0,0,0,0)";
  ctx.lineWidth = 1;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  // Square
  ctx.fillStyle = "white";
  ctx.fillRect(this.x, this.y, this.w, this.w);

  // Circle;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(
    this.x + this.w / 2,
    this.y + this.w / 2,
    this.w / 3,
    0,
    2 * Math.PI,
    false
  );
  ctx.fill();
};

/**
 * Descriptions: Dessine une cellule découverte
 * Input: {
 *  ctx: CanvasRenderingContext2D | context de l'element canvas
 *  cells: Array | tableau de cellule
 * }
 * Output: {}
 */
Cell.prototype.showRevealed = function (ctx, cells) {
  ctx.strokeStyle = "rgba(0,0,0,0)";
  ctx.lineWidth = 1;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  // Square;
  ctx.fillStyle = "white";
  ctx.fillRect(this.x, this.y, this.w, this.w);
  ctx.strokeRect(this.x, this.y, this.w, this.w);

  const neighbors = this.getNeighbors(cells);

  if (this.neighborCount == 0) {
    for (const cell of neighbors) {
      this.neighborCount += cell.mine ? 1 : 0;
    }
  }

  // If neighborCount is still at 0
  if (this.neighborCount == 0) {
    for (const cell of neighbors) {
      if (!cell.revealed) {
        cell.revealed = true;
        cell.show(ctx, cells);
      }
      this.neighborCount += cell.mine ? 1 : 0;
    }
  } else {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(
      this.neighborCount || "",
      this.x + this.w / 2,
      this.y + this.w / 1.5
    );
  }
};

/**
 * Descriptions: Desside une cellule caché
 * Input: {
 *  ctx: CanvasRenderingContext2D | context de l'element canvas
 * } 
 * Output: {}
 */
Cell.prototype.showHidden = function (ctx) {
  const fifth = this.w / 5;

  ctx.strokeStyle = "rgba(0,0,0,0)";
  ctx.lineWidth = 1;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  // Top shape;
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x + this.w, this.y);
  ctx.lineTo(this.x + this.w - fifth, this.y + fifth);
  ctx.lineTo(this.x + fifth, this.y + fifth);
  ctx.lineTo(this.x, this.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(244,244,244,1)";
  ctx.fill();

  // Bottom shape;
  ctx.beginPath();
  ctx.moveTo(this.x, this.y + this.w);
  ctx.lineTo(this.x + this.w, this.y + this.w);
  ctx.lineTo(this.x + this.w - fifth, this.y + this.w - fifth);
  ctx.lineTo(this.x + fifth, this.y + this.w - fifth);
  ctx.lineTo(this.x, this.y + this.w);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(181,181,181,1)";
  ctx.fill();

  // Left shape;
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x, this.y + this.w);
  ctx.lineTo(this.x + fifth, this.y + this.w - fifth);
  ctx.lineTo(this.x + fifth, this.y + fifth);
  ctx.lineTo(this.x, this.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(187,187,187,1)";
  ctx.fill();

  // Right shape;
  ctx.beginPath();
  ctx.moveTo(this.x + this.w, this.y);
  ctx.lineTo(this.x + this.w, this.y + this.w);
  ctx.lineTo(this.x + this.w - fifth, this.y + this.w - fifth);
  ctx.lineTo(this.x + this.w - fifth, this.y + fifth);
  ctx.lineTo(this.x + this.w, this.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(230,230,230,1)";
  ctx.fill();

  // Square;
  ctx.fillStyle = "rgba(235,235,235,1)";
  ctx.fillRect(
    this.x + fifth,
    this.y + fifth,
    this.w - fifth * 2,
    this.w - fifth * 2
  );

  if (this.flagged) {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(this.x + this.w / 2, this.y + this.w - fifth);
    ctx.lineTo(this.x + this.w / 2, this.y + fifth);
    ctx.lineTo(this.x + fifth, this.y + fifth * 1.8);
    ctx.lineTo(this.x + this.w / 2, this.y + this.w / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fill();
  }
};

/**
 * Descriptions: Récupére les voisin de la cellule
 * Input: {
 *  cells: Array | Tableau de cellule
 * } 
 * Output: {
 *  neighbors: Array | Tableau de l'oject Cell
 * }
 */
Cell.prototype.getNeighbors = function (cells) {
  const neighbors = [];

  for (let j = this.j - 1; j <= this.j + 1; j++) {
    for (let i = this.i - 1; i <= this.i + 1; i++) {
      if (
        j >= 0 &&
        j <= cells.length - 1 &&
        i >= 0 &&
        i <= cells[j].length - 1 &&
        (j != this.j || i != this.i)
      ) {
        neighbors.push(cells[j][i]);
      }
    }
  }

  return neighbors;
};
