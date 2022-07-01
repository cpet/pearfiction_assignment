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
    pmsm.fitGame();
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

    app.renderer.backgroundColor = 0xf2ece6;
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

    pmsm.fit();
}