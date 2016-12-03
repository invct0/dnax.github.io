function degToRad(d) {
    return d * (Math.PI / 180.0);
}

var g = window;

/* as name says */
function init() {
    g.canvas = document.getElementById("renderCanvas");
    g.engine = new BABYLON.Engine(canvas, true);
    init_scene();
    init_GUI();
}

function init_GUI() {

    g.gui = new CASTORGUI.GUIManager(canvas);

    var f = new CASTORGUI.GUIWindow("F", 
            { 
                x : gui.getCanvasSize().width - 300, 
                y : 25,
                w : 250, h : 200,
                textTitle : "DNA",
                titleColor : "red"
            }, gui);

    var o = {
        x : 10, text : "To jest DNA <br> I CHUJ!"
            };

    var text = new CASTORGUI.GUIText("textInfo", o, gui, false);

    var clb = function(x) {
        console.log(x);
        dna0.position.x = Math.sin(x.srcElement.value);
    }

    var sli = new CASTORGUI.GUISlider("S",
            {
                x : 10, 
                y : 125,
                w : 200,
                h : 20
            }, gui, clb, false);

    f.add(sli);
    f.add(text);
    f.setVisible(true);
}

function init_camera() {
    g.camera = new BABYLON.FreeCamera("cam0", 
            new BABYLON.Vector3(0, 5, -5), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);
    camera.keysUp[0] = 87;
    camera.keysDown[0] = 83;
    camera.keysLeft[0] = 65;
    camera.keysRight[0] = 68; 
}

function init_lights() {
    g.l0 = new BABYLON.HemisphericLight("l0",
         new BABYLON.Vector3(-100, 10, 0), scene);
}

function init_terrain() {

    /* Terrain material */
    g.tr_mat = new BABYLON.StandardMaterial('tmat', scene);
    g.tr_mat.diffuseTexture = 
        new BABYLON.Texture("textures/grass.dds", scene);

    /* Texture repeating */
    g.tr_mat.diffuseTexture.uScale = 64.0;
    g.tr_mat.diffuseTexture.vScale = 64.0;

    /* Terrain mesh */
    g.ground = BABYLON.Mesh.CreatePlane("p", 100.0, scene);
    g.ground.material = tr_mat;
    g.ground.rotation.x = Math.PI / 2;
}

/* Init DNA mesh */
function create_dna_mesh(length, step) {
    var l0 = [], l1 = [];
    var l2 = [
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(-0.9, 0, 0)
             ];

    var l3 = [
                new BABYLON.Vector3(0.0, 0.0, 0.0),
                new BABYLON.Vector3(1.0, 0.0, 0.0)
             ];

    var x = 0.0;

    /* Generate helical lines */
    for(var i=0;i<length;++i) {
        l0.push(new BABYLON.Vector3(Math.cos(x), x, Math.sin(x)));
        l1.push(new BABYLON.Vector3(-Math.cos(x), x, -Math.sin(x)));
        x += step;
    }

    /* Atoms meshes */
    var ats = [];
    for(var i=0;i<4;++i) {
        ats[i] = BABYLON.Mesh.CreateSphere("S", 0.5, 0.19, scene, false,
                 BABYLON.Mesh.DOUBLESIDE);
        ats[i].position.y = -10;

    }

    /* Helic mesh */
    var h0 = BABYLON.Mesh.CreateLines("lh", l0, scene);
    var h1 = BABYLON.Mesh.CreateLines("lr", l1, scene);

    h0.color = new BABYLON.Color3(1, 0, 0);
    h1.color = new BABYLON.Color3(0, 0, 1);

    h1.parent = h0;

    /* Atom colors */
    var colors = [];

    colors[0] = new BABYLON.StandardMaterial("rat", scene);
    colors[0].diffuseColor = new BABYLON.Color3(1, 0, 0);

    colors[1] = new BABYLON.StandardMaterial("gat", scene);
    colors[1].diffuseColor = new BABYLON.Color3(0, 1, 0);

    colors[2] = new BABYLON.StandardMaterial("bat", scene);
    colors[2].diffuseColor = new BABYLON.Color3(1, 1, 0);

    colors[3] = new BABYLON.StandardMaterial("kat", scene);
    colors[3].diffuseColor = new BABYLON.Color3(1, 0, 1);

    ats[0].material = colors[0];
    ats[1].material = colors[1];
    ats[2].material = colors[2];
    ats[3].material = colors[3];

    /* Generate atoms and set lines rotation */
    for(var i=0, x=0;i<length;++i) {
        var ln_l = BABYLON.Mesh.CreateLines("ln_"+i, l2, scene);
        var ln_r = BABYLON.Mesh.CreateLines("la_"+i, l3, scene);

        var inst_at_l = ats[(i+1)%4].createInstance("il" + i, scene);
        var inst_at_r = ats[(i+3)%4].createInstance("ir" + i, scene);
                
        inst_at_l.parent = h0;
        inst_at_r.parent = h1;
      
        ln_l.parent = inst_at_l;
        ln_r.parent = inst_at_r;

        inst_at_l.position = new BABYLON.Vector3( Math.cos(x), x,  Math.sin(x));
        inst_at_r.position = new BABYLON.Vector3(-Math.cos(x), x, -Math.sin(x));

        inst_at_l.lookAt(inst_at_r.position,-Math.PI/2, 0);
        inst_at_r.lookAt(inst_at_l.position, Math.PI/2, 0);

        x += step;
    }

    /* Little bit upwards */
    h0.position.y = 2.0;
    return h0;
}

function init_scene() {
    g.scene = new BABYLON.Scene(engine);
    scene.debugLayer.show();
    init_camera();    
    init_lights();

    init_terrain();
    g.dna0 = create_dna_mesh(16, 0.5);

    var h = new BABYLON.StandardMaterial("STA", scene);
    h.diffuseTexture = new BABYLON.Texture("textures/dna.png", scene);
    h.diffuseTexture.hasAlpha = true;

    var p = BABYLON.Mesh.CreatePlane("P", 2.0, scene);
    p.position.y = 11.0;
    p.scaling.x = 2.0;
    p.material = h;

    camera.setTarget(new BABYLON.Vector3(0, 5, 0));
    camera.position.z -= 5.0 * 2;

    init_callbacks();
} 

function init_callbacks() {
    engine.runRenderLoop(function() {
        scene.render();
    });

    scene.beforeRender = function() {
        g.dna0.rotation.y += 0.01;
    };

    window.addEventListener("resize", function() {
        engine.resize();
    });
}


