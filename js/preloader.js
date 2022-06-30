var pmsm = pmsm || {};

pmsm.startPreload = function (progress_text) {

    pmsm.progressText = progress_text;
    const loader = pmsm.app.loader;

    // Load images.
    loader
        .add('hv1', './assets/hv1_symbol.png')
        .add('hv2', './assets/hv2_symbol.png')
        .add('hv3', './assets/hv3_symbol.png')
        .add('hv4', './assets/hv4_symbol.png')

        .add('lv1', './assets/hv1_symbol.png')
        .add('lv2', './assets/lv2_symbol.png')
        .add('lv3', './assets/lv3_symbol.png')
        .add('lv4', './assets/lv4_symbol.png')

        .add('spin_button', './assets/spin_button.png');

    // Assign Event (Minievent / Signal?) Handlers.
    loader.onProgress.add(pmsm.onPreloadProgress);
    loader.onComplete.add(pmsm.onPreloadComplete);
    loader.onError.add(pmsm.onPreloadError);

    // Start the loading.
    loader.load();
}

pmsm.onPreloadProgress = function (e) {
    console.log("Preload progress: ", e.progress);
    if (pmsm.progressText) {
        pmsm.progressText.text = e.progress.toFixed(2) + " / 100";
    }
}

pmsm.onPreloadError = function (e) {
    console.erro("Preload error: ", e.message);
}

pmsm.onPreloadComplete = function () {
    console.log("Preload complete.");
    if (pmsm.progressText) {
        pmsm.progressText.text = "Preload Complete";
        setTimeout(function startGameDelayed() {
            pmsm.gameContainer.removeChild(pmsm.progressText);
            pmsm.startGame();
        }, 1000);
    }
    else {
        pmsm.startGame();
    }
}
