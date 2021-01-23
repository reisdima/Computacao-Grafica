function main() {
    var stats = initStats(); // To show FPS information
    var scene = new THREE.Scene(); // Create main scene
    var renderer = initRenderer(); // View function in util/utils
    var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
    var light = initDefaultLighting(scene, new THREE.Vector3(7, 7, 7));
    var clock = new THREE.Clock();
    var keyboard = new KeyboardState();

    var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
    var cameraPosition = new THREE.Vector3(0, -30, 15);
    var cameraDirection = new THREE.Vector3(0, 0, 0);
    var vectUp = {
        x: 0,
        y: 0,
        z: 1,
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
    // var kartRotation = {
    //     x: 0,
    //     y: 0,
    //     z: 90,
    // };
    var kartRotation = 0;
    var wheelsRotation = 0;
    var wheelsMaxRotation = 35;
    var cameraRotation = 0;

    var kartBody = {};
    var kartSpeed = 0;

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
        changeCamera(kart.position, kart.position, vectUp);
        moveObject(object);
        moveKart();
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

    function createCubeColor(width, height, depth, parent) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({ color: parent });
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
        const material = new THREE.MeshPhongMaterial({ color: "#fffff" });
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
        const material = new THREE.MeshPhongMaterial({ color: color });
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
        const material = new THREE.MeshPhongMaterial({ color: "#000000" });
        const torus = new THREE.Mesh(geometry, material);
        torus.position.set(0.0, 0.0, 0.0);
        return torus;
    }

    function createKart() {
        var mainCube = createCubeColor(4, 2, 1, "#000000");
        mainCube.position.set(0.0, 0.0, 1.25);

        //separacao pro banco
        var part1 = createCubeColor(4, 0.0001, 0.91, "#000000");
        part1.position.set(0, 1, 0.5);
        mainCube.add(part1);

        var part2 = createCubeColor(4, 0.0001, 0.91, "#000000");
        part2.position.set(0, -1, 0.5);
        mainCube.add(part2);

        var part3 = createCubeColor(2.0, 0.0001, 0.91, "#000000");
        part3.position.set(-2, 0, 0.5);
        part3.rotation.set(0, 0, degreesToRadians(90));
        mainCube.add(part3);

        var part4 = createCubeColor(2.0, 0.0001, 0.91, "#000000");
        part4.position.set(2, 0, 0.5);
        part4.rotation.set(0, 0, degreesToRadians(90));
        mainCube.add(part4);

        //cadeira assento
        var assento = createCubeColor(2.0, 0.1, 1.5, "#fffff");
        assento.position.set(-0.95, 0, 0.55);
        assento.rotation.set(degreesToRadians(90), 0, 0);
        mainCube.add(assento);

        //cadeira encosto

        var encosto = createCubeColor(1.5, 0.1, 0.91, "#fffff");
        encosto.position.set(-1.9, 0, 1);
        encosto.rotation.set(0, 0, degreesToRadians(90));
        mainCube.add(encosto);

        var frontCube = createCubeColor(2, 1, 1, "#1eff00");
        frontCube.position.set(2.5, 0.0, -0.35);

        var backCube = createCubeColor(2, 1, 1, "#1eff00");
        backCube.position.set(-2.5, 0.0, -0.35);

        mainCube.add(frontCube);
        mainCube.add(backCube);

        var supportFrontCube = createCubeColor(5, 0.75, 1.1, "#000000");
        supportFrontCube.position.set(1.0, 0, 0);
        supportFrontCube.rotation.set(0, 0, degreesToRadians(90));

        var supportBackCube = createCubeColor(5, 1, 1, "#000000");
        supportBackCube.position.set(-6.5, 0, 0);
        supportBackCube.rotation.set(0, 0, degreesToRadians(90));

        frontCube.add(supportFrontCube);

        frontCube.add(supportBackCube);

        // var cube = createCube(1, 3, 1);
        // cube.translateX(2);
        // cube.translateZ(-1);

        // var cube2 = createCube(1, 3, 1);
        // cube2.translateX(-2);
        // cube2.translateZ(-1);

        var frontWheels = createWheels();
        frontWheels.cylinder.position.set(-0.2, -0.03, 0.0);

        // frontWheels.translateX(2);
        var backWheels = createWheels();
        backWheels.cylinder.position.set(-0.01, -0.01, 0.0);

        mainCube.rotation.set(0, 0, degreesToRadians(90));
        // mainCube.add(frontWheels);
        frontCube.add(frontWheels.cylinder);
        backCube.add(backWheels.cylinder);
        // mainCube.add(backWheels);

        //suporte aerofolio

        var supAero1 = createCubeColor(0.2, 1, 1, "#fffff");
        supAero1.position.set(1.0, -0.001, 1);
        supportBackCube.add(supAero1);

        var supAero2 = createCubeColor(0.2, 1, 1, "#fffff");
        supAero2.position.set(-1.0, -0.001, 1);
        supportBackCube.add(supAero2);

        //aerofolio

        var aero = createCubeColor(1, 0.1, 5, "#00ff08");
        aero.position.set(-1, 0, 0.52);
        aero.rotation.set(
            degreesToRadians(90),
            degreesToRadians(90),
            degreesToRadians(5)
        );
        supAero1.add(aero);

        /* //suporte bico
        var supportBico = createCubeColor(0.5,0.8,0.2, '#000000');
        supportBico.position.set(-0.25, 0, 0.75);
        supportBico.rotation.set(0, 0, 0);
        frontCube.add(supportBico);
*/
        //bico

        var bico = createCubeColor(0.85, 0.08, 2.15, "#1eff00");
        bico.position.set(0, 0.6, 0.98);
        bico.rotation.set(
            degreesToRadians(-67.6),
            degreesToRadians(0),
            degreesToRadians(0)
        );
        supportFrontCube.add(bico);

        //tampo
        var tampo = createCubeColor(0.5, 1.99, 1, "#000000");
        tampo.position.set(1.47, 0, 0.8);
        tampo.rotation.set(0, degreesToRadians(90), 0);
        mainCube.add(tampo);

        //volante
        var volante = createVolante();
        volante.position.set(-0.25, 0.04, -1.1);
        volante.rotation.set(degreesToRadians(-90), 0, degreesToRadians(30));
        tampo.add(volante);

        //detalhes

        var detLeft = createCylinderColor(0.5, 0.5, 1, 3, "#00ba03");
        detLeft.position.set(0, 1.2, 0.04);
        detLeft.rotation.set(degreesToRadians(30), 0, degreesToRadians(90));
        mainCube.add(detLeft);

        var detRight = createCylinderColor(0.5, 0.5, 1, 3, "#00ba03");
        detRight.position.set(0, -1.2, -0.04);
        detRight.rotation.set(degreesToRadians(-30), 0, degreesToRadians(90));
        mainCube.add(detRight);

        let kart = {};
        kart.corpo = mainCube;
        kart.eixoFrontal = frontWheels;

        return {
            main: kart,
            object: null,
        };
    }

    function createVolante() {
        let cylinderRadius = 0.1;
        let cylinderHeight = 1.5;
        let torusRadius = 0.2;
        let segments = 32;
        let tube = 0.1;
        const cylinder = createCylinder(
            cylinderRadius,
            cylinderRadius,
            cylinderHeight,
            segments
        );
        const rodaVolante = createTorus(torusRadius, tube, segments, segments);
        rodaVolante.rotation.set(degreesToRadians(90), 0, 0);
        rodaVolante.position.set(0, cylinderHeight / 2 - tube, 0);

        cylinder.add(rodaVolante);
        return cylinder;
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
        // kart.rotation.set(
        // degreesToRadians(kartRotation.x),
        //     degreesToRadians(kartRotation.y),
        //     degreesToRadians(kartRotation.z)
        // );
        // kart.rotateOnAxis(new THREE.Vector3(0, 0, 1), kartRotation);
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
        var delta = clock.getDelta();

        var acceleration = 1;
        var maxSpeed = 70;
        var cameraStep = 0.5;
        var rotationSpeed = 2;
        var rotationWheelsSpeed = 6;
        var brakeAccelerationFactor = 1.2;

        var rotateAngle = degreesToRadians(2);

        // Movimentação do kart
        if (keyboard.pressed("W") && kartSpeed < maxSpeed) {
            kartSpeed += acceleration;
        } else if (keyboard.pressed("S") && kartSpeed > -maxSpeed) {
            kartSpeed -= acceleration * brakeAccelerationFactor * 1.2;
        } else if (kartSpeed != 0) {
            if (kartSpeed > -1 && kartSpeed < 1) {
                kartSpeed = 0;
            } else {
                kartSpeed +=
                    acceleration * kartSpeed < 0
                        ? brakeAccelerationFactor
                        : -brakeAccelerationFactor;
            }
        }
        var moveDistance = kartSpeed * delta;
        kart.translateX(moveDistance);

        if (keyboard.pressed("A")) {
            if(kartSpeed != 0){
                cameraRotation -= rotateAngle;
                kart.rotateOnAxis(new THREE.Vector3(0, 0, 1), rotateAngle);
            }
            if (Math.abs(wheelsRotation) < Math.abs(wheelsMaxRotation)) {
                wheelsRotation += rotationWheelsSpeed;
            }
        } else if (keyboard.pressed("D")) {
            if(kartSpeed != 0){
                cameraRotation += rotateAngle;
                kart.rotateOnAxis(new THREE.Vector3(0, 0, 1), -rotateAngle);
            }
            if (Math.abs(wheelsRotation) < Math.abs(wheelsMaxRotation)) {
                wheelsRotation -= rotationWheelsSpeed;
            }
        } else {
            if (wheelsRotation != 0) {
                let factor = wheelsRotation > 0 ? -1 : 1;
                wheelsRotation += rotationSpeed * factor * 2;
            }
        }
        // Reset Kart
        // if (keyboard.pressed("space")) kart.position.set(0.0, 0.0, 2.0);

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
        var rotY = Math.cos(cameraRotation);
        var rotX = Math.sin(cameraRotation);
        var distance = 50;
        camera.position.x = position.x - distance * rotX;
        camera.position.y = position.y - distance * rotY;

        // camera.position.set(position.x, position.y - 30, cameraPosition.z);
        camera.lookAt(look);
        camera.up.set(up.x, up.y, up.z);
        // return camera;
    }
}
