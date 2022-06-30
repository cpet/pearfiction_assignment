window.onload = function () {
    initApp();
}

/**
 * Pixi minimal slot machine (space?).
 * Just so we don't needlessly polute the window space.
 */
const pmsm = { 
    app: undefined,
    gameContainer: undefined 
};

/**
 * Pixi app initialization.
 */
function initApp() {
    pmsm.app = new PIXI.Application({
        width: window.innerWidth, height: window.innerHeight,
        roundPixels: true,
        // antialias: true
    });

    let app = pmsm.app;

    app.renderer.backgroundColor = 0x24393D;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.renderer.view.style.position = 'absolute';
    document.body.appendChild(app.view);

    // Add a game container to be able to fit the game sprites based on available space.
    pmsm.gameContainer = new PIXI.Container();
    app.stage.addChild(pmsm.gameContainer);

    pmsm.enabledResizeListener();
}

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

    fit();
}

/**
 * Fit all the game elements into the available screen coordinates.
 */
pmsm.fit = function() {

}