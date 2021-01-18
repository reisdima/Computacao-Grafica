/**
 * Exercício sobre projeções e câmera virtual
 * Semana 2
 */

function main() {
    // Valores de controle da câmera

    var camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    var cameraPosition = new THREE.Vector3(0, -30, 15);
    var cameraDirection = new THREE.Vector3(0, 0, 0);

    var cameraVectorUpX = 0;
    var cameraVectorUpY = 0;
    var cameraVectorUpZ = 1;
    var vectUp = {
        x: cameraVectorUpX,
        y: cameraVectorUpY,
        z: cameraVectorUpZ,
    };
    changeCamera(cameraPosition, cameraDirection, vectUp);

    var stats = initStats(); // To show FPS information
    var scene = new THREE.Scene(); // Create main scene
    var renderer = initRenderer(); // View function in util/utils
    //   var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
    var clock = new THREE.Clock();

    // Show text information onscreen
    var information = showInformation();

    // To use the keyboard
    var keyboard = new KeyboardState();

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
    planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
    var planeMaterial = new THREE.MeshBasicMaterial({
        color: "rgb(150, 150, 150)",
        side: THREE.DoubleSide,
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // add the plane to the scene
    scene.add(plane);

    // create a cube
    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // position the cube
    cube.position.set(0.0, 0.0, 2.0);
    // add the cube to the scene
    scene.add(cube);

    // Listen window size changes
    window.addEventListener(
        "resize",
        function () {
            onWindowResize(camera, renderer);
        },
        false
    );

    render();

    function keyboardUpdate() {
        keyboard.update();

        var step = 0.5;
        let up = vectUp.x;

        if (keyboard.pressed("left")) {
            cameraPosition.add(new THREE.Vector3(-step, 0, 0));
        }
        if (keyboard.pressed("right")) {
            cameraPosition.add(new THREE.Vector3(step, 0, 0));
        }
        if (keyboard.pressed("up")) {
            cameraPosition.add(new THREE.Vector3(0, 0, step));
        }
        if (keyboard.pressed("down")) {
            cameraPosition.add(new THREE.Vector3(0, 0, -step));
        }

        if (keyboard.pressed("A")) {
            cameraDirection.add(new THREE.Vector3(-step, 0, 0));
        }
        if (keyboard.pressed("D")) {
            cameraDirection.add(new THREE.Vector3(step, 0, 0));
        }
        if (keyboard.pressed("W")) {
            cameraDirection.add(new THREE.Vector3(0, 0, step));
        }
        if (keyboard.pressed("S")) {
            cameraDirection.add(new THREE.Vector3(0, 0, -step));
        }

        if (keyboard.pressed("Q")) {
            up += 0.1;
            if (up >= 1) {
                up = 1;
            }
            vectUp.x = up;
            vectUp.z = 1 - Math.abs(up);
        }
        if (keyboard.pressed("E")) {
            up -= 0.1;
            if (up <= 0) {
                up = 0;
            }
            vectUp.x = up;
            vectUp.z = 1 - Math.abs(up);
        }
    }

    function showInformation() {
        var secundaryBox = new SecondaryBox("...");
        secundaryBox.changeMessage(
            "Pos: " +
                cameraPosition.x.toFixed(1) +
                " " +
                cameraPosition.y.toFixed(1) +
                " " +
                cameraPosition.z.toFixed(1) +
                "  Look: " +
                cameraDirection.x.toFixed(1) +
                " " +
                cameraDirection.y.toFixed(1) +
                " " +
                cameraDirection.z.toFixed(1) +
                "  Up: " +
                vectUp.x.toFixed(1) +
                " " +
                vectUp.y.toFixed(1) +
                " " +
                vectUp.z.toFixed(1)
        );
        return secundaryBox;
    }

    function render() {
        stats.update(); // Update FPS
        requestAnimationFrame(render); // Show events
        trackballControls.update();
        keyboardUpdate();
        information.changeMessage(
            "Pos: " +
                cameraPosition.x.toFixed(1) +
                " " +
                cameraPosition.y.toFixed(1) +
                " " +
                cameraPosition.z.toFixed(1) +
                "  Look: " +
                cameraDirection.x.toFixed(1) +
                " " +
                cameraDirection.y.toFixed(1) +
                " " +
                cameraDirection.z.toFixed(1) +
                "  Up: " +
                vectUp.x.toFixed(1) +
                " " +
                vectUp.y.toFixed(1) +
                " " +
                vectUp.z.toFixed(1)
        );
        changeCamera(cameraPosition, cameraDirection, vectUp);
        renderer.render(scene, camera); // Render scene
    }

    /**
     * Função copiada do arquivo /libs/util/util.js, chamada initCamera
     * O objetivo é utilizar variáveis globais, ao invés dos valores padrões.
     *
     */
    function changeCamera(position, look, up) {
        camera.position.copy(position);
        camera.lookAt(look);
        camera.up.set(up.x, up.y, up.z);
        // return camera;
    }
}
