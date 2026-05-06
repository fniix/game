class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  preload() {
    // Listen for missing assets and generate fallback textures so the game remains playable.
    this.load.on('loaderror', (file) => {
      if (file.type === 'image') {
        this.createPlaceholderTexture(file.key);
      }
    });

    // Load placeholder assets by path.
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('coin', 'assets/coin.png');

    this.load.audio('music', 'assets/music.wav');
    this.load.audio('jump', 'assets/jump.wav');
    this.load.audio('doubleJump', 'assets/double_jump.wav');
    this.load.audio('coinSound', 'assets/coin.wav');
    this.load.audio('gameover', 'assets/gameover.wav');
  }

  create() {
    this.add.image(450, 270, 'background').setDisplaySize(900, 540);

    this.add.rectangle(450, 270, 820, 460, 0x08172c, 0.82);
    this.add.text(450, 120, 'Coin Dash', {
      fontFamily: 'Segoe UI',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#ffdd59',
      stroke: '#ffffff',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(450, 205, 'Run, jump, and collect as many coins as you can!', {
      fontFamily: 'Segoe UI',
      fontSize: '22px',
      color: '#eef2ff',
      align: 'center',
      wordWrap: { width: 760 },
    }).setOrigin(0.5);

    this.createButton(450, 320, 'Play Game', () => {
      this.scene.start('GameScene');
    });

    this.muteButtonText = this.createButton(450, 392, this.sound.mute ? 'Unmute Sound' : 'Mute Sound', () => {
      this.sound.mute = !this.sound.mute;
      this.muteButtonText.setText(this.sound.mute ? 'Unmute Sound' : 'Mute Sound');
    });

    this.add.text(450, 470, 'Arrow keys move • Space jumps • 60 seconds to collect coins', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#b9c4ea',
      align: 'center',
      wordWrap: { width: 760 },
    }).setOrigin(0.5);
  }

  createButton(x, y, label, callback) {
    const button = this.add.rectangle(x, y, 320, 64, 0x4477d3, 1).setStrokeStyle(3, 0xffffff).setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setFillStyle(0x5b8af7));
    button.on('pointerout', () => button.setFillStyle(0x4477d3));
    button.on('pointerdown', callback);
    const labelText = this.add.text(x, y, label, {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    return labelText;
  }

  createPlaceholderTexture(key) {
    if (this.textures.exists(key)) {
      return;
    }

    const width = key === 'player' ? 100 : key === 'coin' ? 44 : 900;
    const height = key === 'background' ? 540 : key === 'player' ? 130 : key === 'coin' ? 44 : 540;
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    if (key === 'background') {
      graphics.fillStyle(0x0f2e6a, 1);
      graphics.fillRect(0, 0, width, height);
      graphics.fillStyle(0xffffff, 0.08);
      for (let i = 0; i < 16; i++) {
        graphics.fillRect(i * 60, 0, 16, height);
      }
    } else if (key === 'coin') {
      graphics.fillStyle(0xffd54f, 1);
      graphics.fillCircle(width / 2, height / 2, width / 2);
      graphics.lineStyle(4, 0xffffff, 1);
      graphics.strokeCircle(width / 2, height / 2, width / 2 - 6);
    } else if (key === 'player') {
      // Draw a stylized character with hair, face, eyes, and sweat drop details.
      graphics.fillStyle(0xf8d68b, 1);
      graphics.fillRoundedRect(8, 4, 84, 62, 28);
      graphics.fillStyle(0xffc8b0, 1);
      graphics.fillEllipse(50, 70, 70, 78);
      graphics.fillStyle(0xf5d47c, 1);
      graphics.fillRoundedRect(16, 92, 68, 34, 18);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(34, 68, 12);
      graphics.fillCircle(66, 68, 12);
      graphics.fillStyle(0x2a3b6a, 1);
      graphics.fillCircle(34, 70, 6);
      graphics.fillCircle(66, 70, 6);
      graphics.lineStyle(4, 0x764717, 1);
      graphics.beginPath();
      graphics.moveTo(32, 88);
      graphics.lineTo(44, 96);
      graphics.lineTo(56, 88);
      graphics.strokePath();
      graphics.fillStyle(0xffe1c6, 1);
      graphics.fillCircle(28, 54, 4);
      graphics.fillCircle(72, 50, 5);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRoundedRect(22, 18, 56, 32, 10);
      graphics.fillStyle(0x1c2a4a, 1);
      graphics.fillEllipse(50, 34, 56, 30);
      graphics.fillStyle(0xf1f3ff, 1);
      graphics.fillEllipse(50, 28, 34, 18);
    } else {
      const color = 0x52adf5;
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(0, 0, width, height, 18);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRoundedRect(width * 0.25, height * 0.18, width * 0.5, height * 0.64, 12);
    }

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // Responsive background and game world.
    this.add.image(450, 270, 'background').setDisplaySize(900, 540);

    this.platforms = this.physics.add.staticGroup();
    this.createPlatform(450, 532, 900, 36);
    this.createPlatform(200, 410, 340, 32);
    this.createPlatform(700, 330, 300, 32);
    this.createPlatform(136, 225, 240, 32);
    this.createPlatform(760, 190, 180, 32);

    this.player = this.physics.add.sprite(120, 420, 'player');
    this.player.setScale(0.88);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.85, this.player.height * 0.92);
    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.score = 0;
    this.timeLeft = 60;
    this.isMusicPlaying = false;
    this.canDoubleJump = false;

    this.scoreText = this.add.text(24, 22, 'Score: 0', {
      fontFamily: 'Segoe UI',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });

    this.timerText = this.add.text(876, 22, 'Time: 60', {
      fontFamily: 'Segoe UI',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(1, 0);

    this.muteText = this.add.text(24, 502, this.sound.mute ? 'Unmute' : 'Mute', {
      fontFamily: 'Segoe UI',
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#111f40',
      padding: { x: 18, y: 10 },
      borderRadius: 12,
    }).setInteractive({ useHandCursor: true });

    this.muteText.on('pointerdown', () => {
      this.sound.mute = !this.sound.mute;
      this.muteText.setText(this.sound.mute ? 'Unmute' : 'Mute');
      if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
        this.backgroundMusic.setMute(this.sound.mute);
      }
    });

    this.coin = this.physics.add.sprite(0, 0, 'coin');
    this.coin.setCircle(this.coin.width * 0.45);
    this.coin.body.setAllowGravity(false);
    this.spawnCoin();

    this.physics.add.overlap(this.player, this.coin, this.collectCoin, null, this);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    this.backgroundMusic = this.cache.audio.exists('music') ? this.sound.add('music', { loop: true, volume: 0.5 }) : null;
    this.jumpSound = this.cache.audio.exists('jump') ? this.sound.add('jump', { volume: 0.7 }) : null;
    this.doubleJumpSound = this.cache.audio.exists('doubleJump') ? this.sound.add('doubleJump', { volume: 0.7 }) : null;
    this.coinSound = this.cache.audio.exists('coinSound') ? this.sound.add('coinSound', { volume: 0.8 }) : null;
    this.gameOverSound = this.cache.audio.exists('gameover') ? this.sound.add('gameover', { volume: 0.8 }) : null;

    if (this.backgroundMusic) {
      this.backgroundMusic.play();
      this.isMusicPlaying = true;
      this.backgroundMusic.setMute(this.sound.mute);
    }
  }

  update() {
    const speed = 220;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.player.body.onFloor()) {
      this.canDoubleJump = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
      if (this.player.body.onFloor()) {
        this.player.setVelocityY(-480);
        if (this.jumpSound) {
          this.jumpSound.play();
        }
      } else if (this.canDoubleJump) {
        this.player.setVelocityY(-480);
        this.canDoubleJump = false;
        if (this.doubleJumpSound) {
          this.doubleJumpSound.play();
        } else if (this.jumpSound) {
          this.jumpSound.play();
        }
      }
    }
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    if (this.coinSound) {
      this.coinSound.play();
    }
    this.score += 1;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Add visual effect for score
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });

    this.time.delayedCall(180, this.spawnCoin, [], this);
  }

  spawnCoin() {
    const validX = Phaser.Math.Between(100, 800);
    const validY = Phaser.Math.Between(140, 420);
    this.coin.enableBody(true, validX, validY, true, true);
    this.coin.setActive(true);
    this.coin.setVisible(true);
  }

  updateTimer() {
    this.timeLeft -= 1;
    this.timerText.setText(`Time: ${this.timeLeft}`);

    if (this.timeLeft <= 0) {
      this.timerEvent.remove(false);
      this.endGame();
    }
  }

  endGame() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
    }

    if (this.gameOverSound) {
      this.gameOverSound.play();
    }

    this.scene.start('GameOverScene', { score: this.score });
  }

  createPlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x2f4c8f).setOrigin(0.5);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.add.image(450, 270, 'background').setDisplaySize(900, 540);
    this.add.rectangle(450, 270, 820, 420, 0x0e1a36, 0.92);

    this.add.text(450, 130, 'Game Over', {
      fontFamily: 'Segoe UI',
      fontSize: '58px',
      fontStyle: 'bold',
      color: '#ff7b72',
      stroke: '#ffffff',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(450, 220, `Your Score: ${this.finalScore}`, {
      fontFamily: 'Segoe UI',
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 760 },
    }).setOrigin(0.5);

    this.add.text(450, 270, 'Great job! Ready to play again?', {
      fontFamily: 'Segoe UI',
      fontSize: '22px',
      color: '#ced6ff',
      align: 'center',
      wordWrap: { width: 760 },
    }).setOrigin(0.5);

    this.createButton(450, 360, 'Restart', () => {
      this.scene.start('GameScene');
    });

    this.createButton(450, 430, 'Back to Menu', () => {
      this.scene.start('StartScene');
    });
  }

  createButton(x, y, label, callback) {
    const button = this.add.rectangle(x, y, 320, 64, 0x23a6d5, 1).setStrokeStyle(3, 0xffffff).setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setFillStyle(0x4eb3df));
    button.on('pointerout', () => button.setFillStyle(0x23a6d5));
    button.on('pointerdown', callback);
    this.add.text(x, y, label, {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 540,
  parent: 'game-container',
  backgroundColor: '#08132a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false,
    },
  },
  scene: [StartScene, GameScene, GameOverScene],
};

window.addEventListener('load', () => {
  window.game = new Phaser.Game(config);
});
