// Player (duck cube)
const geo = new THREE.BoxGeometry(1,1,1);
const mat = new THREE.MeshStandardMaterial({color:0xffff00});
player = new THREE.Mesh(geo, mat);
scene.add(player);

// Weapon system
const weaponTypes = ["pistol","shotgun","rifle"];
let currentWeapon = 0;

function createWeapon(type){
  let weapon;

  if(type === "pistol"){
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.5,0.2,1),
      new THREE.MeshStandardMaterial({color:0x333333})
    );
  }

  if(type === "shotgun"){
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.7,0.3,2),
      new THREE.MeshStandardMaterial({color:0x884422})
    );
  }

  if(type === "rifle"){
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.4,0.2,2.5),
      new THREE.MeshStandardMaterial({color:0x222222})
    );
  }

  weapon.position.set(0.8,0,0); // right side of duck
  return weapon;
}

let weaponMesh = createWeapon(weaponTypes[currentWeapon]);
player.add(weaponMesh);


function shoot(){
  if(weaponTypes[currentWeapon] === "pistol"){
    spawnBullet(0, -1, 10);
  }

  if(weaponTypes[currentWeapon] === "shotgun"){
    for(let i=-2;i<=2;i++){
      spawnBullet(i * 0.1, -1, 6);
    }
  }

  if(weaponTypes[currentWeapon] === "rifle"){
    spawnBullet(0, -2, 20);
  }
}

function spawnBullet(xSpread, zSpeed, damage){
  let geo = new THREE.SphereGeometry(0.2);
  let mat = new THREE.MeshBasicMaterial({color:0xffffff});
  let bullet = new THREE.Mesh(geo, mat);

  bullet.position.copy(player.position);
  bullet.velocity = new THREE.Vector3(xSpread,0,zSpeed);
  bullet.damage = damage;

  scene.add(bullet);
  bullets.push(bullet);
}
