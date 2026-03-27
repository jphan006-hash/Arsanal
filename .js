
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Duck Arsenal 3D</title>
  <link rel="stylesheet" href="style.css">
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background: #111;
      color: white;
      font-family: Arial;
    }
    #menu {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      text-align: center;
    }
    button {
      padding: 15px 30px;
      font-size: 20px;
      cursor: pointer;
    }
    #hud {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.5);
      padding: 10px;
      border-radius: 10px;
    }
    #crosshair {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      transform: translate(-50%, -50%);
    }
    #crosshair::before,
    #crosshair::after {
      content: '';
      position: absolute;
      background: white;
    }
    #crosshair::before {
      width: 2px;
      height: 20px;
      left: 9px;
    }
    #crosshair::after {
      width: 20px;
      height: 2px;
      top: 9px;
    }
  </style>
</head>
<body>

<div id="menu">
  <h1>🦆 Duck Arsenal 3D</h1>
  <button id="startBtn">START</button>
</div>

<div id="hud" style="display:none;">
  <p>Health: <span id="hp">100</span></p>
  <p>Kills: <span id="kills">0</span></p>
  <p>Level: <span id="level">1</span></p>
</div>

<div id="crosshair"></div>

<!-- Three.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- Game script -->
<script>

let player, bullets = [], enemies = [];
let keys = {};

let hp = 100;
let kills = 0;
let level = 1;

// Player object
let user = {
  mesh: null,
  hp: 100,
  level: 1,
  rapid: false,
  speed: 0.2,
  currentWeapon: 0,
  kills: 0,
  abilityCooldown: 0,
  abilityActive: false
};

// AI players
let players = [user]; // first player is user

// Weapons
const weapons = [
  { name: "Pistol", damage: 10, rapid: false },
  { name: "Shotgun", damage: 6, rapid: false },
  { name: "Rifle", damage: 20, rapid: true },
  { name: "Sniper", damage: 50, rapid: false },
  { name: "Blaster", damage: 15, rapid: true }
];

// Boss
let boss = null;

// Battle Royale
let battleRoyaleActive = false;

// HUD Elements
const leaderboardContainer = document.createElement("div");
leaderboardContainer.style.position = "absolute";
leaderboardContainer.style.top = "10px";
leaderboardContainer.style.right = "10px";
leaderboardContainer.style.background = "rgba(0,0,0,0.5)";
leaderboardContainer.style.color = "white";
leaderboardContainer.style.padding = "10px";
leaderboardContainer.style.borderRadius = "10px";
document.body.appendChild(leaderboardContainer);

const weaponHUD = document.createElement("div");
weaponHUD.style.position = "absolute";
weaponHUD.style.bottom = "10px";
weaponHUD.style.left = "50%";
weaponHUD.style.transform = "translateX(-50%)";
weaponHUD.style.background = "rgba(0,0,0,0.5)";
weaponHUD.style.color = "white";
weaponHUD.style.padding = "10px";
weaponHUD.style.borderRadius = "10px";
document.body.appendChild(weaponHUD);

const abilityBar = document.createElement("div");
abilityBar.style.position = "absolute";
abilityBar.style.bottom = "60px";
abilityBar.style.left = "50%";
abilityBar.style.transform = "translateX(-50%)";
abilityBar.style.width = "200px";
abilityBar.style.height = "20px";
abilityBar.style.background = "#444";
abilityBar.style.borderRadius = "10px";
document.body.appendChild(abilityBar);

const abilityFill = document.createElement("div");
abilityFill.style.height = "100%";
abilityFill.style.width = "100%";
abilityFill.style.background = "cyan";
abilityFill.style.borderRadius = "10px";
abilityBar.appendChild(abilityFill);

// Start game
document.getElementById("startBtn").onclick = startGame;

function startGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("hud").style.display = "block";

  init();
  animate();
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  scene.add(ground);

  // Lake
  const lake = new THREE.Mesh(
    new THREE.CircleGeometry(10, 32),
    new THREE.MeshStandardMaterial({ color: 0x1e90ff })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(0, -0.9, -10);
  scene.add(lake);

  // Player
  player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  player.position.y = 0.5;
  scene.add(player);
  user.mesh = player;

  // AI players
  for (let i = 0; i < 3; i++) {
    let ai = {
      mesh: new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0xff00ff })
      ),
      hp: 100,
      level: 1,
      rapid: false,
      speed: 0.15,
      currentWeapon: 0,
      kills: 0
    };
    ai.mesh.position.set(Math.random() * 10 - 5, 0.5, Math.random() * -10);
    scene.add(ai.mesh);
    players.push(ai);
  }

  spawnEnemies(5);

  window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
  window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
  window.addEventListener("click", shoot);
}

