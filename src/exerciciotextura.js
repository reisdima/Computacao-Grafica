function main()
{
  var scene = new THREE.Scene();    // Create main scene
  var stats = initStats();          // To show FPS information
  var renderer = initRenderer();    // View function in util/utils
    renderer.setClearColor("rgb(30, 30, 42)");

  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.lookAt(0, 0, 0);
    camera.position.set(2.18, 1.62, 3.31);
    camera.up.set( 0, 1, 0 );

  var lightPosition = new THREE.Vector3(1.7, 0.8, 1.1);
  var light = initDefaultLighting(scene, lightPosition); // Use default light
  var lightSphere = createLightSphere(scene, 0.1, 10, 10, lightPosition);

  // Set angles of rotation
  var angle = 0;
  var speed = 0.05;
  var animationOn = true; // control if animation is on or of

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls( camera, renderer.domElement );

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper( 1.5 );
    axesHelper.visible = false;
  scene.add( axesHelper );

  

  //-- Scene Objects -----------------------------------------------------------
  // Ground
  var groundPlane = createGroundPlane(4.0, 4.0); // width and height
    groundPlane.rotateX(degreesToRadians(-90));
  scene.add(groundPlane);

  // Cube
  var cubeSize = 10;
  var cubeGeometry = new THREE.BoxGeometry(0.1, 1, 1);
  var cube4Geometry = new THREE.BoxGeometry(0.1, 1,1);
  var cubeMaterial = new THREE.MeshLambertMaterial();
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.position.set(0.0, 0.5, 0);
  scene.add(cube);

  var cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube2.castShadow = true;
    cube2.position.set(0.45, 0, 0.55);
    cube2.rotation.set(0, degreesToRadians(90), 0);


    var cube3 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube3.castShadow = true;
    cube3.position.set(0.90, 0.0, 0.05);
    cube3.rotation.set(0, degreesToRadians(180), 0);


    var cube4 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube4.castShadow = true;
    cube4.position.set(0.45, 0, -0.5);
    cube4.rotation.set(0, degreesToRadians(90), 0);


    var cube5 = new THREE.Mesh(cube4Geometry, cubeMaterial);
    cube5.castShadow = true;
    cube5.position.set(0.45, 0.5, 0);
    cube5.rotation.set(0, 0, degreesToRadians(90));


  cube.add(cube3);
  cube.add(cube2);
  cube.add(cube4);
  cube.add(cube5);
  scene.add(cube);
  

  //----------------------------------------------------------------------------
  //-- Use TextureLoader to load texture files
  var textureLoader = new THREE.TextureLoader();
  var stone = textureLoader.load('../assets/textures/pista.jpg');

  // Apply texture to the 'map' property of the respective materials' objects
   cube.material.map = stone;
   groundPlane.material.map = stone;
  buildInterface();
  render();

  function rotateLight()
  {
    // More info:
    light.matrixAutoUpdate = false;
    lightSphere.matrixAutoUpdate = false;

    // Set angle's animation speed
    if(animationOn)
    {
      angle+=speed;

      var mat4 = new THREE.Matrix4();

      // Will execute T1 and then R1
      light.matrix.identity();  // reset matrix
      light.matrix.multiply(mat4.makeRotationY(angle)); // R1
      light.matrix.multiply(mat4.makeTranslation(2.0, 1.2, 0.0)); // T1

      lightSphere.matrix.copy(light.matrix);
    }
  }

  function buildInterface()
  {
    //------------------------------------------------------------
    // Interface
    var controls = new function ()
    {
      this.viewAxes = false;
      this.speed = speed;
      this.animation = animationOn;

      this.onViewAxes = function(){
        axesHelper.visible = this.viewAxes;
      };
      this.onEnableAnimation = function(){
        animationOn = this.animation;
      };
      this.onUpdateSpeed = function(){
        speed = this.speed;
      };
    };

    var gui = new dat.GUI();
    gui.add(controls, 'animation', true)
      .name("Animation")
      .onChange(function(e) { controls.onEnableAnimation() });
    gui.add(controls, 'speed', 0.01, 0.5)
      .name("Light Speed")
      .onChange(function(e) { controls.onUpdateSpeed() });
    gui.add(controls, 'viewAxes', false)
      .name("View Axes")
      .onChange(function(e) { controls.onViewAxes() });
  }

  function render()
  {
    stats.update();
    trackballControls.update();
    rotateLight();
    requestAnimationFrame(render);
    renderer.render(scene, camera)
  }
}
