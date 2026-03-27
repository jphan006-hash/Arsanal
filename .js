let scene, camera, renderer;
let bullets = [], enemies = [];
let keys = {};

let boss = null;
let battleRoyaleActive = false;
let starPlayer = null;

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

let players = [user]; // first is user

const weapons = [
    { name: "Pistol", damage: 10, rapid: false, color: 0xffffff },
    { name: "Shotgun", damage: 6, rapid: false, color: 0xffaa00 },
    { name: "Rifle", damage: 20, rapid: true, color: 0x00ff00 },
    { name: "Sniper", damage: 50, rapid: false, color: 0xff00ff },
    { name: "Blaster", damage: 15, rapid: true, color: 0x00ffff }
];

// HUD elements
const weaponHUD = document.createElement("div");
weaponHUD.style.position = "absolute";
weaponHUD.style.bottom = "10px";
weaponHUD.style.left = "50%";
weaponHUD.style.transform = "translateX(-50%)";
weaponHUD.style.background = "rgba(0,0,0,0.6)";
weaponHUD.style.color = "white";
weaponHUD.style.padding = "8px";
weaponHUD.style.borderRadius = "8px";
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

const leaderboard = document.createElement("div");
leaderboard.style.position = "absolute";
leaderboard.style.top = "10px";
leaderboard.style.right = "10px";
leaderboard.style.background = "rgba(0,0,0,0.6)";
leaderboard.style.color = "white";
leaderboard.style.padding = "10px";
leaderboard.style.borderRadius = "10px";
document.body.appendChild(leaderboard);

// Start the game
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

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0,0,0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff,1);
    light.position.set(5,10,5);
    scene.add(light);

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200,200),
        new THREE.MeshStandardMaterial({color:0x228B22})
    );
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    // Lake
    const lake = new THREE.Mesh(
        new THREE.CircleGeometry(10,32),
        new THREE.MeshStandardMaterial({color:0x1e90ff})
    );
    lake.rotation.x = -Math.PI/2;
    lake.position.set(0,0,-10);
    scene.add(lake);

    // User player (duck-shaped)
    const duckGeom = new THREE.ConeGeometry(0.5,1,6);
    const duckMat = new THREE.MeshStandardMaterial({color:0xffff00});
    user.mesh = new THREE.Mesh(duckGeom, duckMat);
    user.mesh.rotation.x = Math.PI/2;
    user.mesh.position.y = 0.5;
    scene.add(user.mesh);

    // AI players
    for (let i=0;i<3;i++){
        const aiGeom = new THREE.ConeGeometry(0.5,1,6);
        const aiMat = new THREE.MeshStandardMaterial({color:0xff00ff});
        let aiMesh = new THREE.Mesh(aiGeom, aiMat);
        aiMesh.rotation.x = Math.PI/2;
        aiMesh.position.set(Math.random()*10-5,0.5,Math.random()*-10);
        scene.add(aiMesh);
        players.push({
            mesh: aiMesh,
            hp:100,
            level:1,
            rapid:false,
            speed:0.15,
            kills:0,
            currentWeapon:0
        });
    }

    spawnEnemies(5);

    window.addEventListener("keydown", e => {
        keys[e.key.toLowerCase()] = true;
        // Weapon switching (1-5)
        if(["1","2","3","4","5"].includes(e.key)){
            user.currentWeapon = parseInt(e.key)-1;
        }
    });
    window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
    window.addEventListener("click", shoot);
}

// Shooting
function shoot(){
    const weapon = weapons[user.currentWeapon];
    const shots = weapon.rapid ? 3 : 1;

    for(let i=0;i<shots;i++){
        spawnBullet(user.mesh.position.clone(), weapon.color, weapon.damage, user);
    }
}

function spawnBullet(pos,color,damage,shooter){
    let b = new THREE.Mesh(
        new THREE.SphereGeometry(0.15,8,8),
        new THREE.MeshStandardMaterial({color})
    );
    b.position.copy(pos);
    b.velocity = new THREE.Vector3((Math.random()-0.5)*0.2,0,-1);
    b.damage = damage;
    b.shooter = shooter;
    scene.add(b);
    bullets.push(b);
}

