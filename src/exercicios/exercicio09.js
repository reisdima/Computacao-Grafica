function main() {
  var scene = new THREE.Scene(); // Create main scene
  var stats = initStats(); // To show FPS information

  var renderer = initRenderer(); // View function in util/utils
  renderer.setClearColor("rgb(30, 30, 42)");
  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.lookAt(0, 0, 0);
  camera.position.set(4.0, 6.0, 6.0);
  camera.up.set(0, 1, 0);
  var objColor = "rgb(255, 255, 255)";
  var objShininess = 200;

  // To use the keyboard
  var keyboard = new KeyboardState();

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls(
    camera,
    renderer.domElement
  );

  // Listen window size changes
  window.addEventListener(
    "resize",
    function () {
      onWindowResize(camera, renderer);
    },
    false
  );

  var groundPlane = createGroundPlane(6.0, 6.0); // width and height
  groundPlane.rotateX(degreesToRadians(-90));
  scene.add(groundPlane);

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper(1.5);
  axesHelper.visible = false;
  scene.add(axesHelper);

  // Show text information onscreen
  showInformation();

  var infoBox = new SecondaryBox("");

  // Teapot
  var geometry = new THREE.TeapotBufferGeometry(0.5);
  var material = new THREE.MeshPhongMaterial({
    color: objColor,
    shininess: "200",
  });
  material.side = THREE.DoubleSide;
  var obj = new THREE.Mesh(geometry, material);
  obj.castShadow = true;
  obj.position.set(0.0, 0.5, 0.0);
  scene.add(obj);

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  // Control available light and set the active light
  var lightArray = new Array();
  var activeLight = 0; // View first Light
  var lightIntensity = 1.0;

  //---------------------------------------------------------
  // Default light position, color, ambient color and intensity
  var lights = createLights();
  console.log(lights);
  var rotationSpeed = 1.0;
  var rotateObject = false;

  var ambientColor = "rgb(50,50,50)";

  // More info here: https://threejs.org/docs/#api/en/lights/AmbientLight
  var ambientLight = new THREE.AmbientLight(ambientColor);
  scene.add(ambientLight);

  buildInterface();
  render();

  // Set Point Light
  // More info here: https://threejs.org/docs/#api/en/lights/PointLight
  function setPointLight(lightObject, position) {
    lightObject.position.copy(position);
    lightObject.name = "Point Light";
    lightObject.castShadow = true;
    lightObject.visible = false;

    scene.add(lightObject);
  }

  // Set Spotlight
  // More info here: https://threejs.org/docs/#api/en/lights/SpotLight
  function setSpotLight(lightObject, position) {
    lightObject.position.copy(position);
    lightObject.shadow.mapSize.width = 2048;
    lightObject.shadow.mapSize.height = 2048;
    lightObject.shadow.camera.fov = degreesToRadians(20);
    lightObject.castShadow = true;
    lightObject.decay = 2;
    lightObject.penumbra = 0.05;
    lightObject.name = "Spot Light";

    scene.add(lightObject);
    return lightObject;
    // lightArray.push(lightObject);
  }

  // Set Directional Light
  // More info here: https://threejs.org/docs/#api/en/lights/DirectionalLight
  function setDirectionalLighting(lightObject, position) {
    lightObject.position.copy(position);
    lightObject.shadow.mapSize.width = 2048;
    lightObject.shadow.mapSize.height = 2048;
    lightObject.castShadow = true;

    lightObject.shadow.camera.left = -200;
    lightObject.shadow.camera.right = 200;
    lightObject.shadow.camera.top = 200;
    lightObject.shadow.camera.bottom = -200;
    lightObject.name = "Direction Light";
    lightObject.visible = false;

    scene.add(lightObject);
  }

  // Update light position of the current light
  function updateLightPosition() {
    lights.forEach((light) => {
      light.lightSphere.position.copy(light.position);
      light.light.position.copy(light.position);
    });
    // lightArray[activeLight].position.copy(lightPosition);
    // lightSphere.position.copy(lightPosition);
    // infoBox.changeMessage(
    //   "Light Position: " +
    //     lightPosition.x.toFixed(2) +
    //     ", " +
    //     lightPosition.y.toFixed(2) +
    //     ", " +
    //     lightPosition.z.toFixed(2)
    // );
  }

  function updateObject(object) {
    if (rotateObject) {
      object.rotateY(degreesToRadians(rotationSpeed));
    }
  }

  // Update light intensity of the current light
  function updateLightIntensity() {
    lightArray[activeLight].intensity = lightIntensity;
  }

  function buildInterface() {
    //------------------------------------------------------------
    // Interface
    var controls = new (function () {
      this.viewAxes = false;
      this.redLightPosition = lights[0].position.z;
      this.greenLightPosition = lights[1].position.x;
      this.blueLightPosition = lights[2].position.x;
      this.color = objColor;
      this.shininess = objShininess;
      this.lightIntensity = lightIntensity;
      this.lightType = "Spot";
      this.ambientLight = true;
      this.showRedLight = true;
      this.showGreenLight = true;
      this.showBlueLight = true;
      this.rotateObject = false;

      this.onViewAxes = function () {
        axesHelper.visible = this.viewAxes;
      };
      this.onEnableAmbientLight = function () {
        ambientLight.visible = this.ambientLight;
      };
      this.updateColor = function () {
        // material.color.set(this.color);
      };
      this.onUpdateShininess = function () {
        // material.shininess = this.shininess;
      };
      this.onUpdateLightIntensity = function () {
        // lightIntensity = this.lightIntensity;
        // updateLightIntensity();
      };
      this.moveRed = function () {
        lights[0].position.z = this.redLightPosition;
      };
      this.moveGreen = function () {
        lights[1].position.x = this.greenLightPosition;
      };
      this.moveBlue = function () {
        lights[2].position.x = this.blueLightPosition;
      };
      this.showRed = function () {
        lights[0].light.visible = this.showRedLight;
        lights[0].lightSphere.visible = this.showRedLight;
      };
      this.showGreen = function () {
        lights[1].light.visible = this.showGreenLight;
        lights[1].lightSphere.visible = this.showGreenLight;
      };
      this.showBlue = function () {
        lights[2].light.visible = this.showBlueLight;
        lights[2].lightSphere.visible = this.showBlueLight;
      };
      this.toggleRotation = function () {
        rotateObject = this.rotateObject;
      };
      this.onChangeLight = function () {
        // lightArray[activeLight].visible = false;
        // switch (this.lightType) {
        //   case "Spot":
        //     activeLight = 0;
        //     break;
        //   case "Point":
        //     activeLight = 1;
        //     break;
        //   case "Direction":
        //     activeLight = 2;
        //     break;
        // }
        // lightArray[activeLight].visible = true;
        // updateLightPosition();
        // updateLightIntensity();
      };
    })();

    var gui = new dat.GUI();
    gui
      .addColor(controls, "color")
      .name("Obj Color")
      .onChange(function (e) {
        controls.updateColor();
      });
    gui
      .add(controls, "shininess", 0, 1000)
      .name("Obj Shininess")
      .onChange(function (e) {
        controls.onUpdateShininess();
      });
    gui
      .add(controls, "viewAxes", false)
      .name("View Axes")
      .onChange(function (e) {
        controls.onViewAxes();
      });
    gui
      .add(controls, "lightType", ["Spot", "Point", "Direction"])
      .name("Light Type")
      .onChange(function (e) {
        controls.onChangeLight();
      });
    gui
      .add(controls, "lightIntensity", 0, 5)
      .name("Light Intensity")
      .onChange(function (e) {
        controls.onUpdateLightIntensity();
      });
    gui
      .add(controls, "redLightPosition", -1.5, 1.5)
      .name("Red Position")
      .onChange(function (e) {
        controls.moveRed();
      });
    gui
      .add(controls, "greenLightPosition", -1.0, 2)
      .name("Green Position")
      .onChange(function (e) {
        controls.moveGreen();
      });
    gui
      .add(controls, "blueLightPosition", -1.0, 2)
      .name("Blue Position")
      .onChange(function (e) {
        controls.moveBlue();
      });
    gui
      .add(controls, "ambientLight", true)
      .name("Ambient Light")
      .onChange(function (e) {
        controls.onEnableAmbientLight();
      });
    gui
      .add(controls, "showRedLight", true)
      .name("Mostrar luz vermelha")
      .onChange(function (e) {
        controls.showRed();
      });
    gui
      .add(controls, "showGreenLight", true)
      .name("Mostrar luz verde")
      .onChange(function (e) {
        controls.showGreen();
      });
    gui
      .add(controls, "showBlueLight", true)
      .name("Mostrar luz azul")
      .onChange(function (e) {
        controls.showBlue();
      });
    gui
      .add(controls, "rotateObject", true)
      .name("Rotacionar")
      .onChange(function (e) {
        controls.toggleRotation();
      });
  }

  function keyboardUpdate() {
    keyboard.update();
    if (keyboard.pressed("D")) {

      lights[0].position.z += 0.05;
    }
    if (keyboard.pressed("A")) {
      lights[0].position.z -= 0.05;
    }
    if (keyboard.pressed("W")) {
      lights[1].position.x += 0.05;
    }
    if (keyboard.pressed("S")) {
      lights[1].position.x -= 0.05;
    }
    if (keyboard.pressed("E")) {
      lights[2].position.x -= 0.05;
    }
    if (keyboard.pressed("Q")) {
      lights[2].position.x += 0.05;
    }
  }

  function showInformation() {
    // Use this to show information onscreen
    controls = new InfoBox();
    controls.add("Lighting - Types of Lights");
    controls.addParagraph();
    controls.add("Use the WASD-QE keys to move the light");
    controls.show();
  }

  function render() {
    stats.update();
    trackballControls.update();
    keyboardUpdate();
    updateLightPosition();
    requestAnimationFrame(render);
    updateObject(obj);
    renderer.render(scene, camera);
  }

  function createLightSphere(
    scene,
    radius,
    widthSegments,
    heightSegments,
    position,
    color = "rgb(255,255,50)"
  ) {
    var geometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments,
      0,
      Math.PI * 2,
      0,
      Math.PI
    );
    var material = new THREE.MeshBasicMaterial({ color: color });
    var object = new THREE.Mesh(geometry, material);
    object.visible = true;
    object.position.copy(position);
    scene.add(object);
    return object;
  }

  function createLights() {
    let lights = new Array();
    let lightPosition = new THREE.Vector3(2.0, 2.0, 1.5);
    let lightColor = "rgb(255, 20, 20)";
    let spotLight = new THREE.SpotLight(lightColor);
    lights.push({
      position: lightPosition,
      light: setSpotLight(spotLight, lightPosition),
      color: lightColor,
      lightSphere: createLightSphere(
        scene,
        0.05,
        10,
        10,
        lightPosition,
        lightColor
      ),
    });

    lightPosition = new THREE.Vector3(-1.0, 2.0, 1.5);
    lightColor = "rgb(20, 255, 20)";
    spotLight = new THREE.SpotLight(lightColor);
    lights.push({
      position: lightPosition,
      light: setSpotLight(spotLight, lightPosition),
      color: "rgb(20, 255, 20)",
      lightSphere: createLightSphere(
        scene,
        0.05,
        10,
        10,
        lightPosition,
        lightColor
      ),
    });

    lightPosition = new THREE.Vector3(2.0, 2.0, -1.5);
    lightColor = "rgb(20, 20, 255)";
    spotLight = new THREE.SpotLight(lightColor);
    lights.push({
      position: lightPosition,
      light: setSpotLight(spotLight, lightPosition),
      color: "rgb(20, 20, 255)",
      lightSphere: createLightSphere(
        scene,
        0.05,
        10,
        10,
        lightPosition,
        lightColor
      ),
    });

    return lights;
  }
}
