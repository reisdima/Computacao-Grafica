function main() {
    var stats = initStats(); // To show FPS information
    var scene = new THREE.Scene(); // Create main scene
    var renderer = initRenderer(); // View function in util/utils
    var light = initDefaultLighting(scene, new THREE.Vector3(7, 7, 7));
    var clock = new THREE.Clock();
    var keyboard = new KeyboardState();

    var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
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
        polygonOffsetUnits: 1,
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    var wireframe = new THREE.WireframeGeometry(planeGeometry);
    var line = new THREE.LineSegments(wireframe);
    line.material.color.setStyle("rgb(180, 180, 180)");
    scene.add(line);
    //---------------------------------------------------------------------------------------

    // Variáveis para auxiliar no trabalho
    var posicaoFinal = {
        x: 0,
        y: 0,
        z: 2,
    };
    var rotacaoFinal = {
        x: 0,
        y: 0,
        z: 2,
    };
    var kartRotation = {
        x: 0,
        y: 0,
        z: 90,
    };
    var wheelsRotation = 0;
    var wheelsMaxRotation = 35;

    var kartBody = {};

    kartBody = createKart();
    var object = kartBody.object;
    var kart = kartBody.main.corpo;
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
        keyboardUpdate();
        // changeCamera(kart.position, kart.position, vectUp);
        moveObject(object);
        moveKart(object);
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
        let kart = {};

        var mainCube = createCube(4, 2, 1);
        mainCube.position.set(0.0, 0.0, 1.25);

        var frontCube = createCube(2, 1, 1);
        frontCube.position.set(2.5, 0.0, -0.35);

        var backCube = createCube(2, 1, 1);
        backCube.position.set(-2.5, 0.0, -0.35);

        mainCube.add(frontCube);
        mainCube.add(backCube);

        var supportFrontCube = createCube(5, 0.9, 1);
        supportFrontCube.position.set(1.5, 0, 0);
        supportFrontCube.rotation.set(0, 0, degreesToRadians(90));

        var supportBackCube = createCube(5, 1, 1);
        supportBackCube.position.set(-1.5, 0, 0);
        supportBackCube.rotation.set(0, 0, degreesToRadians(90));

        frontCube.add(supportFrontCube);
        backCube.add(supportBackCube);

        var frontWheels = createWheels();
        frontWheels.cylinder.position.set(-0.4, -0.03, 0.0);

        // frontWheels.translateX(2);
        var backWheels = createWheels();
        backWheels.cylinder.position.set(-0.01, -0.01, 0.0);

        mainCube.rotation.set(0, 0, degreesToRadians(90));
        // mainCube.add(frontWheels);
        frontCube.add(frontWheels.cylinder);
        backCube.add(backWheels.cylinder);
        // mainCube.add(backWheels);

        //suporte aerofolio

        var supAero1 = createCube(0.2, 1, 1);
        supAero1.position.set(1.0, -0.001, 1);
        supportBackCube.add(supAero1);

        var supAero2 = createCube(0.2, 1, 1);
        supAero2.position.set(-1.0, -0.001, 1);
        supportBackCube.add(supAero2);

        //aerofolio

        var aero = createCube(1, 0.1, 5);
        aero.position.set(-1, 0, 0.52);
        aero.rotation.set(
            degreesToRadians(90),
            degreesToRadians(90),
            degreesToRadians(5)
        );
        supAero1.add(aero);

        //bico

        var bico = createCube(1, 0.1, 3);
        bico.position.set(0, 1.0, 0.75);
        bico.rotation.set(
            degreesToRadians(95),
            degreesToRadians(0),
            degreesToRadians(0)
        );
        supportFrontCube.add(bico);

        kart.corpo = mainCube;
        kart.eixoFrontal = frontWheels;

        return {
            main: kart,
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
        leftWheel.position.set(0, cylinderHeight / 2 - tube, 0);

        const rightWheel = createTorus(torusRadius, tube, segments, segments);
        rightWheel.position.set(0, -(cylinderHeight / 2 - tube), 0);
        rightWheel.rotation.set(degreesToRadians(90), 0, 0);

        cylinder.add(leftWheel);
        cylinder.add(rightWheel);

        let wheels = {
            cylinder,
            leftWheel,
            rightWheel,
        };

        return wheels;
    }

    function moveObject(object) {
        if (!object) return;
        object.position.set(posicaoFinal.x, posicaoFinal.y, posicaoFinal.z);
        object.rotation.set(
            degreesToRadians(rotacaoFinal.x),
            degreesToRadians(rotacaoFinal.y),
            degreesToRadians(rotacaoFinal.z)
        );
    }

    function moveKart() {
        kart.rotation.set(
            degreesToRadians(kartRotation.x),
            degreesToRadians(kartRotation.y),
            degreesToRadians(kartRotation.z)
        );
        kartBody.main.eixoFrontal.leftWheel.rotation.set(
            kartBody.main.eixoFrontal.leftWheel.rotation.x,
            degreesToRadians(wheelsRotation),
            degreesToRadians(0)
        );
        kartBody.main.eixoFrontal.rightWheel.rotation.set(
            kartBody.main.eixoFrontal.rightWheel.rotation.x,
            degreesToRadians(wheelsRotation),
            degreesToRadians(0)
        );
    }

    function buildInterface(object) {
        var controls = new (function () {
            this.x = object ? object.position.x : 0;
            this.y = object ? object.position.y : 0;
            this.z = object ? object.position.z : 0;
            this.rotationX = object ? object.rotation.x : 0;
            this.rotationY = object ? object.rotation.y : 0;
            this.rotationZ = object ? object.rotation.z : 0;

            this.move = function () {
                posicaoFinal.x = this.x;
                posicaoFinal.y = this.y;
                posicaoFinal.z = this.z;
            };
            this.rotate = function () {
                rotacaoFinal.x = this.rotationX;
                rotacaoFinal.y = this.rotationY;
                rotacaoFinal.z = this.rotationZ;
            };
        })();

        var obj = {
            Botao: function () {
                console.log("Apertou no botão");
            },
        };

        // GUI interface
        var gui = new dat.GUI();
        // Movimento
        gui.add(controls, "x", -7.0, 5.0)
            .onChange(function (e) {
                controls.move();
            })
            .name("X");
        gui.add(controls, "y", -7.0, 5.0)
            .onChange(function (e) {
                controls.move();
            })
            .name("Y");
        gui.add(controls, "z", -7.0, 5.0)
            .onChange(function (e) {
                controls.move();
            })
            .name("Z");
        // Rotação
        gui.add(controls, "rotationX", -180, 180)
            .onChange(function (e) {
                controls.rotate();
            })
            .name("rotationX");
        gui.add(controls, "rotationY", -180, 180)
            .onChange(function (e) {
                controls.rotate();
            })
            .name("rotationY");
        gui.add(controls, "rotationZ", -180, 180)
            .onChange(function (e) {
                controls.rotate();
            })
            .name("rotationZ");
        gui.add(obj, "Botao");
    }

    function keyboardUpdate() {
        keyboard.update();

        var speed = 30;
        var cameraStep = 0.5;
        var rotationSpeed = 2;
        var rotationWheelsSpeed = 6;
        var moveDistance = speed * clock.getDelta();

        // Kart control
        if (keyboard.pressed("W")) kart.translateX(moveDistance);
        if (keyboard.pressed("S")) kart.translateX(-moveDistance);
        if (keyboard.pressed("A")) {
            kartRotation.z += rotationSpeed;
            if(Math.abs(wheelsRotation) < Math.abs(wheelsMaxRotation)){
                wheelsRotation += rotationWheelsSpeed;
            }
        }
        else if (keyboard.pressed("D")) {
            kartRotation.z -= rotationSpeed;
            if(Math.abs(wheelsRotation) < Math.abs(wheelsMaxRotation)){
                wheelsRotation -= rotationWheelsSpeed;
            }
        }
        else {
            if(wheelsRotation != 0){
                let factor = wheelsRotation > 0 ? -1 : 1;
                wheelsRotation += rotationSpeed * factor * 2;
            }
        }
        // Reset Kart
        if (keyboard.pressed("space")) kart.position.set(0.0, 0.0, 2.0);

        // Camera control
        if (keyboard.pressed("left")) {
            cameraPosition.add(new THREE.Vector3(-cameraStep, 0, 0));
        }
        if (keyboard.pressed("right")) {
            cameraPosition.add(new THREE.Vector3(cameraStep, 0, 0));
        }
        if (keyboard.pressed("up")) {
            cameraPosition.add(new THREE.Vector3(0, cameraStep, 0));
        }
        if (keyboard.pressed("down")) {
            cameraPosition.add(new THREE.Vector3(0, -cameraStep, 0));
        }
    }

    function changeCamera(position, look, up) {
        camera.position.set(position.x, position.y - 30, cameraPosition.z);
        camera.lookAt(look);
        camera.up.set(up.x, up.y, up.z);
        // return camera;
    }
}
