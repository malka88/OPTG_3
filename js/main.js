var container;
var camera, scene, renderer;
var clock = new THREE.Clock();
var imagedata
var geometry;
//var spotlight = new THREE.PointLight(0xffffff);
var keyboard = new THREEx.KeyboardState();

var parrotPath;
var flamingoPath;

var N = 350;
var mixer, morphs = [];
var vertices = [];

var t = 0.0;
var T = 10.0
var followParrot = false;
var followFlamingo = false;

init();
animate();

function crGrass()
{
    geometry = new THREE.Geometry();
 
    for (var i = 0; i < N; i++)
        for (var j = 0; j < N; j++)
        {
            var h = getPixel( imagedata, i, j );
            geometry.vertices.push(new THREE.Vector3( i, h/10.0, j));
        }

    for(var i = 0; i < (N - 1); i++)
    {
        for(var j = 0; j < (N - 1); j++)
        {
            var vertex1 =  i + j * N;
            var vertex2 = (i + 1) + j * N;
            var vertex3 = i + (j + 1) * N;
            var vertex4 = (i + 1) + (j + 1) * N;

            geometry.faces.push(new THREE.Face3(vertex1, vertex2, vertex4));
            geometry.faces.push(new THREE.Face3(vertex1, vertex4, vertex3));

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))
            ]);

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),
                new THREE.Vector2(i/(N-1), (j+1)/(N-1))
            ]);
        } 
    }
    geometry.computeFaceNormals();  
    geometry.computeVertexNormals();

    var loader = new THREE.TextureLoader();
    var tex = loader.load( 'pics/grasstile.jpg' );

    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
        
    var mat = new THREE.MeshLambertMaterial({    
        map: tex,    
        wireframe: false,    
        side: THREE.DoubleSide 
    });
 
    var Mmesh = new THREE.Mesh(geometry, mat); 
    Mmesh.position.set(0.0, 0.0, 0.0);
    
    Mmesh.receiveShadow = true;
    scene.add(Mmesh);
}

function crSky()
{
    var loader = new THREE.TextureLoader();
    var geometry = new THREE.SphereGeometry( 1000, 32, 32 );
    var tex = loader.load( 'pics/sky.jpg' );
    
    tex.minFilter = THREE.NearestFilter;

    var material = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide
    });

    sphere = new THREE.Mesh( geometry, material );

    scene.add( sphere );
    
}

function crParrot()
{    
    var curve1 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 60, 50, 170 ), 
        new THREE.Vector3( 75, 50, 50 ),
        new THREE.Vector3( 225, 50, 50 ),
        new THREE.Vector3( 240, 50, 170)  
    );

    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 240, 50, 180),
        new THREE.Vector3( 225, 50, 300 ),
        new THREE.Vector3( 75, 50, 300 ),        
        new THREE.Vector3( 60, 50, 180 )
    );

    vertices = curve1.getPoints( 200 );
    vertices = vertices.concat(curve2.getPoints( 200 ))
    var path = new THREE.CatmullRomCurve3(vertices);
    path.closed = true;

    vertices = path.getPoints(500);

    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    var material = new THREE.LineBasicMaterial({color: 0xffff00});
    var curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);

    return path;
}

function crFlamigo()
{
    var curve1 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 66, 30, 187 ), 
        new THREE.Vector3( 82.5, 30, 55 ),
        new THREE.Vector3( 247.5, 30, 55 ),
        new THREE.Vector3( 264, 30, 187)  
    );

    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 264, 30, 198),
        new THREE.Vector3( 247.5, 30, 330 ),
        new THREE.Vector3( 82.5, 30, 330 ),        
        new THREE.Vector3( 66, 30, 187 )
    );

    vertices = curve1.getPoints( 200 );
    vertices = vertices.concat(curve2.getPoints( 200 ))
    var path = new THREE.CatmullRomCurve3(vertices);
    path.closed = true;

    vertices = path.getPoints(500);

    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    var material = new THREE.LineBasicMaterial({color: 0xffff00});
    var curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);

    return path;
}