// Spawn enemies (still simple blocks)
function spawnEnemies(n){
    for(let i=0;i<n;i++){
        let e = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshStandardMaterial({color:0xff0000})
        );
        e.position.set(Math.random()*20-10,0.5,Math.random()*-20);
        e.hp = 20;
        scene.add(e);
        enemies.push(e);
    }
}

// Boss (King Duck)
function spawnBoss(){
    if(boss) return;
    boss = new THREE.Mesh(
        new THREE.CylinderGeometry(1,1,6,8),
        new THREE.MeshStandardMaterial({color:0x00ff00,emissive:0x00ff00,emissiveIntensity:0.5})
    );
    boss.position.set(0,3,-30);
    boss.hp = 1000;
    scene.add(boss);
}

// HUD update
function updateHUD(){
    const w = weapons[user.currentWeapon];
    weaponHUD.innerHTML = `<b>Weapon:</b> ${w.name} ${w.rapid?"(Rapid Fire)":""}`;
    abilityFill.style.width = `${Math.max(0,user.abilityCooldown/300*100)}%`;

    let html = "<b>Leaderboard</b><br>";
    players.forEach((p,i)=>{
        html+=`Player ${i+1}: ${p.kills} kills ${p.hp>0?"🟢":"🔴"}<br>`;
    });
    leaderboard.innerHTML = html;
}

// Update loop
function update(){
    // Movement
    if(keys["w"]) user.mesh.position.z -= user.speed;
    if(keys["s"]) user.mesh.position.z += user.speed;
    if(keys["a"]) user.mesh.position.x -= user.speed;
    if(keys["d"]) user.mesh.position.x += user.speed;

    // Bullets movement
    bullets.forEach((b,i)=>{
        b.position.add(b.velocity);
        players.forEach(p=>{
            if(p.hp>0 && p!==b.shooter && b.position.distanceTo(p.mesh.position)<0.7){
                p.hp -= b.damage;
                b.shooter.kills++;
                scene.remove(b);
                bullets.splice(i,1);
            }
        });
        enemies.forEach((e,ei)=>{
            if(b.position.distanceTo(e.position)<0.7){
                e.hp -= b.damage;
                scene.remove(b);
                bullets.splice(i,1);
                if(e.hp<=0){
                    scene.remove(e);
                    enemies.splice(ei,1);
                }
            }
        });
        if(boss && b.position.distanceTo(boss.position)<2){
            boss.hp -= b.damage;
            b.shooter.kills++;
            scene.remove(b);
            bullets.splice(i,1);
            if(boss.hp<=0){
                alert("👑 KING DUCK DEFEATED!");
                battleRoyaleActive=true;
            }
        }
    });

    // Boss movement
    if(boss){
        const dir = new THREE.Vector3().subVectors(user.mesh.position,boss.position).normalize();
        boss.position.add(dir.multiplyScalar(0.02));
    }

    // Battle Royale AI
    if(battleRoyaleActive){
        players.forEach(p=>{
            if(p.hp>0 && p!==user){
                const targets = players.filter(pl=>pl.hp>0 && pl!==p);
                if(targets.length>0){
                    const t = targets[Math.floor(Math.random()*targets.length)];
                    const dir = new THREE.Vector3().subVectors(t.mesh.position,p.mesh.position).normalize();
                    p.mesh.position.add(dir.multiplyScalar(p.speed));
                }
            }
        });

        const alive = players.filter(p=>p.hp>0);
        if(alive.length===1 && !starPlayer){
            starPlayer = alive[0];
            alert(`🏆 Star Player: Player ${players.indexOf(starPlayer)+1}`);
        }
    }

    updateHUD();

    if(user.hp<=0){
        alert("💀 Game Over");
        location.reload();
    }
}

// Animate
function animate(){
    requestAnimationFrame(animate);
    update();
    renderer.render(scene,camera);
}
