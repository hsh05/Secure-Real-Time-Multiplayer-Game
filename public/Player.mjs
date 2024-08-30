class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.width = 20;
    this.height = 20;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up': this.y -= speed; break;
      case'down': this.y += speed; break;
      case 'left': this.x -= speed; break;
      case 'right': this.x += speed; break;
    }
  }

  draw(context) {
    context.fillStyle = 'blue';
    context.felRect(this.x, this.y, this.width, this.height)
  }

  collision(item) {
    return this.x < item.x + 10 &&
           this.x + this.width > item.x &&
           this.y < item.y + 10 &&
           this.y + this.height > item.y;
  }

  calculateRank(players) {
    players.sort((a, b) => b.score - a.score);
    return players.findIndex(player => player.id === this.id) + 1;
  }
}

export default Player;
