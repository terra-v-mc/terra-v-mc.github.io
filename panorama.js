window.addEventListener("DOMContentLoaded", function () {

    var canvas = document.getElementById("sky");

    if (!canvas) {
        console.error("Terra V: #sky canvas not found.");
        return;
    }

    if (typeof THREE === "undefined") {
        console.error("Terra V: Three.js was not loaded.");
        return;
    }


    // ============================================================
    // RENDERER
    // ============================================================

    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight,
        false
    );

    if ("outputColorSpace" in renderer) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.05;


    // ============================================================
    // SCENE
    // ============================================================

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(
        48,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    );

    camera.position.set(
        0,
        0.12,
        3.25
    );

    camera.lookAt(
        0.15,
        0,
        0
    );


    // ============================================================
    // TEXTURES
    // ============================================================

    var textureLoader =
        new THREE.TextureLoader();

    var skyTexture =
        textureLoader.load(
            "./textures/skybox.jpg"
        );

    var earthTexture =
        textureLoader.load(
            "./textures/albedo.jpg"
        );

    var normalTexture =
        textureLoader.load(
            "./textures/normal.jpg"
        );

    skyTexture.colorSpace =
        THREE.SRGBColorSpace;

    earthTexture.colorSpace =
        THREE.SRGBColorSpace;

    normalTexture.colorSpace =
        THREE.NoColorSpace;


    // ============================================================
    // SPACE
    // ============================================================

    var sky = new THREE.Mesh(
        new THREE.SphereGeometry(
            90,
            32,
            16
        ),
        new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide,
            depthWrite: false
        })
    );

    scene.add(sky);


    // ============================================================
    // LIGHTING
    // ============================================================

    var sunDirection =
    new THREE.Vector3(
        8,
        1.25,
        -9
    ).normalize();


    var hemisphereLight =
        new THREE.HemisphereLight(
            0x9bb8d6,
            0x08101a,
            0.28
        );

    scene.add(
        hemisphereLight
    );


    var sunLight =
        new THREE.DirectionalLight(
            0xffffff,
            3.5
        );

    sunLight.position.copy(
        sunDirection
    );

    sunLight.position.multiplyScalar(
        10
    );

    scene.add(
        sunLight
    );





 // ============================================================
 // SUN
 // ============================================================

 var sunPosition =
     sunDirection.clone().multiplyScalar(55);


 // ------------------------------------------------------------
 // WARM SUN FLARE
 // ------------------------------------------------------------

 var flareCanvas =
     document.createElement("canvas");

 flareCanvas.width = 128;
 flareCanvas.height = 128;

 var flareContext =
     flareCanvas.getContext("2d");

 var gradient =
     flareContext.createRadialGradient(
         64,
         64,
         0,
         64,
         64,
         64
     );

 gradient.addColorStop(
     0.0,
     "rgba(255,245,225,1)"
 );

 gradient.addColorStop(
     0.10,
     "rgba(255,210,165,0.98)"
 );

 gradient.addColorStop(
     0.25,
     "rgba(255,145,75,0.75)"
 );

 gradient.addColorStop(
     0.45,
     "rgba(245,100,45,0.38)"
 );

 gradient.addColorStop(
     0.70,
     "rgba(220,75,35,0.14)"
 );

 gradient.addColorStop(
     1.0,
     "rgba(190,60,30,0)"
 );

 flareContext.fillStyle =
     gradient;

 flareContext.fillRect(
     0,
     0,
     128,
     128
 );

 var flareTexture =
     new THREE.CanvasTexture(
         flareCanvas
     );

 flareTexture.colorSpace =
     THREE.SRGBColorSpace;

 var flareMaterial =
     new THREE.SpriteMaterial({
         map: flareTexture,
         transparent: true,
         depthWrite: false,
         depthTest: false,
         blending: THREE.AdditiveBlending,
         opacity: 0.85
     });

 var sunFlare =
     new THREE.Sprite(
         flareMaterial
     );

 sunFlare.position.copy(
     sunPosition
 );

 sunFlare.scale.set(
     7,
     7,
     1
 );

 sunFlare.renderOrder = 5;

 scene.add(
     sunFlare
 );

    // ============================================================
    // EARTH
    // ============================================================

    var earth = new THREE.Mesh(
        new THREE.SphereGeometry(
            1,
            64,
            48
        ),
        new THREE.MeshStandardMaterial({
            map: earthTexture,
            normalMap: normalTexture,
            roughness: 0.82,
            metalness: 0,
            normalScale:
                new THREE.Vector2(
                    0.45,
                    0.45
                )
        })
    );

    earth.position.set(
        -1.85,
        -0.02,
        0
    );

    earth.rotation.z =
        THREE.MathUtils.degToRad(
            23.44
        );

    scene.add(
        earth
    );


    // ============================================================
    // ATMOSPHERE
    //
    // Lightweight volumetric ray-marched atmosphere.
    //
    // There is no Fresnel shell, so there is no hard blue ring.
    //
    // The camera ray passes through the atmosphere and samples
    // density from the Earth's surface outward.
    //
    // 12 samples keeps this relatively inexpensive.
    // ============================================================

    var atmosphere =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                10,
                32,
                20
            ),

            new THREE.ShaderMaterial({

                transparent: true,

                depthWrite: false,
                depthTest: false,

                side: THREE.BackSide,

                blending:
                    THREE.AdditiveBlending,

                uniforms: {

                    uEarthCenter: {
                        value:
                            earth.position.clone()
                    },

                    uSunDirection: {
                        value:
                            sunDirection.clone()
                    }

                },


                // ==================================================
                // VERTEX SHADER
                // ==================================================

                vertexShader:

                    "varying vec3 vWorldPosition;" +

                    "void main() {" +

                    "vec4 worldPosition = " +
                    "modelMatrix * " +
                    "vec4(position, 1.0);" +

                    "vWorldPosition = " +
                    "worldPosition.xyz;" +

                    "gl_Position = " +
                    "projectionMatrix * " +
                    "viewMatrix * " +
                    "worldPosition;" +

                    "}",


                // ==================================================
                // FRAGMENT SHADER
                // ==================================================

                fragmentShader:

                    "uniform vec3 uEarthCenter;" +
                    "uniform vec3 uSunDirection;" +

                    "varying vec3 vWorldPosition;" +

                    "void main() {" +


                    // ------------------------------------------------
                    // CAMERA RAY
                    // ------------------------------------------------

                    "vec3 rayOrigin = " +
                    "cameraPosition;" +

                    "vec3 rayDirection = normalize(" +
                    "vWorldPosition - rayOrigin" +
                    ");" +


                    // ------------------------------------------------
                    // RADII
                    // ------------------------------------------------

                    "float earthRadius = 1.0;" +

                    "float atmosphereRadius = 1.05;" +


                    // ------------------------------------------------
                    // EARTH-LOCAL COORDINATES
                    // ------------------------------------------------

                    "vec3 origin = " +
                    "rayOrigin - uEarthCenter;" +


                    // ------------------------------------------------
                    // RAY / ATMOSPHERE INTERSECTION
                    // ------------------------------------------------

                    "float b = dot(" +
                    "origin," +
                    "rayDirection" +
                    ");" +

                    "float c = dot(" +
                    "origin," +
                    "origin" +
                    ") - atmosphereRadius * atmosphereRadius;" +

                    "float discriminant = " +
                    "b * b - c;" +

                    "if (discriminant <= 0.0) discard;" +

                    "float root = sqrt(discriminant);" +

                    "float rayStart = " +
                    "-b - root;" +

                    "float rayEnd = " +
                    "-b + root;" +

                    "rayStart = max(" +
                    "rayStart," +
                    "0.0" +
                    ");" +


                    // ------------------------------------------------
                    // RAY / EARTH INTERSECTION
                    // ------------------------------------------------

                    "float earthB = dot(" +
                    "origin," +
                    "rayDirection" +
                    ");" +

                    "float earthC = dot(" +
                    "origin," +
                    "origin" +
                    ") - earthRadius * earthRadius;" +

                    "float earthDiscriminant = " +
                    "earthB * earthB - earthC;" +

                    "if (earthDiscriminant > 0.0) {" +

                    "float earthRoot = " +
                    "sqrt(earthDiscriminant);" +

                    "float earthHit = " +
                    "-earthB - earthRoot;" +

                    "if (earthHit > rayStart) {" +

                    "rayEnd = min(" +
                    "rayEnd," +
                    "earthHit" +
                    ");" +

                    "}" +

                    "}" +


                    "if (rayEnd <= rayStart) discard;" +


                    // ------------------------------------------------
                    // RAY MARCH
                    // ------------------------------------------------

                    "const int STEPS = 12;" +

                    "float rayLength = " +
                    "rayEnd - rayStart;" +

                    "float stepLength = " +
                    "rayLength / float(STEPS);" +

                    "vec3 accumulated = " +
                    "vec3(0.0);" +

                    "float densityTotal = " +
                    "0.0;" +


                    "for (int i = 0; i < STEPS; i++) {" +

                    "float distance = " +
                    "rayStart + " +
                    "(float(i) + 0.5) * " +
                    "stepLength;" +

                    "vec3 samplePosition = " +
                    "origin + " +
                    "rayDirection * distance;" +

                    "float radius = " +
                    "length(samplePosition);" +


                    // ------------------------------------------------
                    // HEIGHT
                    // ------------------------------------------------

                    "float height = " +
                    "(radius - earthRadius) / " +
                    "(atmosphereRadius - earthRadius);" +

                    "height = clamp(" +
                    "height," +
                    "0.0," +
                    "1.0" +
                    ");" +


                    // ------------------------------------------------
                    // DENSITY
                    //
                    // Dense near Earth.
                    // Smoothly fades toward space.
                    // ------------------------------------------------

                    "float density = " +
                    "1.0 - height;" +

                    "density = smoothstep(" +
                    "0.0," +
                    "1.0," +
                    "density" +
                    ");" +

                    "density = pow(" +
                    "density," +
                    "1.25" +
                    ");" +


                    // ------------------------------------------------
                    // LOCAL NORMAL
                    // ------------------------------------------------

                    "vec3 normal = normalize(" +
                    "samplePosition" +
                    ");" +


                    // ------------------------------------------------
                    // SUNLIGHT
                    // ------------------------------------------------

                    "float sunlight = max(" +
                    "dot(" +
                    "normal," +
                    "uSunDirection" +
                    ")," +
                    "0.0" +
                    ");" +


                    // ------------------------------------------------
                    // ATMOSPHERIC COLOUR
                    // ------------------------------------------------

                    "vec3 deepBlue = vec3(" +
                    "0.008," +
                    "0.035," +
                    "0.14" +
                    ");" +

                    "vec3 blue = vec3(" +
                    "0.025," +
                    "0.20," +
                    "0.72" +
                    ");" +

                    "vec3 brightBlue = vec3(" +
                    "0.22," +
                    "0.68," +
                    "1.00" +
                    ");" +


                    "vec3 sampleColor = mix(" +
                    "deepBlue," +
                    "blue," +
                    "sunlight" +
                    ");" +

                    "sampleColor = mix(" +
                    "sampleColor," +
                    "brightBlue," +
                    "sunlight * 0.55" +
                    ");" +


                    // ------------------------------------------------
                    // ACCUMULATE
                    // ------------------------------------------------

                    "float contribution = " +
                    "density * " +
                    "stepLength;" +

                    "accumulated += " +
                    "sampleColor * " +
                    "contribution;" +

                    "densityTotal += " +
                    "contribution;" +

                    "}" +


                    // ------------------------------------------------
                    // CONVERT DENSITY TO OPACITY
                    // ------------------------------------------------

                    "float alpha = " +
                    "1.0 - exp(" +
                    "-densityTotal * 5.5" +
                    ");" +

                    "alpha = clamp(" +
                    "alpha," +
                    "0.0," +
                    "0.72" +
                    ");" +


                    // ------------------------------------------------
                    // NORMALIZE COLOUR
                    // ------------------------------------------------

                    "vec3 finalColor = " +
                    "accumulated / " +
                    "max(densityTotal, 0.001);" +


                    // ------------------------------------------------
                    // STRENGTH
                    // ------------------------------------------------

                    "finalColor *= 1.35;" +


                    // ------------------------------------------------
                    // FINAL PIXEL
                    // ------------------------------------------------

                    "gl_FragColor = vec4(" +
                    "finalColor," +
                    "alpha" +
                    ");" +

                    "}"

            })
        );


    atmosphere.position.copy(
        earth.position
    );

    atmosphere.rotation.z =
        earth.rotation.z;

    atmosphere.renderOrder = 10;

    scene.add(
        atmosphere
    );


    // ============================================================
    // EARTH ROTATION
    // ============================================================

    var rotationDuration =
        60000;

    var startTime =
        performance.now();


    // ============================================================
    // RESIZE
    // ============================================================

    function resize() {

        var width =
            window.innerWidth;

        var height =
            window.innerHeight;

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height,
            false
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            )
        );
    }

    window.addEventListener(
        "resize",
        resize
    );


    // ============================================================
    // ANIMATION
    // ============================================================

    function animate(time) {

        requestAnimationFrame(
            animate
        );

        var elapsed =
            (time - startTime) %
            rotationDuration;

        earth.rotation.y =
            (elapsed /
                rotationDuration) *
            Math.PI *
            2;

        renderer.render(
            scene,
            camera
        );
    }

    requestAnimationFrame(
        animate
    );


    // ============================================================
    // SERVER STATUS
    // ============================================================

    var statusText =
        document.getElementById(
            "server-status-text"
        );

    var statusDot =
        document.getElementById(
            "server-status-dot"
        );

    var players =
        document.getElementById(
            "server-players"
        );

    var version =
        document.getElementById(
            "server-version"
        );


    async function updateServerStatus() {

        try {

            var response =
                await fetch(
                    "https://api.mcsrvstat.us/3/play.kebabcraft.net",
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Server API returned " +
                    response.status
                );
            }

            var data =
                await response.json();


            if (data.online) {

                if (statusText) {
                    statusText.textContent =
                        "ONLINE";
                }

                if (statusDot) {
                    statusDot.style.background =
                        "#55e87a";
                }

                if (players) {

                    players.textContent =
                        data.players &&
                        data.players.online != null
                            ? data.players.online
                            : "0";
                }

                if (
                    version &&
                    data.version
                ) {

                    version.textContent =
                        data.version;
                }

            } else {

                if (statusText) {
                    statusText.textContent =
                        "OFFLINE";
                }

                if (statusDot) {
                    statusDot.style.background =
                        "#ff5555";
                }

                if (players) {
                    players.textContent =
                        "0";
                }
            }

        } catch (error) {

            console.error(
                "Server status error:",
                error
            );

            if (statusText) {
                statusText.textContent =
                    "UNAVAILABLE";
            }

            if (statusDot) {
                statusDot.style.background =
                    "#888";
            }

            if (players) {
                players.textContent =
                    "—";
            }
        }
    }


    updateServerStatus();

    setInterval(
        updateServerStatus,
        30000
    );


    // ============================================================
    // COPY IP
    // ============================================================

    var copyButton =
        document.getElementById(
            "copy-ip"
        );

    var serverIp =
        document.getElementById(
            "server-ip"
        );


    if (
        copyButton &&
        serverIp
    ) {

        copyButton.addEventListener(
            "click",
            async function () {

                try {

                    await navigator.clipboard.writeText(
                        serverIp.textContent.trim()
                    );

                    var original =
                        copyButton.textContent;

                    copyButton.textContent =
                        "COPIED";

                    setTimeout(
                        function () {

                            copyButton.textContent =
                                original;

                        },
                        1200
                    );

                } catch (error) {

                    console.error(
                        "Failed to copy IP:",
                        error
                    );
                }
            }
        );
    }

});
