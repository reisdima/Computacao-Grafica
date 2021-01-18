function main() {
  var stats = initStats(); // To show FPS information
  var scene = new THREE.Scene(); // Create main scene
  var renderer = initRenderer(); // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls(
    camera,
    renderer.domElement
  );

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper(12);
  scene.add(axesHelper);

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(20, 20);
  planeGeometry.translate(10.0, 10.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
    color: "rgba(150, 150, 150)",
    side: THREE.DoubleSide, // Determina quais lados do objeto devem ser renderizados
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // add the plane to the scene
  scene.add(plane);

  let material = new THREE.MeshNormalMaterial();
  let length = 4;
  let width = 4;
  let height = 4;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let geometry = new THREE.BoxGeometry(length, width, height);
      let cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        length * j + length / 2 + j*length,
        width * i + width / 2 + i*width,
        height / 2
      );
      scene.add(cube);
    }
  }

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
  window.addEventListener(
    "resize",
    function () {
      onWindowResize(camera, renderer);
    },
    false
  );

  render();
  function render() {
    stats.update(); // Update FPS
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera); // Render scene
  }
}
