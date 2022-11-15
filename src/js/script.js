import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import nebula from '../img/nebula.jpg';
import starts from '../img/stars.jpg';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

const monkeyUrl = new URL('../assets/monkey.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;

/* set Size */
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* make scene and camera */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45, // atur posisi perspektif kamera, semakin tinggi angka maka semakin jauh
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

/* Add orbit */
const orbit =  new OrbitControls(camera, renderer.domElement);

/* set Position of Camera X, Y , X */
camera.position.set(-10, 30, 30);

/* set background */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    nebula,
    nebula,
    starts,
    starts,
    starts,
    starts
]);

/* Make Box */
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x00FF00
});
const box = new THREE.Mesh(boxGeometry, boxMaterial);

/* add other box */
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2MultiMaterial = [
    new THREE.MeshBasicMaterial({ map: textureLoader.load(starts)}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(starts)}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(starts)}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(starts)}),
];

const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
box2.position.set(0, 15, 10);
box2.name = 'theBox';

/* make Plane */
const planeGemometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial  = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGemometry, planeMaterial);
plane.receiveShadow = true;

/* make other plane */
const plane2Geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const plane2Material = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    wireframe: true
});
const plane2 = new THREE.Mesh(plane2Geometry, plane2Material);
plane2.position.set(10, 10, 15);
plane2.geometry.attributes.position.array[0] -= 10 * Math.random();
plane2.geometry.attributes.position.array[1] -= 10 * Math.random();
plane2.geometry.attributes.position.array[2] -= 10 * Math.random();
const lastPointZ = plane2.geometry.attributes.position.array.length - 1;
plane2.geometry.attributes.position.array[lastPointZ] -= 10 * Math.random();


/* make sphere */
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000FF,
    wireframe: false});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;
const sphereId = sphere.id;

/* make other sphere */
const sphere2Geometry = new THREE.SphereGeometry(4);
const sphere2Material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
});

const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
sphere2.position.set(-5, 10, 10);

/* add 3D Blender */
const assetLoader = new GLTFLoader();
assetLoader.load(monkeyUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(-12, 4, 10);
}, undefined, function(error) {
    console.log(error);
});


/* add light */
 const ambientLight = new THREE.AmbientLight(0x333333);
const spotLight = new THREE.SpotLight(0xFFFFFF);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

/* add fog */
scene.fog = new THREE.Fog(0xFFFFFF, 0.01);

/* add helper */
const axesHelper = new THREE.AxesHelper(5);
const gridHelper = new THREE.GridHelper(30);
const sLightHelper = new THREE.SpotLightHelper(spotLight);

/* Add Scene */ 
scene.add(axesHelper);
scene.add(gridHelper);
scene.add(sLightHelper);
scene.add(box);
scene.add(box2);
scene.add(plane);
scene.add(plane2);
scene.add(sphere);
scene.add(sphere2);
scene.add(ambientLight);
scene.add(spotLight);

/* GUI */
const gui = new dat.GUI();

const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01,
    angle: 0.2,
    penumbra: 0,
    intensity: 1
};

/* add gui */
gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
})

gui.add(options, 'wireframe').onChange(function(e){
    sphere.material.wireframe = e;
})

gui.add(options, 'speed', 0, 0.1);
gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 1);
let step = 0;

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();



/* animation or rotation */
function animate(time) {
    box.rotation.x = time / 1000;
    box.rotation.y = time / 1000;
    plane.rotation.x = -0.5 * Math.PI;
    sphere.position.set(-10, 10, 0);
    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step));
    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    sLightHelper.update();
    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    renderer.render(scene, camera);
    for(let i = 0; i < intersects.length; i++) {
        if(intersects[i].object.id === sphereId)
            intersects[i].object.material.color.set(0xFF0000);

        if(intersects[i].object.name === 'theBox') {
            intersects[i].object.rotation.x = time / 1000;
            intersects[i].object.rotation.y = time / 1000;
        }
    }
    plane2.geometry.attributes.position.array[0] = 10 * Math.random();
    plane2.geometry.attributes.position.array[1] = 10 * Math.random();
    plane2.geometry.attributes.position.array[2] = 10 * Math.random();
    plane2.geometry.attributes.position.array[lastPointZ] = 10 * Math.random();
    plane2.geometry.attributes.position.needsUpdate = true;
}

/* update */
orbit.update();

renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});