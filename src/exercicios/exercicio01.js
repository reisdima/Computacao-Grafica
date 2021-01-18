function main()
{
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position

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
      side: THREE.DoubleSide, // Determina quais lados do objeto devem ser renderizados
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // add the plane to the scene
  scene.add(plane);

  // create a cube
  var cubeMaterial = new THREE.MeshNormalMaterial();

  var cubeGeometry = new THREE.BoxGeometry(2, 4, 4);
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  cubeGeometry = new THREE.BoxGeometry(6, 4, 4);
  var cube1 = new THREE.Mesh(cubeGeometry, cubeMaterial);

  cubeGeometry = new THREE.BoxGeometry(2, 4, 4);
  var cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);

  // position the cube
  cube.position.set(-3.0, 0.0, 2.0);
  cube1.position.set(0.0, 0.0, 6.0);
  cube2.position.set(3.0, 0.0, 2.0);
  // add the cube to the scene
  scene.add(cube);
  scene.add(cube1);
  scene.add(cube2);

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
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
  }
}