function init()
{
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000); 
    camera.position.set(N/2, N/2, N*1.5);
    camera.lookAt(new THREE.Vector3( N/2, 0, N/2));
    
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x0000ff, 1);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

    var light = new THREE.DirectionalLight(0xffff00);
    light.position.set( N, N/2, N/2 );   
    light.target = new THREE.Object3D();

    light.target.position.set( N/2, 0, N/2 );
    scene.add(light.target);

    light.castShadow = true;
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 45, 1, 1, 1000 ) );
    light.shadow.bias = 0.0001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;

    scene.add( light );

    var helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(helper);

    crSky();

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var img = new Image();

    mixer = new THREE.AnimationMixer(scene);
    
    img.onload = function()
    {    
        canvas.width = img.width;    
        canvas.height = img.height;    
        context.drawImage(img, 0, 0 );    
        imagedata = context.getImageData(0, 0, img.width, img.height);
        crGrass();

        loadModel('models/1/', "Tree.obj", "Tree.mtl");
        loadModel('models/2/', "Palma 001.obj", "Palma 001.mtl");
    }

    parrotPath = crParrot();
    flamingoPath = crFlamigo();

    loadAnimatedModel('models/Parrot.glb', parrotPath);
    loadAnimatedModel('models/Flamingo.glb', flamingoPath);

    img.src = 'pics/plateau.jpg';
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate()
{
    var delta = clock.getDelta();

    mixer.update( delta );

    t += delta;

    for ( var i = 0; i < morphs.length; i++ )
    {
        var morph = morphs[ i ];
        var pos = new THREE.Vector3();
        
        if ( t >= T) t = 0.0;
        pos.copy(morph.controlled.getPointAt(t/T));
        morph.mesh.position.copy(pos);
        //t += 0.015

        if ( (t + 0.001) >= T) 
            t = 0.0;

        var nextPoint = new THREE.Vector3();
        nextPoint.copy(morph.controlled.getPointAt((t + 0.001)/T));
        morph.mesh.lookAt(nextPoint);

        if (followParrot && i==0)
        {
            var relativeCameraOffset = new THREE.Vector3(0,50,-150 );
            var m1 = new THREE.Matrix4();
            var m2 = new THREE.Matrix4();

            m1.extractRotation(morph.mesh.matrixWorld);
            m2.copyPosition(morph.mesh.matrixWorld);
            m1.multiplyMatrices(m2, m1);

            var cameraOffset = relativeCameraOffset.applyMatrix4(m1);
            camera.position.copy(cameraOffset);
            camera.lookAt(morph.mesh.position );
        }

        if (followFlamingo && i==1)
        {
            var relativeCameraOffset = new THREE.Vector3(0,50,-150 );
            var m1 = new THREE.Matrix4();
            var m2 = new THREE.Matrix4();

            m1.extractRotation(morph.mesh.matrixWorld);
            m2.copyPosition(morph.mesh.matrixWorld);
            m1.multiplyMatrices(m2, m1);

            var cameraOffset = relativeCameraOffset.applyMatrix4(m1);
            camera.position.copy(cameraOffset);
            camera.lookAt(morph.mesh.position );
        }
    }

    if (keyboard.pressed("0")){
        followParrot = false;
        followFlamingo = false;
        camera.position.set(N/2, N/2, N*1.5);
        camera.lookAt(new THREE.Vector3( N/2, 0, N/2));
    }

    if (keyboard.pressed("1")){
        followParrot = true;
        followFlamingo = false;
    }

    if (keyboard.pressed("2")){
        followParrot = false;
        followFlamingo = true;
    }

    requestAnimationFrame( animate );
    render();
}

function render()
{        
    renderer.render( scene, camera );
}

function loadModel(path, oname, mname)
{
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) { };

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( path );

    mtlLoader.load ( mname, function( materials )
    {
        materials.preload();
        
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials ( materials );
        objLoader.setPath( path );

        objLoader.load ( oname, function ( object )
        {
            
            object.castShadow = true;
            object.traverse( function ( child )
            {
                if ( child instanceof THREE.Mesh )
                {
                    child.castShadow = true;
                }
            } );


            for(var i = 0; i < 10; i++)
            {
                var x = Math.random()*N;
                var z = Math.random()*N;
                var y = geometry.vertices[Math.round(z) + Math.round(x) * N].y;

                object.position.x = x;
                object.position.y = y;
                object.position.z = z;
                

                var s = (Math.random() * 100) + 30;
                s /= 400.0;
                object.scale.set(s, s, s);
                scene.add( object.clone());
            }
        }, onProgress, onError ); 
    });
}

function loadAnimatedModel(path, controlled)
{
    var loader = new THREE.GLTFLoader();

    loader.load( path, function ( gltf ) {
        var mesh = gltf.scene.children[ 0 ];
        var clip = gltf.animations[ 0 ];

        mixer.clipAction( clip, mesh ).setDuration( 1 ).startAt( 0 ).play();
        
        mesh.position.set(N/2, N/5, N/2);
        mesh.rotation.y = Math.PI / 8;
        mesh.scale.set( 0.2, 0.2, 0.2 );

        mesh.castShadow = true;
        //mesh.receiveShadow = true;

        scene.add( mesh );

        model = {};
        model.mesh = mesh;
        model.controlled = controlled;
        morphs.push( model );

        //if(controlled == false)
        //    morphs.push( mesh );

        //return mesh;
    });
}
        

function getPixel( imagedata, x, y )  
{    
    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;    
    return data[ position ];
}