// Shooting bullets
function shoot() {
  const weapon = weapons[user.currentWeapon];
  const shots = weapon.rapid ? 3 : 1;

  for (let i = 0; i < shots; i++) {
    let spread = (Math.random() - 0.5) * 0.2;
    spawnBullet(spread, -1, weapon.damage, user);
  }
}

function spawnBullet(x, z, damage, shooter) {
  let b = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  b.position.copy(shooter.mesh.position);
  b.velocity = new THREE.Vector3(x, 0, z);
  b.damage = damage;
  b.shooter = shooter;

  scene.add(b);
  bullets.push(b);
}

// Spawn enemies
function spawnEnemies(n) {
  for (let i = 0; i < n; i++) {
    let e = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    e.position.set(Math.random() * 20 - 10, 0.5, Math.random() * -20);
    e.hp = 20;
    scene.add(e);
    enemies.push(e);
  }
}

// Spawn boss
function spawnBoss() {
  boss = new THREE.Mesh(
    new THREE.BoxGeometry(6, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  boss.position.set(0, 3, -30);
  boss.hp = 1000;
  scene.add(boss);
}

// Battle Royale Start
function startBattleRoyale() {
  battleRoyaleActive = true;
  players.forEach(p => { if (p !== user) p.hp = 100; });
}

// Update leaderboard and HUD
function updateHUD() {
  // Weapon HUD
  let w = weapons[user.currentWeapon];
  weaponHUD.innerHTML = `<b>Weapon:</b> ${w.name} ${w.rapid ? "(Rapid Fire)" : ""}`;

  // Ability cooldown
  abilityFill.style.width = `${Math.max(0, user.abilityCooldown / 300 * 100)}%`;

  // Leaderboard
  let html = "<b>Leaderboard</b><br>";
  players.forEach((p, i) => {
    html += `Player ${i + 1}: ${p.kills} kills${p.hp > 0 ? " 🟢" : " 🔴"}<br>`;
  });
  leaderboardContainer.innerHTML = html;
}

// Update loop
function update() {
  // Player movement
  if (keys["w"]) player.position.z -= user.speed;
  if (keys["s"]) player.position.z += user.speed;
  if (keys["a"]) player.position.x -= user.speed;
  if (keys["d"]) player.position.x += user.speed;

  // Bullets movement
  bullets.forEach((b, i) => {
    b.position.add(b.velocity);

    // Check players hit
    players.forEach(p => {
      if (p !== b.shooter && p.hp > 0 && b.position.distanceTo(p.mesh.position) < 1) {
        p.hp -= b.damage;
        b.shooter.kills++;
        scene.remove(b);
        bullets.splice(i, 1);
      }
    });

    // Check enemies
    enemies.forEach((e, ei) => {
      if (b.position.distanceTo(e.position) < 1) {
        e.hp -= b.damage;
        b.shooter.kills++;
        scene.remove(b);
        bullets.splice(i, 1);
        if (e.hp <= 0) {
          scene.remove(e);
          enemies.splice(ei, 1);
        }
      }
    });

    // Check boss
    if (boss && b.position.distanceTo(boss.position) < 3) {
      boss.hp -= b.damage;
      b.shooter.kills++;
      scene.remove(b);
      bullets.splice(i, 1);
      if (boss.hp <= 0) {
        alert("👑 KING DUCK DEFEATED!");
        startBattleRoyale();
      }
    }
  });

  // Enemies move
  enemies.forEach(e => {
    let dir = new THREE.Vector3().subVectors(player.position, e.position).normalize();
    e.position.add(dir.multiplyScalar(0.03));
    if (e.position.distanceTo(player.position) < 1) hp -= 5;
  });

  // Boss moves
  if (boss) {
    let dir = new THREE.Vector3().subVectors(player.position, boss.position).normalize();
    boss.position.add(dir.multiplyScalar(0.02));
    if (boss.position.distanceTo(player.position) < 3) hp -= 10;
  }

  // Battle Royale AI movement
  if (battleRoyaleActive) {
    players.forEach(p => {
      if (p.hp > 0 && p !== user) {
        let target = players[Math.floor(Math.random() * players.length)];
        if (target.hp > 0 && target !== p) {
          let dir = new THREE.Vector3().subVectors(target.mesh.position, p.mesh.position).normalize();
          p.mesh.position.add(dir.multiplyScalar(p.speed));
        }
      }
    });

    // Check last player
    let alive = players.filter(p => p.hp > 0);
    if (alive.length === 1) {
      alert(`🏆 Star Player: Player ${players.indexOf(alive[0]) + 1}`);
      battleRoyaleActive = false;
    }
  }

  // HUD update
  updateHUD();

  // Check game over
  if (hp <= 0) {
    alert("💀 Game Over");
    location.reload();
  }
}

// Animate
function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}
</script>

</body>
</html>let scene, camera, renderer;
