function main() {
    var stats = initStats(); // To show FPS information
    var scene = new THREE.Scene(); // Create main scene
    var renderer = initRenderer(); // View function in util/utils
    var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
    var light = initDefaultLighting(scene, new THREE.Vector3(7, 7, 7));

    // Enable mouse rotation, pan, zoom etc.
    var trackballControls = new THREE.TrackballControls(
        camera,
        renderer.domElement
    );

    // Show axes (parameter is size of each axis)
    var axesHelper = new THREE.AxesHelper(12);
    scene.add(axesHelper);

   
  //---------------------------------------------------------------------------------------
  // create the ground plane with wireframe
  var planeGeometry = new THREE.PlaneGeometry(700, 700, 40, 40);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
      color: "rgba(20, 30, 110)",
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1, // positive value pushes polygon further away
      polygonOffsetUnits: 1
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  var wireframe = new THREE.WireframeGeometry( planeGeometry );
  var line = new THREE.LineSegments( wireframe );
  line.material.color.setStyle( "rgb(180, 180, 180)" );  
  scene.add(line);
  //---------------------------------------------------------------------------------------

    var posicaoFinal = {
        x: 0,
        y: 0,
        z: 2,
    };

    var kart = createKart();
    var object = kart.object;
    kart = kart.main;
    scene.add(kart);
    buildInterface(object);

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
        // lightFollowingCamera(light, camera);
        moveObject(object);
        requestAnimationFrame(render);
        renderer.render(scene, camera); // Render scene
    }

    function createCube(width, height, depth, parent) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial();
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
        const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
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
        const material = new THREE.MeshPhongMaterial();
        const torus = new THREE.Mesh(geometry, material);
        torus.position.set(0.0, 0.0, 0.0);
        return torus;
    }

    function createKart() {
        var mainCube = createCube(4, 2, 1);
        mainCube.position.set(0.0, 0.0, 1.25);
        
        // var cube = createCube(1, 3, 1);
        // cube.translateX(2);
        // cube.translateZ(-1);
        
        // var cube2 = createCube(1, 3, 1);
        // cube2.translateX(-2);
        // cube2.translateZ(-1);
        
        var frontWheels = createWheels();
        frontWheels.position.set(2.0, 0.0, -0.5);
        // frontWheels.translateX(2);
        var backWheels = createWheels();
        backWheels.position.set(-2.0, 0.0, -0.5);
        
        // mainCube.add(cube);
        // mainCube.add(cube2);
        mainCube.add(frontWheels);
        mainCube.add(backWheels);
        return {
            main: mainCube,
            object: null,
        };
    }

    function createWheels() {
        let cylinderRadius = 0.25;
        let cylinderHeight = 4.5;
        let torusRadius = 0.5;
        let segments = 32;
        let tube = 0.25;
        const cylinder = createCylinder(
            cylinderRadius,
            cylinderRadius,
            cylinderHeight,
            segments
        );
        const leftWheel = createTorus(torusRadius, tube, segments, segments);
        leftWheel.rotation.set(degreesToRadians(90), 0, 0);
        leftWheel.position.set(0, cylinderHeight/2 - tube, 0);

        const rightWheel = createTorus(torusRadius, tube, segments, segments);
        rightWheel.position.set(0, -(cylinderHeight/2 - tube), 0);
        rightWheel.rotation.set(degreesToRadians(90), 0, 0);

        cylinder.add(leftWheel);
        cylinder.add(rightWheel);
        return cylinder;
    }

    function moveObject(object) {
        if (!object) return;
        object.position.set(posicaoFinal.x, posicaoFinal.y, posicaoFinal.z);
    }

    function buildInterface(object) {
        var controls = new (function () {
            this.x = object ? object.position.x : 0;
            this.y = object ? object.position.y : 0;
            this.z = object ? object.position.z : 0;

            this.move = function () {
                posicaoFinal.x = this.x;
                posicaoFinal.y = this.y;
                posicaoFinal.z = this.z;
            };
        })();

        var obj = {
            Botao: function () {
                console.log("Apertou no botão");
            },
        };

        // GUI interface
        var gui = new dat.GUI();
        gui.add(controls, "x", -5.0, 5.0)
            .onChange(function (e) {
                controls.move();
            })
            .name("X");
        gui.add(controls, "y", -5.0, 5.0)
            .onChange(function (e) {
                controls.move();
            })
            .name("Y");
        gui.add(controls, "z", -5.0, 5.0)
            .onChange(function (e) {
                controls.move();
            })
            .name("Z");
        gui.add(obj, "Botao");
    }
}
