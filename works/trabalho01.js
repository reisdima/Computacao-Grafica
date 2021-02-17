function main() {
    var stats = initStats(); // Mostra fps
    var scene = new THREE.Scene(); // Cria cena principal
    var renderer = initRenderer();
    renderer.shadowMap.enabled = true;
    var spotLight = createSpotLight();
    var directionalLight = createDirectionalLight();
    var clock = new THREE.Clock();
    var keyboard = new KeyboardState();

    var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Inicia camera in this position
    var cameraPosition = new THREE.Vector3(0, -30, 15);
    var cameraDirection = new THREE.Vector3(0, 0, 0);
    var vectUp = {
        x: 0,
        y: 0,
        z: 1,
    };
    moveCamera(cameraPosition, cameraDirection, vectUp);

    // Enable mouse rotation, pan, zoom etc.
    var trackballControls = new THREE.TrackballControls(
        camera,
        renderer.domElement
    );

    // Mostra eixos
    //var axesHelper = new THREE.AxesHelper(12);
    //scene.add(axesHelper);

    //Inicio Criacao do Plano

    var planeGeometry = new THREE.PlaneGeometry(700, 700, 40, 40);
    planeGeometry.translate(0.0, 0.0, -0.02);
    // var planeMaterial = new THREE.MeshPhongMaterial({
    var planeMaterial = new THREE.MeshPhongMaterial({
        color: "rgba(20, 30, 110)",
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.castShadow = true;
    plane.receiveShadow = true;
    scene.add(plane);

    var wireframe = new THREE.WireframeGeometry(planeGeometry);
    var line = new THREE.LineSegments(wireframe);
    line.material.color.setStyle("rgb(180, 180, 180)");
    // scene.add(line);
    //Fim Criacao do Plano

    // Variáveis para auxiliar no trabalho
    var objectPosicaoFinal = {
        x: 0,
        y: 0,
        z: 2,
    };
    var objectRotacaoFinal = {};
    var center = new THREE.Vector3(0, 0, 1.75);

    var kartProps = {
        initialPosition: new THREE.Vector3(-5, -245, 1.75),
        // initialPosition: new THREE.Vector3(0, 0, 1.75),
        currentPosition: new THREE.Vector3(0, 0, 1.75),
        angleRotationZ: 90,
        currentSpeed: 0,
        wheelsRotations: 6,
        acceleration: 1,
        maxSpeed: 70,
        rotationSpeed: 2,
        wheelsSpeedRotation: 6,
        brakeAccelerationFactor: 1.2,
        rotateAngle: 2,
    };

    var wheelsRotation = 0;
    var wheelsMaxRotation = 35;
    var cameraRotation = 0;
    var kartRotation = 0;
    var gameMode = true;

    var kartBody = {};
    var kartSpeed = 0;

    kartBody = createKart();
    var kart = kartBody.corpo;
    scene.add(kart);
    scene.add(spotLight);
    spotLight.target = kart;
    scene.add(directionalLight);
    var postesOn = true;
    var spotLightOn = true;
    var direcitonalLightOn = true;

    //--------------------------------- Criar Montanhas //---------------------------------//

    //propiedades do objeto
    var objColor = "rgb(100, 70, 20)";
    var objOpacity = 1;

    // Object Material
    var objectMaterial = new THREE.MeshLambertMaterial({
        color: objColor,
        opacity: objOpacity,
    });

    //----------------------------------
    // Create Convex Geometry
    //----------------------------------
    var sphereGeom = new THREE.SphereGeometry(0.2); // Sphere to represent points
    var sphereMaterial = new THREE.MeshPhongMaterial({
        color: "rgb(255,255,0)",
    });

    // Global variables to be removed from memory each interaction
    var pointCloud = null;
    var spGroup = null;
    var convexGeometry = null;
    var pointCloudVisibility = true;
    var objectVisibility = true;
    var castShadow = true;

    // Create convex object the first time
    var montanhas = criaMontanhaUm();
    montanhas.forEach((montanha) => {
        scene.add(montanha);
    });

    // criacao dos postes de luz
    // let poste = createPoste(new THREE.Vector3(20, -260, 10.5));
    var postes = [];
    // postes.push(poste);

    postes.push(createPoste(new THREE.Vector3(20, -260, 10.5)));
    postes.push(createPoste(new THREE.Vector3(-20, -260, 10.5)));
    postes.push(createPoste(new THREE.Vector3(-10, -260, 10.5)));
    postes.push(createPoste(new THREE.Vector3(-40, -260, 10.5)));
    postes.push(createPoste(new THREE.Vector3(40, -260, 10.5)));
    postes.push(createPoste(new THREE.Vector3(60, -260, 10.5)));
    postes.push(createPoste(new THREE.Vector3(80, -260, 10.5)));
    postes.push(createPoste(new THREE.Vector3(-60, -260, 10.5)));

    postes.forEach((obj) => {
        scene.add(obj);
    });

    buildInterface();

    var information = showInformation();

    // Use this to show information onscreen

    controls = new InfoBox();
    controls.add("Comandos Modo Jogo");
    controls.add("Use as setas para movimentar o kart");
    controls.add("Use o scroll do mouse/botao esquerdo para dar zoom");
    controls.addParagraph();
    controls.add("Comandos Modo Inspeção");
    controls.add("Use o mouse para inspecionar o carro");
    controls.add("Use o scroll do mouse para dar zoom");
    controls.addParagraph();
    controls.add("Aperte Espaço para Trocar de Modo");
    controls.show();

    // Listen window size changes
    window.addEventListener(
        "resize",
        function () {
            onWindowResize(camera, renderer);
        },
        false
    );
    //---------------------------------------------------------
    // Load external objects
    var estatua = null;
    loadOBJFile("assets/", "Format_obj", true, 25);

    function loadOBJFile(modelPath, modelName, visibility, desiredScale) {
        currentModel = modelName;

        var manager = new THREE.LoadingManager();

        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setPath(modelPath);
        mtlLoader.load(modelName + ".mtl", function (materials) {
            materials.preload();

            var objLoader = new THREE.OBJLoader(manager);
            objLoader.setMaterials(materials);
            objLoader.setPath(modelPath);
            objLoader.load(
                modelName + ".obj",
                function (obj) {
                    obj.name = modelName;
                    obj.visible = visibility;
                    // Set 'castShadow' property for each children of the group
                    obj.traverse(function (child) {
                        child.castShadow = true;
                    });

                    obj.traverse(function (node) {
                        if (node.material)
                            node.material.side = THREE.DoubleSide;
                    });

                    var obj = normalizeAndRescale(obj, desiredScale);
                    var obj = fixPosition(obj);

                    obj.rotation.set(
                        degreesToRadians(90),
                        degreesToRadians(-90),
                        0
                    );
                    obj.position.set(-290, 280, 0);
                    estatua = obj;
                    estatua.castShadow = true;
                    scene.add(estatua);
                },
                onProgress,
                onError
            );
        });
    }

    function onError() {}

    function onProgress(xhr, model) {
        if (xhr.lengthComputable) {
            var percentComplete = (xhr.loaded / xhr.total) * 100;
            //infoBox.changeMessage("Loading... " + Math.round( percentComplete, 2 ) + '% processed' );
        }
    }

    function fixPosition(obj) {
        // Fix position of the object over the ground plane
        var box = new THREE.Box3().setFromObject(obj);
        if (box.min.y > 0) obj.translateY(-box.min.y);
        else obj.translateY(-1 * box.min.y);
        return obj;
    }

    function normalizeAndRescale(obj, newScale) {
        var scale = getMaxSize(obj); // Available in 'utils.js'
        obj.scale.set(
            newScale * (1.0 / scale),
            newScale * (1.0 / scale),
            newScale * (1.0 / scale)
        );
        return obj;
    }

    render();
    function render() {
        stats.update(); // Update FPS
        keyboardUpdate();
        if (gameMode) {
            moveCamera(kart.position, kart.position, vectUp);
        } else {
            trackballControls.update(); // Enable mouse movements
        }
        moveKart();
        information.changeMessage(
            "Pos: " +
                kartProps.currentPosition.x.toFixed(1) +
                " " +
                kartProps.currentPosition.y.toFixed(1) +
                " " +
                kartProps.currentPosition.z.toFixed(1)
        );
        requestAnimationFrame(render);
        renderer.render(scene, camera); // Render scene
    }

    //Inicio funcoes para criar as formas basicas

    function createCubeColor(width, height, depth, parent) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({ color: parent });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.position.set(0.0, 0.0, 0.0);
        return cube;
    }

    function createCylinder(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
        color = "#ffffff"
    ) {
        const geometry = new THREE.CylinderGeometry(
            radiusTop,
            radiusBottom,
            height,
            radialSegments
        );
        const material = new THREE.MeshPhongMaterial({ color: color });
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.castShadow = true;
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
        const material = new THREE.MeshPhongMaterial({ color: "#3e403e" });
        const torus = new THREE.Mesh(geometry, material);
        torus.position.set(0.0, 0.0, 0.0);
        torus.castShadow = true;
        return torus;
    }

    function createPoste(position) {
        var poste = createCylinder(0.5, 0.5, 20, 0, "rgb(200,200,200)");
        poste.castShadow = true;
        poste.rotation.set(degreesToRadians(90), 0, 0);
        poste.position.copy(position);

        let lightSphere = createSphere(2, "yellow"); //.translateZ(10);
        lightSphere.translateY(12);
        poste.add(lightSphere);

        let lightColor = "rgb(255,255,255)";
        let pointLight = new THREE.PointLight(lightColor);
        pointLight.translateY(12);
        pointLight.castShadow = true;
        pointLight.distance = 350;
        pointLight.intensity = 0.5;
        pointLight.visible = true;
        pointLight.shadow.mapSize.width = 512; // default
        pointLight.shadow.mapSize.height = 512; // default
        pointLight.shadow.camera.near = 0.5; // default
        pointLight.shadow.camera.far = 500; // default
        poste.add(pointLight);
        poste.light = pointLight;

        return poste;
    }

    // Gerador do elemento esfera
    function createSphere(radius, color) {
        const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({ color: color });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        // sphere.castShadow = true;
        return sphere;
    }
    function setPointLight(light, position) {
        light.position.copy(position);
        light.name = "Point Light";
        light.castShadow = true;
        light.visible = true;

        return light;
    }

    // fim funcoes para criar as formas basicas

    // funcao para criar o kart e suas partes
    function createKart() {
        var mainCube = createCubeColor(4, 2, 1, "#3e403e");
        mainCube.position.copy(kartProps.initialPosition);

        //separacao pro banco
        var part1 = createCubeColor(4, 0.0001, 0.91, "#3e403e");
        part1.position.set(0, 1, 0.5);
        mainCube.add(part1);

        var part2 = createCubeColor(4, 0.0001, 0.91, "#3e403e");
        part2.position.set(0, -1, 0.5);
        mainCube.add(part2);

        var part3 = createCubeColor(2.0, 0.0001, 0.91, "#3e403e");
        part3.position.set(-2, 0, 0.5);
        part3.rotation.set(0, 0, degreesToRadians(90));
        mainCube.add(part3);

        var part4 = createCubeColor(2.0, 0.0001, 0.91, "#3e403e");
        part4.position.set(2, 0, 0.5);
        part4.rotation.set(0, 0, degreesToRadians(90));
        mainCube.add(part4);

        //cadeira assento
        var assento = createCubeColor(2.0, 0.1, 1.5, "#ffffff");
        assento.position.set(-0.95, 0, 0.55);
        assento.rotation.set(degreesToRadians(90), 0, 0);
        mainCube.add(assento);

        //cadeira encosto

        var encosto = createCubeColor(1.5, 0.1, 0.91, "#ffffff");
        encosto.position.set(-1.9, 0, 1);
        encosto.rotation.set(0, 0, degreesToRadians(90));
        mainCube.add(encosto);

        //cubo da frente
        var frontCube = createCubeColor(2, 1, 1, "#1eff00");
        frontCube.position.set(2.5, 0.0, -0.35);

        //cubo de tras
        var backCube = createCubeColor(2, 1, 1, "#1eff00");
        backCube.position.set(-2.5, 0.0, -0.35);

        mainCube.add(frontCube);
        mainCube.add(backCube);

        //adicionado suporte para o bico
        var supportFrontCube = createCubeColor(5, 0.75, 1.1, "#3e403e");
        supportFrontCube.position.set(1.0, 0, 0);
        supportFrontCube.rotation.set(0, 0, degreesToRadians(90));

        //adicionado suporte para colocar o aerofolio
        var supportBackCube = createCubeColor(5, 1, 1, "#3e403e");
        supportBackCube.position.set(-6.5, 0, 0);
        supportBackCube.rotation.set(0, 0, degreesToRadians(90));

        frontCube.add(supportFrontCube);

        frontCube.add(supportBackCube);

        //criacao das rodas
        var frontWheels = createRoda();
        frontWheels.cylinder.position.set(-0.2, -0.03, 0.0);

        var backWheels = createRoda();
        backWheels.cylinder.position.set(-0.01, -0.01, 0.0);

        // mainCube.rotation.set(0, 0, degreesToRadians(90));

        frontCube.add(frontWheels.cylinder);
        backCube.add(backWheels.cylinder);

        //suporte aerofolio

        var supAero1 = createCubeColor(0.2, 1, 1, "#ffffff");
        supAero1.position.set(1.0, -0.001, 1);
        supportBackCube.add(supAero1);

        var supAero2 = createCubeColor(0.2, 1, 1, "#ffffff");
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
        var tampo = createCubeColor(0.5, 1.99, 1, "#3e403e");
        tampo.position.set(1.47, 0, 0.8);
        tampo.rotation.set(0, degreesToRadians(90), 0);
        mainCube.add(tampo);

        //volante
        var volante = createVolante();
        volante.position.set(-0.25, 0.04, -1.1);
        volante.rotation.set(degreesToRadians(-90), 0, degreesToRadians(30));
        tampo.add(volante);

        //detalhes das laterais

        var detLeft = createCylinder(0.5, 0.5, 1, 3, "#00ba03");
        detLeft.position.set(0, 1.2, 0.04);
        detLeft.rotation.set(degreesToRadians(30), 0, degreesToRadians(90));
        mainCube.add(detLeft);

        var detRight = createCylinder(0.5, 0.5, 1, 3, "#00ba03");
        detRight.position.set(0, -1.2, -0.04);
        detRight.rotation.set(degreesToRadians(-30), 0, degreesToRadians(90));
        mainCube.add(detRight);

        let kart = {};
        kart.corpo = mainCube;
        kart.eixoFrontal = frontWheels;

        // return {
        //   main: kart,
        //   object: null,
        // };
        return kart;
    }
    // criacao do volante
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

    //criacao das rodas
    function createRoda() {
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

    // fim funcao para criar kart e suas partes

    function generatePoints(value) {
        var points = [];

        //base
        points.push(new THREE.Vector3(value + 5, value + 35, 0));
        points.push(new THREE.Vector3(value + 2, -value - 35, 0));
        points.push(new THREE.Vector3(-value - 25, -value - 55, 0));
        points.push(new THREE.Vector3(value + 50, value + 15, 0));
        points.push(new THREE.Vector3(value + 45, value + 5, 0));
        points.push(new THREE.Vector3(-value - 60, value + 5, 0));
        points.push(new THREE.Vector3(+value + 60, value + 5, 0));
        points.push(new THREE.Vector3(value + 2, -value - 70, 0));
        points.push(new THREE.Vector3(value + 45, -value - 25, 0));
        points.push(new THREE.Vector3(-value - 55, -value - 25, 0));

        //partes mais altas
        points.push(new THREE.Vector3(value + 35, 5, 19));
        points.push(new THREE.Vector3(-5, -5, value + 35));
        points.push(new THREE.Vector3(-value - 40, 10, 30));
        points.push(new THREE.Vector3(-value - 40, 10, 30));
        points.push(new THREE.Vector3(5, -value - 19, 25));
        points.push(new THREE.Vector3(-value - 20, -value - 25, 28));
        points.push(new THREE.Vector3(value + 20, -value - 20, 28));
        points.push(new THREE.Vector3(-value - 10, -15, 19));
        points.push(new THREE.Vector3(-value - 5, -value - 25, 32));
        points.push(new THREE.Vector3(value + 5, -value - 25, 32));
        points.push(new THREE.Vector3(0, -value - 25, 35));
        points.push(new THREE.Vector3(0, +value + 25, 35));
        /*
    spGroup = new THREE.Geometry();
    spMesh = new THREE.Mesh(sphereGeom);
    points.forEach(function (point) {
      spMesh.position.set(point.x, point.y, point.z);
      spMesh.updateMatrix();
      spGroup.merge(spMesh.geometry, spMesh.matrix);
    });

    pointCloud = new THREE.Mesh(spGroup, sphereMaterial);
     // pointCloud.castShadow = castShadow;
      pointCloud.visible = pointCloudVisibility;
      pointCloud.position.set(0,200,0);
    scene.add(pointCloud);
*/
        return points;
    }

    function criaMontanhaUm() {
        // First, create the point vector to be used by the convex hull algorithm
        var localPointsUm = generatePoints(40);
        var localPointsDois = generatePoints(15);
        var localPointsTres = generatePoints(20);
        var localPointsCinco = generatePoints(5);
        var localPointsSeis = generatePoints(10);
        // Then, build the convex geometry with the generated points
        convexGeometry = new THREE.ConvexBufferGeometry(localPointsUm);
        convexGeometry2 = new THREE.ConvexBufferGeometry(localPointsDois);
        convexGeometry3 = new THREE.ConvexBufferGeometry(localPointsTres);
        convexGeometry4 = new THREE.ConvexBufferGeometry(localPointsCinco);
        convexGeometry5 = new THREE.ConvexBufferGeometry(localPointsSeis);

        var montanhas = [];
        var montanhaMaiorUm = new THREE.Mesh(convexGeometry, objectMaterial);
        montanhaMaiorUm.visible = true;
        montanhaMaiorUm.position.set(-80, 20, 0);
        montanhaMaiorUm.castShadow = true;

        var montanhaMaiorDois = new THREE.Mesh(convexGeometry2, objectMaterial);
        montanhaMaiorDois.visible = true;
        montanhaMaiorDois.position.set(-20, 20, 0);
        montanhaMaiorDois.castShadow = true;

        var montanhaMaiorTres = new THREE.Mesh(convexGeometry3, objectMaterial);
        montanhaMaiorTres.visible = true;
        montanhaMaiorTres.position.set(-155, 20, 0);
        montanhaMaiorTres.castShadow = true;

        var montanhaMenorUm = new THREE.Mesh(convexGeometry5, objectMaterial);
        montanhaMenorUm.visible = true;
        montanhaMenorUm.position.set(230, 170, 0);
        montanhaMenorUm.castShadow = true;

        var montanhaMenorDois = new THREE.Mesh(convexGeometry4, objectMaterial);
        montanhaMenorDois.visible = true;
        montanhaMenorDois.position.set(280, 200, 0);
        montanhaMenorDois.castShadow = true;

        montanhas.push(montanhaMaiorUm);
        montanhas.push(montanhaMaiorDois);
        montanhas.push(montanhaMaiorTres);
        montanhas.push(montanhaMenorUm);
        montanhas.push(montanhaMenorDois);

        return montanhas;
    }
    ///////////////// FIM MOnTANHA

    // movimentacao das rodas
    function moveKart() {
        let delta = clock.getDelta();

        let moveDistance = kartProps.currentSpeed * delta;
        kart.translateX(moveDistance);
        if (gameMode) {
            kartProps.currentPosition.copy(kart.position);
        }

        kart.rotateOnAxis(new THREE.Vector3(0, 0, 1), kartRotation);
        kartBody.eixoFrontal.leftWheel.rotation.set(
            kartBody.eixoFrontal.leftWheel.rotation.x,
            degreesToRadians(wheelsRotation),
            0
        );

        kartBody.eixoFrontal.rightWheel.rotation.set(
            kartBody.eixoFrontal.rightWheel.rotation.x,
            degreesToRadians(wheelsRotation),
            0
        );
    }

    function buildInterface() {
        var controls = new (function () {
            this.postes = true;
            this.spotLight = true;
            this.directionalLight = true;

            this.desligaPostes = function () {
                postes.forEach(poste => {
                    poste.light.visible = this.postes;
                })
            };
            this.desligaSpotLight = function () {
                spotLight.visible = this.spotLight;
            };
            this.desligaDirectionalLight = function () {
                directionalLight.visible = this.directionalLight;
            };
        })();

        var obj = {
            "Modo Jogo": function () {
                if (gameMode) {
                    scene.remove(plane);
                    scene.remove(line);
                    scene.remove(axesHelper);
                    gameMode = false;
                } else {
                    scene.add(axesHelper);
                    scene.add(plane);
                    scene.add(line);
                    gameMode = true;
                }
                resetKart();
                cameraRotation = 0;
                moveCamera(kart.position, kart.position, vectUp);
            },
        };

        // GUI interface
        var gui = new dat.GUI();
        // Movimento
        gui.add(controls, "postes")
            .onChange(function (e) {
                controls.desligaPostes();
            })
            .name("Luzes dos Postes");
        gui.add(controls, "spotLight")
            .onChange(function (e) {
                controls.desligaSpotLight();
            })
            .name("Luz do SpotLight");
        gui.add(controls, "directionalLight")
            .onChange(function (e) {
                controls.desligaDirectionalLight();
            })
            .name("Luz do Sol");
    }

    function resetKart() {
        kart.position.copy(kartProps.initialPosition);
        kart.rotation.set(0, 0, degreesToRadians(kartProps.angleRotationZ));
        kartProps.currentSpeed = 0;
    }

    //trocar modo de camera
    function changeMode() {
        if (gameMode) {
            kart.position.copy(center);
            scene.remove(plane);
            scene.remove(line);
            // scene.remove(axesHelper);
            postes.forEach((poste) => {
                scene.remove(poste);
            });
            montanhas.forEach((montanha) => {
                scene.remove(montanha);
            });
            scene.remove(estatua);
            trackballControls.reset();
            trackballControls.enabled = true;
            gameMode = false;
        } else {
            kart.position.copy(kartProps.currentPosition);
            // scene.add(axesHelper);
            scene.add(plane);
            scene.add(line);
            postes.forEach((poste) => {
                scene.add(poste);
            });
            montanhas.forEach((montanha) => {
                scene.add(montanha);
            });
            scene.add(estatua);
            trackballControls.enabled = false;
            gameMode = true;
        }
        kartProps.currentSpeed = 0;
        // trackballControls.reset();
        camera.position.z = 15;
        moveCamera(kart.position, kart.position, vectUp, true);
    }

    // Funcao responsavel pelos comandos com teclado
    function keyboardUpdate() {
        keyboard.update();

        let speedPositive = kartProps.currentSpeed >= 0;
        kartRotation = 0;
        let direction = 0;

        if (keyboard.down("space")) {
            changeMode();
            return;
        }

        // Atualiza valores de rotação de rodas e define a direção
        if (keyboard.pressed("left")) {
            direction = -1;
            if (wheelsRotation < wheelsMaxRotation) {
                wheelsRotation += kartProps.wheelsSpeedRotation;
            }
        } else if (keyboard.pressed("right")) {
            direction = 1;
            if (wheelsRotation > -wheelsMaxRotation) {
                wheelsRotation -= kartProps.wheelsSpeedRotation;
            }
        } else {
            if (wheelsRotation != 0) {
                let factor = wheelsRotation > 0 ? -2 : 5;
                wheelsRotation += kartProps.rotateAngle * factor;
            }
        }

        let speedFactor = 1;
        // Velocidade e rotacao do Kart no modo jogo
        if (gameMode) {
            if (
                keyboard.pressed("up") &&
                kartProps.currentSpeed < kartProps.maxSpeed
            ) {
                if (kartProps.currentSpeed < 0) speedFactor = 4;
                kartProps.currentSpeed += kartProps.acceleration * speedFactor;
            } else if (
                keyboard.pressed("down") &&
                kartProps.currentSpeed > -kartProps.maxSpeed
            ) {
                if (kartProps.currentSpeed > 0) speedFactor = 4;
                kartProps.currentSpeed -= kartProps.acceleration * speedFactor;
            } else if (kartProps.currentSpeed != 0) {
                if (kartProps.currentSpeed > -1 && kartProps.currentSpeed < 1) {
                    kartProps.currentSpeed = 0;
                } else {
                    kartProps.currentSpeed +=
                        kartProps.acceleration * speedPositive ? -1 : 1;
                }
            }

            if (kartProps.currentSpeed != 0) {
                cameraRotation +=
                    degreesToRadians(
                        kartProps.rotateAngle * speedPositive ? 1 : -1
                    ) *
                    direction *
                    -1;
                kartRotation =
                    degreesToRadians(
                        kartProps.rotateAngle * speedPositive ? 1 : -1
                    ) *
                    direction *
                    -1;
            }
        }
        // Reset Kart
        // if (keyboard.pressed("space")) kart.position.set(0.0, 0.0, 2.0);
    }

    // funcao utilizada para manter a posicao da camera
    function moveCamera(position, look, up, origin = false) {
        var rotY = Math.sin(cameraRotation);
        var rotX = Math.cos(cameraRotation);
        var distance = 50;
        camera.position.x = position.x - distance * rotX;
        camera.position.y = position.y - distance * rotY;

        camera.lookAt(look);
        camera.up.set(up.x, up.y, up.z);
        spotLight.position.copy(camera.position);
    }
    function showInformation() {
        var secundaryBox = new SecondaryBox("...");
        secundaryBox.changeMessage(
            "Pos: " +
                kartProps.currentPosition.x.toFixed(1) +
                " " +
                kartProps.currentPosition.y.toFixed(1) +
                " " +
                kartProps.currentPosition.z.toFixed(1)
            // "  Look: " +
            // cameraDirection.x.toFixed(1) +
            // " " +
            // cameraDirection.y.toFixed(1) +
            // " " +
            // cameraDirection.z.toFixed(1) +
            // "  Up: " +
            // vectUp.x.toFixed(1) +
            // " " +
            // vectUp.y.toFixed(1) +
            // " " +
            // vectUp.z.toFixed(1)
        );
        return secundaryBox;
    }


    function createDirectionalLight() {
        const directionalLight = new THREE.DirectionalLight("rgb(241,218,164)");
        directionalLight.position.set(-37, -350, 40);
        // directionalLight.position.set(1, 3, 200);
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.castShadow = true;

        directionalLight.shadow.camera.width = 2048;
        directionalLight.shadow.camera.height = 2048;
        directionalLight.shadow.camera.left = -350;
        directionalLight.shadow.camera.right = 350;
        directionalLight.shadow.camera.top = 350;
        directionalLight.shadow.camera.bottom = -350;
        directionalLight.target.position.set(0, 0, 0);
        directionalLight.shadow.camera.far = 1000;
        directionalLight.intensity = 5;
        // directionalLight.decay = 5;
        // scene.add(directionalLight);
        return directionalLight;
    }

    function createSpotLight() {
        const spotLight = new THREE.SpotLight("rgb(255,255,255)");
        // spotLight.shadow.mapSize.width = 2048;
        // spotLight.shadow.mapSize.height = 2048;
        spotLight.shadow.camera.fov = degreesToRadians(20);
        spotLight.castShadow = true;

        spotLight.decay = 2;
        spotLight.intensity = 1;
        spotLight.penumbra = 0.05;
        spotLight.visible = true;

        spotLight.position.set(0, 0, 0);

        // spotLight.castShadow = true;

        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 30;
        return spotLight;
    }
}
