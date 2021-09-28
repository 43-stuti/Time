import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import * as suncal from 'suncalc'
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')
let anglereset = false;
let lastrest;
// Scene
const scene = new THREE.Scene()
let X=-0,Y=3,Z=4;

const fontloader = new THREE.FontLoader();
fontloader.load('/roman.json', function(font)  {
    let numbers = ['VII','VIII','IX','X','XI','XII','I','II','III','IV','V','VI'];
    let angle = 18;
    for(let i=0;i<numbers.length;i++) {
        const geom = new THREE.TextGeometry(numbers[i], {
            font:font,
            size:0.12,
            height:0.02
        })
        const textMesh = new THREE.Mesh(geom,[
            new THREE.MeshStandardMaterial({ color: 0xe8a854 }),
            new THREE.MeshStandardMaterial({ color: 0xe8a854 })
        ])
        console.log('HAHAHHA')
        textMesh.position.x = -0.1+1.2*Math.cos(4*Math.PI/4+i*angle*(Math.PI/180));
        textMesh.position.y = 0.01;
        textMesh.position.z = 1.2*Math.sin(4*Math.PI/4+i*angle*(Math.PI/180));
        scene.add(textMesh)
    }
})
const light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
light.position.set( X, Y, Z ); //default; light shining from top
light.target.position.set(0, 0, 0);
light.castShadow = true; // default false
scene.add( light );
console.log('LIGHT')
 // only for debugging
// these six values define the boundaries of the yellow box seen above
light.shadow.camera.near = 2;
light.shadow.camera.far = 5;
light.shadow.camera.left = -0.5;
light.shadow.camera.right = 0.5;
light.shadow.camera.top = 0.5;
light.shadow.camera.bottom = -0.5;
light.shadow.camera.lookAt(new THREE.Vector3(0,0.3,0))
//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 40; // default

const hemLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.4);
//scene.add( hemLight );
const hemhelper = new THREE.HemisphereLightHelper( hemLight, 2 );
hemLight.position.z=0
hemLight.position.y = 2
hemLight.rotation.x=0
//scene.add( hemhelper )

//Create a sphere that cast shadows (but does not receive them)
const sphereGeometry = new THREE.TetrahedronGeometry( 0.05, 1);
const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xe8a854 } );
sphereMaterial.metalness = 0.7
//sphereMaterial.opacity = 0.3
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.castShadow = true; //default is false
sphere.position.y = 0.23
sphere.rotation.x = -10
sphere.scale.y = 8
sphere.rotateY = -45
sphere.receiveShadow = false; //default
scene.add( sphere );

//Create a plane that receives shadows (but does not cast them)
const planeGeometry = new THREE.CylinderGeometry( 1.8, 1.8, 0.02,30);
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0xe8a852 } );
planeMaterial.metalness = 1
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
scene.add( plane );

const planeGeometry3 = new THREE.CylinderGeometry( 1.7, 1.7, 0.03,30);
const planeMaterial3 = new THREE.MeshStandardMaterial( { color: 0x115936 } );
planeMaterial3.metalness = 1
const plane3 = new THREE.Mesh( planeGeometry3, planeMaterial3 );
plane3.receiveShadow = true;
scene.add( plane3 );

const planeGeometry2 = new THREE.BoxGeometry( 20,10,0.03);
const planeMaterial2 = new THREE.MeshStandardMaterial( { color: 0x115937 } );
planeMaterial2.metalness = 1
const plane2 = new THREE.Mesh( planeGeometry2, planeMaterial2 );
plane2.position.z=-2
plane2.position.y=1
scene.add( plane2 );

//gui
//gui.add(light.position,'y');
//gui.add(light.position,'x');
//gui.add(light.position,'z');
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', async () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    })

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 400)
camera.position.x = 0
camera.position.y = 0.8
camera.position.z = 1.2
scene.add(camera)
//scene.add(new THREE.CameraHelper(camera))
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime();

    // Update objects
    //sphere.rotation.y = .5 * elapsedTime

    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
const setAngle = async () => {
    let myDate = new Date();
    myDate.setHours( myDate.getHours()+6+3);
    let t = await suncal.getPosition(/*Date*/ myDate, /*Number*/ 40.730, /*Number*/ -73.93)
    X = -Math.round( 4 * ( Math.cos( t.altitude ) * Math.sin( t.azimuth ) ) );
    Y = Math.round( 4 * ( Math.cos( t.altitude ) * Math.cos( t.azimuth ) ) );
    Z = Math.round( 4* Math.sin( t.altitude ) );
    console.log(X,Y,Z);
    light.position.x = X;
    light.position.y = Y;
    light.position.z = Z;
    light.updateMatrix();
    light.updateMatrixWorld();
    console.log(light.position)
}
window.addEventListener('DOMContentLoaded', async () => {
    setAngle(0);
    setAngle();
    tick()
  });
