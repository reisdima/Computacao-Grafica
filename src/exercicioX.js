function main()
{

  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position

   // Enable mouse rotation, pan, zoom etc.
   var trackballControls = new THREE.TrackballControls( camera, renderer.domElement );

  // criando o plano
  var planeGeometry = new THREE.PlaneGeometry(20, 20);
  var planeMaterial = new THREE.MeshBasicMaterial({
      color: "rgba(150, 150, 150)",
      side: THREE.DoubleSide,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // add the plane to the scene
  scene.add(plane);

  //Inicio funcoes para criar as formas basicas

  function createCubeColor(width, height, depth, parent) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: parent });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0.0, 0.0, 0.0);
    return cube;
}

function createCylinder(radiusTop, radiusBottom, height, radialSegments) {
    const geometry = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments
    );
    const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0.0, 0.0, 0.0);
    return cylinder;
}

function createCylinderColor(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    color
) {
    const geometry = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments
    );
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0.0, 0.0, 0.0);
    return cylinder;
}

function createTorus(radius, tube, radialSegments, tubularSegments) {
    const geometry = new THREE.TorusGeometry(
        radius,
        tube,
        radialSegments,
        tubularSegments
    );
    const material = new THREE.MeshBasicMaterial({ color: "#3e403e" });
    const torus = new THREE.Mesh(geometry, material);
    torus.position.set(0.0, 0.0, 0.0);
    return torus;
}

function createIco(radius, detail, color) {
    const geometry = new THREE.IcosahedronGeometry(
        radius,
        detail
    );
    const material = new THREE.MeshBasicMaterial({ color: color});
    const icosaedro = new THREE.Mesh(geometry, material);
    icosaedro.position.set(0.0, 0.0, 0.0);
    return icosaedro;
}

// fim funcoes para criar as formas basicas

var speed = 0.005;
var angle = 0;
var animationOn = true; // control if animation is on or of


//

var base = createCubeColor(2,0.3,2,'#FFFFFF');
base.position.set(0,0,0.2);
base.rotation.set(degreesToRadians(90),0,0);

var torre = createCylinderColor(0.4,0.5,9,7,'#5C3317')
torre.position.set(0,4.5,0);

var motor = createCubeColor(1,2,1,'#A8A8A8');
motor.position.set(0,5,0.2);
motor.rotation.set(degreesToRadians(90),0,0);

var ico = createIco(0.6,5,'#A8A8A8');
ico.position.set(0,1.25,0);
ico.rotation.set(0,0,0);


var helice1 = createCylinderColor(0.2,0,5,8, '#8C1717');
helice1.position.set(-2.3,1.5,0);
helice1.rotation.set(0,0,degreesToRadians(-120))
var helice2 = createCylinderColor(0.2,0,5,8, '#8C1717');
helice2.position.set(0,-2.5,0);
var helice3 = createCylinderColor(0.2,0,5,8, '#8C1717');
helice3.position.set(2.3,1.5,0);
helice3.rotation.set(0,0,degreesToRadians(120))



base.add(torre);
torre.add(motor);
motor.add(ico);
ico.add(helice1);
ico.add(helice2);
ico.add(helice3);
scene.add(base);


function buildInterface()
{
  var controls = new function ()
  {
    this.onChangeAnimation = function(){
      animationOn = !animationOn;
    };
    this.speed = 0.05;
    // this.joint2 = 0;
    //
    this.changeSpeed = function(){
      speed = this.speed;
    };
  };

  // GUI interface
  var gui = new dat.GUI();
  gui.add(controls, 'onChangeAnimation',true).name("Animation On/Off");
  gui.add(controls, 'speed', 0.05, 0.5)
    .onChange(function(e) { controls.changeSpeed() })
    .name("Change Speed");
}



function rotateIco()
  {
    // More info:
    // https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
    ico.matrixAutoUpdate = false;
   
        // Set angle's animation speed
    if(animationOn)
    {
      angle+=speed;
      
      
      var mat4 = new THREE.Matrix4();
      ico.matrix.identity();  // reset matrix
    
      // Will execute R1 and then T1
      ico.matrix.multiply(mat4.makeTranslation(0,1.25,0)); // T1
      ico.matrix.multiply(mat4.makeRotationY(angle)); // R1
      ico.matrix.multiply(mat4.makeRotationX(degreesToRadians(90))); 
      

    }
  }


buildInterface();
render();
function render()
{
    trackballControls.update(); // Enable mouse movements
    rotateIco();
    requestAnimationFrame(render);
    renderer.render(scene,camera);
}

}