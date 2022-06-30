window.onload = function () {
    pmsm.initApp();
}


/**
 * Pixi minimal slot machine (space?).
 * Just so we don't needlessly polute the window space.
 */
var pmsm = pmsm || {};

/**
 * Enable the 'resize' event listener.
 */
pmsm.enabledResizeListener = function () {
    if (pmsm && pmsm.onResize)
        window.addEventListener('resize', pmsm.onResize.bind(this), false);
}

/**
 * Called every time the browser resizes or device orientation changes.
 */
pmsm.onResize = function () {
    let app = this.app;
    app.view.style.width = window.innerWidth + 'px';
    app.view.style.height = window.innerHeight + 'px';

    // Resize the PIXI renderer
    // Let PIXI know that we changed the size of the viewport
    app.renderer.resize(window.innerWidth, window.innerHeight);

    pmsm.fit();
}

/**
 * Fit all the game elements into the available screen coordinates.
 */
pmsm.fit = function () {

}

/**
 * Pixi app initialization.
 */
pmsm.initApp = function () {
    pmsm.app = new PIXI.Application({
        width: window.innerWidth, height: window.innerHeight,
        roundPixels: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
        // antialias: true
    });

    let app = pmsm.app;

    app.renderer.backgroundColor = 0xbce1e8;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.renderer.view.style.position = 'absolute';
    document.body.appendChild(app.view);

    // Add a game container to be able to fit the game sprites based on available space.
    pmsm.gameContainer = new PIXI.Container();
    app.stage.addChild(pmsm.gameContainer);

    pmsm.enabledResizeListener();

    // _ (underscore) separated variable names are used for method parameters and method scoped variables.
    // Add a text for showing the asset preloading %.
    let pixi_text = new PIXI.Text('This is a PixiJS text', { fontFamily: 'Arial', fontSize: 24, fill: 0x010101, align: 'center' });
    pixi_text.anchor.x = 0.5;
    pixi_text.anchor.y = 0.5;
    pixi_text.x = app.renderer.screen.width / 2;
    pixi_text.y = app.renderer.screen.height / 2;

    pmsm.gameContainer.addChild(pixi_text);
    pmsm.startPreload(pixi_text);
}

pmsm.startGame = function () {
    console.log("Game Start ...");

    // Build the animated sprites to display the reels.
    pmsm.FRAMES = [
        'hv1', 'hv2', 'hv3', 'hv4',
        'lv1', 'lv2', 'lv3', 'lv4'
    ];

    pmsm.FRAME_TO_INDEX = new Map();
    pmsm.FRAMES.forEach(element => {
        pmsm.FRAME_TO_INDEX.set(element, pmsm.FRAMES.indexOf(element));
    });

    // pmsm.NUM_RELS = 5;
    pmsm.REEL_MAX_INDEX = 19;
    pmsm.REEL_MAX_SYMBOLS = 20;
    // pmsm.TOTAL_REEL_DISPLAY = 15;
    pmsm.NUM_COLS_DISPLAY = 5;
    pmsm.NUM_ROWS_DISPLAY = 3;

    pmsm.reelPadding = { x: 20, y: 20 };
    pmsm.reelContainer = new PIXI.Container();
    pmsm.gameContainer.addChild(pmsm.reelContainer);

    // Build the reel sets.
    pmsm.REELS = [
        ["hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2"],
        ["hv1", "lv2", "lv3", "lv2", "lv1", "lv1", "lv4", "lv1", "lv1", "hv4", "lv3", "hv2", "lv1", "lv3", "hv1", "lv1", "lv2", "lv4", "lv3", "lv2"],
        ["lv1", "hv2", "lv3", "lv4", "hv3", "hv2", "lv2", "hv2", "hv2", "lv1", "hv3", "lv1", "hv1", "lv2", "hv3", "hv2", "hv4", "hv1", "lv2", "lv4"],
        ["hv2", "lv2", "hv3", "lv2", "lv4", "lv4", "hv3", "lv2", "lv4", "hv1", "lv1", "hv1", "lv2", "hv3", "lv2", "lv3", "hv2", "lv1", "hv3", "lv2"],
        ["lv3", "lv4", "hv2", "hv3", "hv4", "hv1", "hv3", "hv2", "hv2", "hv4", "hv4", "hv2", "lv2", "hv4", "hv1", "lv2", "hv1", "lv2", "hv4", "lv4"]
    ];

    pmsm.reelPositions = [18, 9, 2, 0, 12];

    pmsm.displayReels = [];
    for (let row = 0; row < pmsm.NUM_ROWS_DISPLAY; row++) {

        for (let col = 0; col < pmsm.NUM_COLS_DISPLAY; col++) {
            // Create an animation containing all possible slot graphics.
            // This will be use to display a reel symbol.
            let anim_spr = PIXI.AnimatedSprite.fromFrames(pmsm.FRAMES);

            // Position the animation sprite into a logical space of 
            // w = NUM_ROWS_DISPLAY * (anim_spr.width + reelPadding.x);
            // y = NUM_COLS_DISPLAY * (anim_spr.height + reelPadding.y);
            anim_spr.x = col * (anim_spr.width + pmsm.reelPadding.x);
            anim_spr.y = row * (anim_spr.height + pmsm.reelPadding.y);
            anim_spr.gotoAndStop(0);
            pmsm.reelContainer.addChild(anim_spr);
            pmsm.displayReels.push(anim_spr);
        }

    }

    pmsm.reelContainer.x = 100;
    pmsm.reelContainer.y = 50;

    pmsm.displayReelsPositions();
}

pmsm.displayReelsPositions = function () {
    // pmsm.reelPositions
    for (let col = 0; col < pmsm.NUM_COLS_DISPLAY; col++) {
        for (let row = 0; row < pmsm.NUM_ROWS_DISPLAY; row++) {
            const spr_anim = pmsm.displayReels[row * pmsm.NUM_COLS_DISPLAY + col];
            
            // TODO: fix high indexes.
            const reel_pos = pmsm.reelPositions[col];
            // debugger
            const symbol = pmsm.REELS[col][(reel_pos + row) % pmsm.REEL_MAX_SYMBOLS];
            console.log("symbol: [" + symbol + "]" + ", index: [" + pmsm.FRAME_TO_INDEX.get(symbol) + "]");
            spr_anim.gotoAndStop(pmsm.FRAME_TO_INDEX.get(symbol));
        }

    }
}

/**
 * Simulate reel spinning by randomly picking a top position.
 */
pmsm.doSpin = function () {

}