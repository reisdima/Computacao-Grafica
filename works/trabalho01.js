function main() {
    var stats = initStats(); // Mostra fps
    var scene = new THREE.Scene(); // Cria cena principal
    var renderer = initRenderer();
    var light = initDefaultLighting(scene, new THREE.Vector3());
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
    changeCamera(cameraPosition, cameraDirection, vectUp);

    // Enable mouse rotation, pan, zoom etc.
    var trackballControls = new THREE.TrackballControls(
        camera,
        renderer.domElement
    );

    // Mostra eixos
    var axesHelper = new THREE.AxesHelper(12);
    scene.add(axesHelper);

    //Inicio Criacao do Plano

    var planeGeometry = new THREE.PlaneGeometry(700, 700, 40, 40);
    planeGeometry.translate(0.0, 0.0, -0.02);
    var planeMaterial = new THREE.MeshPhongMaterial({
        color: "rgba(20, 30, 110)",
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    var wireframe = new THREE.WireframeGeometry(planeGeometry);
    var line = new THREE.LineSegments(wireframe);
    line.material.color.setStyle("rgb(180, 180, 180)");
    scene.add(line);
    //Fim Criacao do Plano

    // Variáveis para auxiliar no trabalho
    var objectPosicaoFinal = {
        x: 0,
        y: 0,
        z: 2,
    };
    var objectRotacaoFinal = {
    };

    var kartProps = {
        initialPosition: new THREE.Vector3(0, 0, 1.75), 
        angleRotationZ: 90, //angulo inicial 
        currentSpeed: 0, // velocidade atual
        acceleration: 1, // aceleracao
        maxSpeed: 70,// velocidade maxima      
        wheelsSpeedRotation: 6,  //velocidade de rotação da roda
        brakeAccelerationFactor: 1.2, // freiar mais rapido do que acelerar
        rotateAngle: 2, //velocidade de rotacao do carro
    }
    
    var kartPosicaoInicial = new THREE.Vector3(0, 0, 1.75)
    var wheelsRotation = 0; //rotacao atual das rodas
    var wheelsMaxRotation = 35; //o maximo que ela vai rotacionar
    var cameraRotation = 0; // posicionamento da camera
    var gameMode = true;

    var kartBody = {}; 

    kartBody = createKart();
    var object = kartBody.object;
    var kart = kartBody.main.corpo;
    scene.add(kart);
    buildInterface(object);

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

    render();
    function render() {
        stats.update(); // Update FPS
        trackballControls.update(); // Enable mouse movements
        keyboardUpdate();
        if(gameMode){
            changeCamera(kart.position, kart.position, vectUp); //atualiza posicao da camera
        }
        moveObject(object); //atualizar posicao do objeto auxiliar
        moveKart(); //atualiza a rotação das rodas
        lightFollowingCamera(light, camera);
        requestAnimationFrame(render);
        renderer.render(scene, camera); // Render scene
    }

    //Inicio funcoes para criar as formas basicas

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
        const material = new THREE.MeshPhongMaterial({ color: "#ffffff" });
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
        const material = new THREE.MeshPhongMaterial({ color: "#3e403e" });
        const torus = new THREE.Mesh(geometry, material);
        torus.position.set(0.0, 0.0, 0.0);
        return torus;
    }

    // fim funcoes para criar as formas basicas

    // funcao para criar o kart e suas partes
    function createKart() {
        var mainCube = createCubeColor(4, 2, 1, "#3e403e");
        mainCube.position.copy(kartPosicaoInicial);

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

        mainCube.rotation.set(0, 0, degreesToRadians(90));

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

    // Inicio funcao auxiliar para ajudar a posicionar as formas
    function moveObject(object) {
        if (!object) return;
        object.position.set(objectPosicaoFinal.x, objectPosicaoFinal.y, objectPosicaoFinal.z);
        object.rotation.set(
            degreesToRadians(objectRotacaoFinal.x),
            degreesToRadians(objectRotacaoFinal.y),
            degreesToRadians(objectRotacaoFinal.z)
        );
    }

    // fim funcao para ajudar a posicionar as formas

    // movimentacao das rodas
    function moveKart() {
        kartBody.main.eixoFrontal.leftWheel.rotation.set(
            kartBody.main.eixoFrontal.leftWheel.rotation.x,
            degreesToRadians(wheelsRotation),
            0
        );
        kartBody.main.eixoFrontal.rightWheel.rotation.set(
            kartBody.main.eixoFrontal.rightWheel.rotation.x,
            degreesToRadians(wheelsRotation),
            0
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
                objectPosicaoFinal.x = this.x;
                objectPosicaoFinal.y = this.y;
                objectPosicaoFinal.z = this.z;
            };
            this.rotate = function () {
                objectRotacaoFinal.x = this.rotationX;
                objectRotacaoFinal.y = this.rotationY;
                objectRotacaoFinal.z = this.rotationZ;
            };
        })();

        var obj = {
            "Modo Jogo": function () {
                if(gameMode){
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
                changeCamera(kart.position, kart.position, vectUp);
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
        gui.add(obj, "Modo Jogo");
    }


    function resetKart(){
        kart.position.copy(kartProps.initialPosition);
        kart.rotation.set(0, 0, degreesToRadians(kartProps.angleRotationZ));
        kartProps.currentSpeed = 0;
    }


    //trocar modo de camera
    function changeMode() {
        if(gameMode){
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
        changeCamera(kart.position, kart.position, vectUp);
        console.log("Apertou no botão");
    }

    //funcao responsavel pelos comandos com teclado
    function keyboardUpdate() {
        keyboard.update();
        var delta = clock.getDelta(); 

        let speedPositive = kartProps.currentSpeed >= 0;

        if(keyboard.down("space")) {
            changeMode();
            
        }  

        // Movimentação do kart
        if (gameMode) {
            if (keyboard.pressed("up") && kartProps.currentSpeed < kartProps.maxSpeed) {
                kartProps.currentSpeed += kartProps.acceleration;  //aumenta velocidade
            } else if (keyboard.pressed("down") && kartProps.currentSpeed > -kartProps.maxSpeed) { //diminui velocidade
                kartProps.currentSpeed -= kartProps.acceleration * kartProps.brakeAccelerationFactor * 1.2;
            } else if (kartProps.currentSpeed != 0) {  // diminui a velocidade do carro ate 0 
                if (kartProps.currentSpeed > -1 && kartProps.currentSpeed < 1) { // se tiver uma velocidade entre -1 e 1 zera direto
                    kartProps.currentSpeed = 0;  
                } else {  //diminui a velocidade
                    kartProps.currentSpeed += 
                        kartProps.acceleration * speedPositive
                            ? -kartProps.brakeAccelerationFactor
                            : kartProps.brakeAccelerationFactor;
                }
            }
            var moveDistance = kartProps.currentSpeed * delta; // move o kart 
            kart.translateX(moveDistance);



            if (keyboard.pressed("left")) {
                if (kartProps.currentSpeed != 0) { // so rotaciona se a velocidade for != 0 
                    cameraRotation -= degreesToRadians( //usa camerarotation pra ver o angulo de rotacao
                        kartProps.rotateAngle * speedPositive ? 1 : -1
                    );
                    kart.rotateOnAxis(
                        new THREE.Vector3(0, 0, 1),
                        degreesToRadians(kartProps.rotateAngle * speedPositive ? 1 : -1)
                    );
                }
                if (wheelsRotation < wheelsMaxRotation) { //movimentacao da roda
                    wheelsRotation += kartProps.wheelsSpeedRotation;
                }
            } else if (keyboard.pressed("right")) {
                if (kartProps.currentSpeed != 0) {
                    cameraRotation += degreesToRadians(
                        kartProps.rotateAngle * speedPositive ? 1 : -1
                    );
                    kart.rotateOnAxis(
                        new THREE.Vector3(0, 0, 1),
                        -degreesToRadians(kartProps.rotateAngle * speedPositive ? 1 : -1)
                    );
                }
                if (wheelsRotation > -wheelsMaxRotation) {
                    wheelsRotation -= kartProps.wheelsSpeedRotation;
                }
            } else { //voltar com a roda pro eixo alinhado
                if (wheelsRotation != 0) {
                    let factor = wheelsRotation > 0 ? -1 : 1;
                    wheelsRotation += kartProps.rotateAngle * factor * 2;
                }
            }
        }
    }

    // funcao utilizada para atualizar a posicao da camera
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
