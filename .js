let boss = null;
let players = [4];
let scene, camera, renderer;
let player, bullets = [], enemies = [];
let keys = {};

let hp = 100;
let kills = 0;
let level = 1;

let weaponMesh;
const weaponTypes = ["pistol","shotgun","rifle"];
let currentWeapon = 0;

let lake; // FIXED (global so animation works)

document.getElementById("startBtn").onclick = startGame;

function startGame(){
  document.getElementById("menu").style.display = "none";
  document.getElementById("hud").style.display = "block";

  init();
  animate();
}

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff,1);
  light.position.set(5,10,5);
  scene.add(light);

  // 🌱 Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200,200),
    new THREE.MeshStandardMaterial({color:0x228B22})
  );
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -1;
  scene.add(ground);

  // 💧 Lake
  lake = new THREE.Mesh(
    new THREE.CircleGeometry(10,32),
    new THREE.MeshStandardMaterial({color:0x1e90ff})
  );
  lake.rotation.x = -Math.PI/2;
  lake.position.set(0,-0.9,-10);
  scene.add(lake);

  // 🦆 Player
  player = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({color:0xffff00})
  );
  scene.add(player);

  addWeapon();

  spawnEnemies(5);

  window.addEventListener("keydown", e=>keys[e.key]=true);
  window.addEventListener("keyup", e=>keys[e.key]=false);
  window.addEventListener("click", shoot);
}

const weapons = [
  {name:"Pistol", damage:10},
  {name:"Shotgun", damage:6},
  {name:"Rifle", damage:20},
  {name:"Sniper", damage:50},
  {name:"Blaster", damage:15}
];

function getWeapon(level){
  return weapons[Math.floor(level / 5) % weapons.length];
}

  weaponMesh.position.set(0.8,0,0);
  player.add(weaponMesh);
}

function shoot(){
  let user = players.find(p=>p.isUser);

  let shots = user.rapid ? 3 : 1;

  for(let i=0;i<shots;i++){
    spawnBullet((Math.random()-0.5)*0.2,-1,10);
  }
}

function shoot(){
  let user = players.find(p=>p.isUser);
  let weapon = getWeapon(user.level);

  let shots = user.rapid ? 3 : 1;

  for(let i=0;i<shots;i++){
    spawnBullet((Math.random()-0.5)*0.2,-1,weapon.damage);
  }
}

  b.position.copy(player.position);
  b.velocity = new THREE.Vector3(x,0,z);
  b.damage = damage;

  scene.add(b);
  bullets.push(b);
}

function spawnEnemies(n){
  for(let i=0;i<n;i++){
    let e = new THREE.Mesh(
      new THREE.BoxGeometry(1,1,1),
      new THREE.MeshStandardMaterial({color:0xff0000})
    );

    e.position.set(Math.random()*20-10,0,Math.random()*-20);
    e.hp = 20;

    scene.add(e);
    enemies.push(e);
  }
}

function update(){
  if(keys["w"]) player.position.z -= 0.2;
  if(keys["s"]) player.position.z += 0.2;
  if(keys["a"]) player.position.x -= 0.2;
  if(keys["d"]) player.position.x += 0.2;

  bullets.forEach((b,i)=>{
    b.position.add(b.velocity);

    enemies.forEach((e,ei)=>{
      if(b.position.distanceTo(e.position) < 1){
        e.hp -= b.damage;

        scene.remove(b);
        bullets.splice(i,1);

        if(e.hp <= 0){
          scene.remove(e);
          enemies.splice(ei,1);
          kills++;

          if(kills % 5 === 0){
            level++;
            currentWeapon = level % 3;
            addWeapon();
          }
        }
      }
    });
  });

  enemies.forEach(e=>{
    let dir = new THREE.Vector3().subVectors(player.position,e.position).normalize();
    e.position.add(dir.multiplyScalar(0.03));

    if(e.position.distanceTo(player.position)<1){
      hp -= 5;
    }
  });

  if(enemies.length === 0){
    spawnEnemies(5 + level);
  }

  // animate lake
  if(lake) lake.rotation.z += 0.001;

  document.getElementById("hp").textContent = hp;
  document.getElementById("kills").textContent = kills;
  document.getElementById("level").textContent = level;

  if(hp <= 0){
    alert("Game Over");
    location.reload();
  }
}

function animate(){
  requestAnimationFrame(animate);
  update();
  renderer.render(scene,camera);
}

function useAbility(p){
  if(p.abilityCooldown > 0) return;

  p.abilityActive = true;
  p.abilityCooldown = 300;

  // Random ability
  let ability = Math.floor(Math.random()*3);

  let user = players.find(p=>p.isUser);

if(keys["w"]) user.mesh.position.z -= user.speed;
if(keys["s"]) user.mesh.position.z += user.speed;
if(keys["a"]) user.mesh.position.x -= user.speed;
if(keys["d"]) user.mesh.position.x += user.speed;
 

  if(ability === 1){
    // RAPID FIRE
    p.rapid = true;
    setTimeout(()=>{ p.rapid=false; p.abilityActive=false; },3000);
  }

  if(ability === 2){
    // HEAL
    p.hp = Math.min(100, p.hp + 30);
    p.abilityActive = false;
  }
}

function updatePlayersUI(){
  let container = document.getElementById("playersUI");
  container.innerHTML = "";

  players.forEach((p,i)=>{
    let div = document.createElement("div");
    div.className = "playerCard";

    if(p.abilityActive) div.classList.add("activeAbility");

    div.innerHTML = `
      <b>Duck ${i+1}</b><br>
      HP: ${p.hp}<br>
      LVL: ${p.level}
      <div class="abilityBar">
        <div class="abilityFill" style="width:${(p.abilityCooldown/300)*100}%"></div>
      </div>
    `;

    container.appendChild(div);
  });
}
updatePlayersUI();


function spawnBoss(){
  boss = new THREE.Mesh(
    new THREE.BoxGeometry(6,6,6),
    new THREE.MeshStandardMaterial({color:0x00ff00})
  );
let user = players.find(p=>p.isUser);

if(user.level === 80 && !boss){
  spawnBoss();
}
id: Math.random().toString(36).substr(2,9),
  
if(boss){
  let dir = new THREE.Vector3().subVectors(user.mesh.position, boss.position).normalize();
  boss.position.add(dir.multiplyScalar(0.02));

  if(boss.position.distanceTo(user.mesh.position) < 3){
    user.hp -= 10; // boss stronger
  }
} 
  boss.position.set(0,0,-30);
  boss.hp = 10000;

  scene.add(boss);
}
if(boss && b.position.distanceTo(boss.position) < 3){
  boss.hp -= b.damage;

  if(boss.hp <= 0){
    alert("👑 KING DUCK DEFEATED!");
    location.reload();
  }
}
updateStarPlayer();
<b>Duck ${i+1} ${p === starPlayer ? "⭐" : ""}</b>
function checkLastPlayer(){
  let alive = players.filter(p=>p.hp > 0);
checkLastPlayer();
  if(alive.length === 1){
    alert("🏆 Duck " + (players.indexOf(alive[0])+1) + " WINS!");
    location.reload();
  }
}
