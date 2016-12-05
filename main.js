function degToRad(d) {
    return d * (Math.PI / 180.0);
}

var g = window;

function init() {
    g.canvas = document.getElementById("renderCanvas");
    g.engine = new BABYLON.Engine(canvas, true);
    init_scene();
    init_GUI();
}

function init_GUI() {

    g.gui = new CASTORGUI.GUIManager(canvas);
    g.an_locked = false;

    var lock = function() {
        g.an_locked = false;
    }

    var cb0 = function() {
        if(!an_locked) {
            scene.beginDirectAnimation(dna0[1], [dna_animation_pos0],
                    0, 100, false, 1, lock);
            scene.beginDirectAnimation(dna0[1], [dna_animation_rot0],
                    0, 100, false, 1, lock);

            an_locked = true;
        }
    };
    var cb1 = function() {
        if(!an_locked) {
            scene.beginDirectAnimation(dna0[1], [dna_animation_pos0],
                    100, 200, false, 1, lock);
            scene.beginDirectAnimation(dna0[1], [dna_animation_rot0],
                    100, 200, false, 1, lock);
            an_locked = true;
        }
    };

    /* 'disconnect' button */
    g.button_dc = new CASTORGUI.GUIButton("b0", 
            {
                x : 10,               
                value : "Rozłącz",
                backgroundColor : "red",
            }, gui, cb0, false);

    /* 'connect' button */
    g.button_cn = new CASTORGUI.GUIButton("b1",
            {
                x : 75,
                value : "Połącz",
                backgroundColor : "green",
            }, gui, cb1, false);

    g.checkbox_rt = new CASTORGUI.GUICheckbox("rt0",
            {
                x : 10,
                y : 75
            }, gui, undefined, false);

    g.checkbox_label = new CASTORGUI.GUILabel("gl0",
            {
                w : 50,
                h : 30,
                x : 30,
                y : 75,
                text : "Obracaj DNA"
            }, gui, false);

    /* Window at right side */
    var win_r0 = new CASTORGUI.GUIWindow("w0",
            {
                x : gui.getCanvasSize().width - 300,
                y : 25,
                w : 250, h : 200,
                textTitle : "Bajery"
            }, gui);

    win_r0.setVisible(true);
    win_r0.add(button_dc);
    win_r0.add(button_cn);
    win_r0.add(checkbox_rt);
    win_r0.add(checkbox_label);
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
        new BABYLON.Texture('data:', scene, false, true, 1,
                null, null, _grass_txt1, true);

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
                new BABYLON.Vector3(-1, 0, 0)
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
    g.colors = [];

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
    return [h0, h1];
}

function create_chromosome() {


    var cyl0 = new BABYLON.Mesh.CreateCylinder("cyl0",
            1.0, 1.0, 1.0, 8, 1, scene, false);

    var cyl1 = new BABYLON.Mesh.CreateCylinder("cyl0",
            2.0, 1.0, 1.0, 8, 1, scene, false);

    var cyl2 = new BABYLON.Mesh.CreateCylinder("cyl0",
            0.5, 1.0, 1.0, 8, 1, scene, false);
    var cyl3 = new BABYLON.Mesh.CreateCylinder("cyl0",
            1.5, 1.0, 1.0, 8, 1, scene, false);
    
    var sph = new BABYLON.Mesh.CreateSphere("sph0", 4, 1.0, scene,
            BABYLON.Mesh.DOUBLESIDE);
    var sph1 = sph.createInstance("in0", scene);

    cyl1.parent = cyl0;
    cyl2.parent = cyl1;
    cyl3.parent = cyl2;
    sph.parent = cyl3;
    sph1.parent = cyl0;

    cyl1.position.y = 1.5;
    cyl2.position.y = 1.25;
    cyl3.position.y = 1.0;
    sph.position.y = 0.80;
    sph1.position.y = -0.50;

    cyl0.material = colors[0];
    cyl1.material = colors[1];
    cyl2.material = colors[2];
    cyl3.material = colors[3];

    return cyl0;    
}

function init_animations() {
    g.dna_animation_pos0 = 
        new BABYLON.Animation("dap0",
            "position.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                              BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);

    g.dna_animation_rot0 = 
        new BABYLON.Animation("rot0",
            "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                              BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);

    /* Mehhhh, Animation keys :/ */
    var anim_frm = [
        { frame : 0, value : 0 },
        { frame : 100, value : 5.0 },
        { frame : 200, value : 0 }
    ];

    var rot_frm = [
        { frame : 0, value : 0 },
        { frame : 100, value : degToRad(180.0) },
        { frame : 200, value : 0 }
    ];

    dna_animation_pos0.setKeys(anim_frm);
    dna_animation_rot0.setKeys(rot_frm);
}

function init_c2d() {
    var t3d0 = new BABYLON.Text2D("Tak chyba \nwygląda DNA",
            {
                x : 0,
                y : 150,
                fontName : "Bold 30pt Arial",
                defaultFontColor : new BABYLON.Color4(1, 0, 0, 1)
            });

    var t3d1 = new BABYLON.Text2D("A tak, chyba\nchromosom",
            {
                x : 0,
                y : 150,
                fontName : "Bold 30pt Arial",
                defaultFontColor : new BABYLON.Color4(0, 0, 1, 1)
            });

    var c3d0 = new BABYLON.WorldSpaceCanvas2D(scene, 
              new BABYLON.Size(5, 5), {
                  id : "w3d",
                  worldPosition : new BABYLON.Vector3(-5.0, 5.0, 0.0),
                  renderScaleFactor : 64,
                  backgroundFill : "#C0C0C040",
                  children : [t3d0]
              });

    var c3d1 = new BABYLON.WorldSpaceCanvas2D(scene, 
              new BABYLON.Size(5, 5), {
                  id : "w3d",
                  worldPosition : new BABYLON.Vector3(15.0, 5.0, 0.0),
                  renderScaleFactor : 64,
                  backgroundFill : "#C0C0C040",
                  children : [t3d1]
              });
}

function init_scene() {
    g.scene = new BABYLON.Scene(engine);
    //scene.debugLayer.show();

    init_camera();    
    init_lights();
    init_animations();
    init_c2d();
    init_terrain();
    
    g.dna0 = create_dna_mesh(16, 0.5);
    g.chr0 = create_chromosome();
    
    g.chr0.position.x = 10.0;
    g.chr0.position.y = 3.0;

    camera.position.z = -15;
    camera.position.x = 15.0;
    camera.setTarget(new BABYLON.Vector3(10, 5, 0));

    init_callbacks();
} 

function init_callbacks() {
    engine.runRenderLoop(function() {
        scene.render();
    });

    scene.beforeRender = function() {
        if(checkbox_rt.isChecked()) {
            g.dna0[0].rotation.y += 0.01;
        }
    };

    window.addEventListener("resize", function() {
        engine.resize();
    });
}


