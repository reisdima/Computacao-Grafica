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
    buildInterface();

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(25, 25);
    planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
    var planeMaterial = new THREE.MeshBasicMaterial({
        color: "rgba(150, 150, 150)",
        side: THREE.DoubleSide, // Determina quais lados do objeto devem ser renderizados
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // add the plane to the scene
    scene.add(plane);

    var sphereProperties = {
        x: 0,
        y: 0,
        z: 1,
        speed: 0.01,
    };
    var aux = {
        x: 0,
        y: 0,
        z: 1,
    };
    var posicaoFinal = {
        x: 0,
        y: 0,
        z: 1,
    };

    // create a sphere
    var material = new THREE.MeshNormalMaterial();
    var sphereGeometry = new THREE.SphereGeometry(1, 128, 128);
    var sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.set(
        sphereProperties.x,
        sphereProperties.y,
        sphereProperties.z
    );
    scene.add(sphere);

    // Listen window size changes
    window.addEventListener(
        "resize",
        function () {
            onWindowResize(camera, renderer);
        },
        false
    );

    function moveSphere() {
        if (
            sphereProperties.x != posicaoFinal.x ||
            sphereProperties.y != posicaoFinal.y ||
            sphereProperties.z != posicaoFinal.z
        ) {
            sphereProperties.x +=
                (posicaoFinal.x - sphereProperties.x) * sphereProperties.speed;
            sphereProperties.y +=
                (posicaoFinal.y - sphereProperties.y) * sphereProperties.speed;
            sphereProperties.z +=
                (posicaoFinal.z - sphereProperties.z) * sphereProperties.speed;
            console.log(sphereProperties);
            sphere.matrixAutoUpdate = false;
            sphere.matrix.identity();
            var mat4 = new THREE.Matrix4();
            sphere.matrix.multiply(
                mat4.makeTranslation(
                    sphereProperties.x,
                    sphereProperties.y,
                    sphereProperties.z
                )
            );
        }
    }

    function buildInterface() {
        var controls = new (function () {
            this.x = 0;
            this.y = 0;
            this.z = 1;
            this.speed = 0.5;

            this.move = function () {
                aux.x = this.x;
                aux.y = this.y;
                aux.z = this.z;
            };
        })();

        var obj = {
            Mover: function () {
                posicaoFinal.x = aux.x;
                posicaoFinal.y = aux.y;
                posicaoFinal.z = aux.z;
            },
        };

        // GUI interface
        var gui = new dat.GUI();
        gui.add(controls, "x", -11.5, 11.5)
            .onChange(function (e) {
                controls.move();
            })
            .name("X");
        gui.add(controls, "y", -11.5, 11.5)
            .onChange(function (e) {
                controls.move();
            })
            .name("Y");
        gui.add(controls, "z", -11.5, 11.5)
            .onChange(function (e) {
                controls.move();
            })
            .name("Z");
        gui.add(controls, "speed", 0, 1.5)
            .onChange(function (e) {
                controls.move();
            })
            .name("Speed");
        gui.add(obj, "Mover");
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

    render();
    function render() {
        stats.update(); // Update FPS
        trackballControls.update(); // Enable mouse movements
        moveSphere();
        requestAnimationFrame(render);
        renderer.render(scene, camera); // Render scene
    }
}
