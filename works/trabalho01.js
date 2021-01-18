function main()
{
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
  var light  = initDefaultLighting(scene, new THREE.Vector3(7, 7, 7));

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls( camera, renderer.domElement );

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper( 12 );
  scene.add( axesHelper );

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(20, 20);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
      color: "rgba(150, 150, 150)",
      side: THREE.DoubleSide,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // add the plane to the scene
  scene.add(plane);

  var cubeGeometry = new THREE.BoxGeometry(4, 2, 1);
  var cubeMaterial = new THREE.MeshPhongMaterial();
  var mainCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  mainCube.position.set(0.0, 0.0, 2);
  
  var cube = createCube(2, 5, 1);
  cube.translateX(2)
  cube.translateZ(-1)
  var cube2 = createCube(2, 5, 1);
  cube2.translateX(-2)
  cube2.translateZ(-1)
  mainCube.add(cube);
  mainCube.add(cube2);
  scene.add(mainCube);
  // scene.add(cube2);

  // Use this to show information onscreen
  controls = new InfoBox();
    controls.add("Basic Scene");
    controls.addParagraph();
    controls.add("Use mouse to interact:");
    controls.add("* Left button to rotate");
    controls.add("* Right button to translate (pan)");
    controls.add("* Scroll to zoom in/out.");
    controls.show();

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

  render();
  function render()
  {
    stats.update(); // Update FPS
    trackballControls.update(); // Enable mouse movements
    // lightFollowingCamera(light, camera);
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
  }
}

function createCube(width, height, depth, parent){
    // Criando o kart
    var cubeGeometry = new THREE.BoxGeometry(width, height, depth);
    var cubeMaterial = new THREE.MeshPhongMaterial();
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // position the cube
    cube.position.set(0.0, 0.0, 0.0);
    // add the cube to the scene
    return cube;
}