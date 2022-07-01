var pmsm = pmsm || {};

/**
 * 
 */
pmsm.startGame = function () {
    console.log("Game Start ...");

    pmsm.TEXTURES = {
        'hv1': PIXI.Texture.from('hv1'),
        'hv2': PIXI.Texture.from('hv2'),
        'hv3': PIXI.Texture.from('hv3'),
        'hv4': PIXI.Texture.from('hv4'),
        'lv1': PIXI.Texture.from('lv1'),
        'lv2': PIXI.Texture.from('lv2'),
        'lv3': PIXI.Texture.from('lv3'),
        'lv4': PIXI.Texture.from('lv4')
    }

    pmsm.REEL_MAX_SYMBOLS = 20;
    pmsm.NUM_COLS_DISPLAY = 5;
    pmsm.NUM_ROWS_DISPLAY = 3;

    pmsm.reelPadding = { x: 20, y: 20 };
    pmsm.reelMargin = { x: 20, y: 20 };
    pmsm.reelContainer = new PIXI.Container();

    pmsm.uiMargin = { x: 20, y: 20 };
    pmsm.uiContainer = new PIXI.Container();

    pmsm.gameContainer.addChild(pmsm.reelContainer);
    pmsm.gameContainer.addChild(pmsm.uiContainer);

    // Build the reel sets.
    pmsm.REELS = [
        ["hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2"],
        ["hv1", "lv2", "lv3", "lv2", "lv1", "lv1", "lv4", "lv1", "lv1", "hv4", "lv3", "hv2", "lv1", "lv3", "hv1", "lv1", "lv2", "lv4", "lv3", "lv2"],
        ["lv1", "hv2", "lv3", "lv4", "hv3", "hv2", "lv2", "hv2", "hv2", "lv1", "hv3", "lv1", "hv1", "lv2", "hv3", "hv2", "hv4", "hv1", "lv2", "lv4"],
        ["hv2", "lv2", "hv3", "lv2", "lv4", "lv4", "hv3", "lv2", "lv4", "hv1", "lv1", "hv1", "lv2", "hv3", "lv2", "lv3", "hv2", "lv1", "hv3", "lv2"],
        ["lv3", "lv4", "hv2", "hv3", "hv4", "hv1", "hv3", "hv2", "hv2", "hv4", "hv4", "hv2", "lv2", "hv4", "hv1", "lv2", "hv1", "lv2", "hv4", "lv4"]
    ];

    pmsm.reelPositions = [0, 0, 0, 0, 0];// OK.
    // pmsm.reelPositions = [18, 9, 2, 0, 12];// OK.

    pmsm.displayReels = [];
    for (let col = 0; col < pmsm.NUM_COLS_DISPLAY; col++) {
        for (let row = 0; row < pmsm.NUM_ROWS_DISPLAY; row++) {

            // Create an animation containing all possible slot graphics.
            // This will be use to display a reel symbol.
            let spr = PIXI.Sprite.from('hv1');

            // Position the animation sprite into a logical space of 
            // w = NUM_ROWS_DISPLAY * (spr.width + reelPadding.x);
            // y = NUM_COLS_DISPLAY * (spr.height + reelPadding.y);
            spr.x = col * (spr.width + pmsm.reelPadding.x);
            spr.y = row * (spr.height + pmsm.reelPadding.y);

            pmsm.reelContainer.addChild(spr);
            pmsm.displayReels.push(spr);
        }
    }

    // Symbol id | 3 of a kind | 4 of a kind | 5 of a kind 
    // -----------|-------------|-------------|-------------
    //      hv1   |      10     |      20     |      50
    // -----------|-------------|-------------|-------------
    //      hv2   |      5      |      10     |      20
    // -----------|-------------|-------------|-------------
    //      hv3   |      5      |      10     |      15
    // -----------|-------------|-------------|-------------
    //      hv4   |      5      |      10     |      15 
    // -----------|-------------|-------------|-------------
    //      lv1   |      2      |      5      |      10 
    // -----------|-------------|-------------|-------------
    //      lv2   |      1      |      2      |      5 
    // -----------|-------------|-------------|-------------
    //      lv3   |      1      |      2      |      3 
    // -----------|-------------|-------------|-------------
    //      lv4   |      1      |      2      |      3 
    // -----------|-------------|-------------|-------------

    pmsm.winsTable = {
        "hv1": [10, 20, 50],
        "hv2": [5, 10, 20],
        "hv3": [5, 10, 15],
        "hv4": [5, 10, 15],

        "lv1": [2, 5, 10],
        "lv2": [1, 2, 5],
        "lv3": [1, 2, 3],
        "lv4": [1, 2, 3],
    };

    pmsm.initSpinButton();
    pmsm.initWinsTextField();

    pmsm.fitGame();
}

/**
 * 
 */
pmsm.fitGame = function () {
    if (!pmsm.reelMargin) {
        return;
    }
    pmsm.reelContainer.x = pmsm.reelMargin.x;
    pmsm.reelContainer.y = pmsm.reelMargin.y;


    if (pmsm.uiMargin) {
        pmsm.uiContainer.x = pmsm.uiMargin.x + pmsm.reelContainer.x + pmsm.reelContainer.width;
        pmsm.uiContainer.y = pmsm.uiMargin.y;
    }

    let screen = pmsm.app.renderer.screen;
    let logical_width, logical_height;

    if (screen.width >= screen.height) {
        // Landscape orientation. 500 comes from the wining textfield on the right.
        logical_width = (pmsm.reelMargin.x * 2) + 5 * (250 + pmsm.reelPadding.x) + 500;
        logical_height = (pmsm.reelMargin.y * 4) + 3 * (250 + pmsm.reelPadding.y);

        const scaleX = screen.width / logical_width;
        const scaleY = screen.height / logical_height;

        pmsm.gameContainer.scale.x = pmsm.gameContainer.scale.y = Math.min(scaleX, scaleY);

        // Reset the UI to the Landscape coordinates.
        pmsm.spinButton.x = 30;
        pmsm.spinButton.y = 125;
        pmsm.winsText.y = 0;
        pmsm.winsText.y = 400;
    }
    else {

        // Portrait orientation. 700 comes from the bottom part (multi-line text field + spin button).
        logical_width = (pmsm.reelMargin.x * 2) + 5 * (250 + pmsm.reelPadding.x);
        logical_height = (pmsm.reelMargin.y * 4) + 3 * (250 + pmsm.reelPadding.y) + 700;

        const scaleX = screen.width / logical_width;
        const scaleY = screen.height / logical_height;

        pmsm.gameContainer.scale.x = pmsm.gameContainer.scale.y = Math.min(scaleX, scaleY);

        pmsm.uiContainer.x = pmsm.uiMargin.x;
        pmsm.uiContainer.y = 750 + (pmsm.reelMargin.y * 2) + (pmsm.uiMargin.y * 2);

        pmsm.spinButton.x = 500 + pmsm.uiMargin.x;
        pmsm.spinButton.y = 0

        // Reset the UI to the Landscape coordinates.
        pmsm.winsText.y = 0;
        pmsm.winsText.y = 0;
    }

    // Center alight the game contents horizontally.
    let game_cont_w = logical_width * pmsm.gameContainer.scale.x;
    if (screen.width > game_cont_w) {
        pmsm.gameContainer.x = (screen.width - game_cont_w) / 2;
    }

    // Center alight the game contents horizontally.
    let game_cont_h = logical_height * pmsm.gameContainer.scale.y;
    if (screen.height > game_cont_h) {
        pmsm.gameContainer.y = (screen.height - game_cont_h) / 2;
    }
}

/**
 * Randomly sets new reels position.
 */
pmsm.updateReelsPositions = function () {
    for (let row = 0; row < pmsm.NUM_ROWS_DISPLAY; row++) {
        for (let col = 0; col < pmsm.NUM_COLS_DISPLAY; col++) {
            // console.log('display index: ', (row + col * pmsm.NUM_ROWS_DISPLAY));
            const spr = pmsm.displayReels[row + col * pmsm.NUM_ROWS_DISPLAY];

            const reel_pos = pmsm.reelPositions[col];
            const symbol = pmsm.REELS[col][(reel_pos + row) % pmsm.REEL_MAX_SYMBOLS];
            spr.texture = pmsm.TEXTURES[symbol];
        }
    }
}

/**
 * Simulate reel spinning by randomly picking a top position.
 */
pmsm.doSpin = function () {
    for (let i = 0; i < pmsm.NUM_COLS_DISPLAY; i++) {
        pmsm.reelPositions[i] = Math.floor(Math.random() * pmsm.REEL_MAX_SYMBOLS);
    }

    pmsm.updateReelsPositions();
    pmsm.updatePositionsText();

    pmsm.updateScreenText();
    pmsm.checkWins();
}

/**
 * 
 */
pmsm.checkWins = function () {
    // Pay line id | visual description
    // -------------|--------------------
    //              |      - - - - -
    //       1      |      x x x x x
    //              |      - - - - -
    // -------------|--------------------
    //              |      x x x x x
    //       2      |      - - - - -
    //              |      - - - - -
    // -------------|--------------------
    //              |      - - - - -
    //       3      |      - - - - -
    //              |      x x x x x
    // -------------|--------------------
    //              |      x x - - -
    //       4      |      - - x - -
    //              |      - - - x x
    // -------------|--------------------
    //              |      - - - x x
    //       5      |      - - x - -
    //              |      x x - - -
    // -------------|-------------------- 
    //              |      x - - - x
    //       6      |      - x - x -
    //              |      - - x - -
    // -------------|-------------------- 
    //              |      - - x - -
    //       7      |      - x - x -
    //              |      x - - - x

    let total_score = 0;

    pmsm.winsText.text += "Total wins: <total_wins_ph>\n";

    // Line 1.
    let occurences = {};
    for (let col = 0; col < pmsm.NUM_COLS_DISPLAY; col++) {
        const reel_pos = pmsm.reelPositions[col];
        // +1 for the mid lane.
        const symbol = pmsm.REELS[col][(reel_pos + 1) % pmsm.REEL_MAX_SYMBOLS];

        occurences[symbol] = occurences[symbol] + 1 || 1;
    }

    let occurence_check = pmsm.checkOccurences(occurences);
    if (occurence_check) {
        total_score += occurence_check.score;
        pmsm.addPaylineText(1, occurence_check.symbol, occurence_check.numOccurences, occurence_check.score);
    }

    // Line 2.
    occurences = {};
    for (let col = 0; col < pmsm.NUM_COLS_DISPLAY; col++) {
        const reel_pos = pmsm.reelPositions[col];
        const symbol = pmsm.REELS[col][(reel_pos)];
        occurences[symbol] = occurences[symbol] + 1 || 1;
    }

    occurence_check = undefined;
    occurence_check = pmsm.checkOccurences(occurences);
    if (occurence_check) {
        total_score += occurence_check.score;
        pmsm.addPaylineText(2, occurence_check.symbol, occurence_check.numOccurences, occurence_check.score);
    }

    // Line 3.
    occurences = {};
    for (let col = 0; col < pmsm.NUM_COLS_DISPLAY; col++) {
        const reel_pos = pmsm.reelPositions[col];
        const symbol = pmsm.REELS[col][(reel_pos + 2) % pmsm.REEL_MAX_SYMBOLS];

        occurences[symbol] = occurences[symbol] + 1 || 1;
    }

    occurence_check = undefined;
    occurence_check = pmsm.checkOccurences(occurences);
    if (occurence_check) {
        total_score += occurence_check.score;
        pmsm.addPaylineText(3, occurence_check.symbol, occurence_check.numOccurences, occurence_check.score);
    }

    ////
    let arr_to_check;

    // Line 4.
    //              |      x x - - -
    //       4      |      - - x - -
    //              |      - - - x x
    occurences = {};
    arr_to_check = [
        pmsm.REELS[0][(pmsm.reelPositions[0])],
        pmsm.REELS[1][(pmsm.reelPositions[1])],
        pmsm.REELS[2][(pmsm.reelPositions[2] + 1) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[3][(pmsm.reelPositions[3] + 2) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[4][(pmsm.reelPositions[4] + 2) % pmsm.REEL_MAX_SYMBOLS],
    ];

    arr_to_check.forEach(symbol => {
        occurences[symbol] = occurences[symbol] + 1 || 1;
    });

    occurence_check = undefined;
    occurence_check = pmsm.checkOccurences(occurences);
    if (occurence_check) {
        total_score += occurence_check.score;
        pmsm.addPaylineText(4, occurence_check.symbol, occurence_check.numOccurences, occurence_check.score);
    }

    // Line 5.
    //              |      - - - x x
    //       5      |      - - x - -
    //              |      x x - - -
    occurences = {};
    arr_to_check = [
        pmsm.REELS[0][(pmsm.reelPositions[0] + 2) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[1][(pmsm.reelPositions[1] + 2) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[2][(pmsm.reelPositions[2] + 1) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[3][(pmsm.reelPositions[3])],
        pmsm.REELS[4][(pmsm.reelPositions[4])],
    ];

    arr_to_check.forEach(symbol => {
        occurences[symbol] = occurences[symbol] + 1 || 1;
    });

    occurence_check = undefined;
    occurence_check = pmsm.checkOccurences(occurences);
    if (occurence_check) {
        total_score += occurence_check.score;
        pmsm.addPaylineText(5, occurence_check.symbol, occurence_check.numOccurences, occurence_check.score);
    }

    // Line 6.
    //              |      x - - - x
    //       6      |      - x - x -
    //              |      - - x - -
    occurences = {};
    arr_to_check = [
        pmsm.REELS[0][(pmsm.reelPositions[0])],
        pmsm.REELS[1][(pmsm.reelPositions[1] + 1) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[2][(pmsm.reelPositions[2] + 2) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[3][(pmsm.reelPositions[3] + 1) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[4][(pmsm.reelPositions[4])],
    ];

    arr_to_check.forEach(symbol => {
        occurences[symbol] = occurences[symbol] + 1 || 1;
    });

    occurence_check = undefined;
    occurence_check = pmsm.checkOccurences(occurences);
    if (occurence_check) {
        total_score += occurence_check.score;
        pmsm.addPaylineText(6, occurence_check.symbol, occurence_check.numOccurences, occurence_check.score);
    }

    // Line 7.
    //              |      - - x - -
    //       7      |      - x - x -
    //              |      x - - - x
    occurences = {};
    arr_to_check = [
        pmsm.REELS[0][(pmsm.reelPositions[0] + 2) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[1][(pmsm.reelPositions[1] + 1) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[2][(pmsm.reelPositions[2])],
        pmsm.REELS[3][(pmsm.reelPositions[3] + 1) % pmsm.REEL_MAX_SYMBOLS],
        pmsm.REELS[4][(pmsm.reelPositions[4] + 2) % pmsm.REEL_MAX_SYMBOLS],
    ];

    arr_to_check.forEach(symbol => {
        occurences[symbol] = occurences[symbol] + 1 || 1;
    });

    occurence_check = undefined;
    occurence_check = pmsm.checkOccurences(occurences);
    if (occurence_check) {
        total_score += occurence_check.score;
        pmsm.addPaylineText(7, occurence_check.symbol, occurence_check.numOccurences, occurence_check.score);
    }

    let str = pmsm.winsText.text;
    pmsm.winsText.text = str.replace("<total_wins_ph>", total_score);
}

/**
 * Checks the given occurence object for wins. 
 * @param occurences Object encapsulating number of occurences for symbols.
 * @returns an object containing the symbol number of occurences and score or undefined if no wins.
 * e.g.: { symbol: 'hv1', numOccurences: 4, score: 20 }
 */
pmsm.checkOccurences = function (occurences) {
    console.log('occurences: ', occurences);
    const score = 0;
    for (const key in occurences) {
        if (Object.hasOwnProperty.call(occurences, key)) {
            const num_occurences = occurences[key];
            if (num_occurences > 5) {
                console.error("An occurence was counted more than 5 for given key: ", key, ", this should not happen!");
            }
            else if (num_occurences > 2) {
                // For any given line (of 5), only 1 symbol may show x3 to max x5.
                // The current occurence is then the only x3+ occurence.
                return { symbol: key, numOccurences: num_occurences, score: pmsm.winsTable[key][num_occurences - 3] };
            }
        }
    }

    return undefined;
}

/**
 * 
 */
pmsm.updatePositionsText = function () {
    let str = "Positions: ";
    for (let i = 0; i < pmsm.reelPositions.length; i++) {
        str += pmsm.reelPositions[i] + ", ";
    }

    str = str.substring(0, str.length - 2);
    pmsm.winsText.text = str + "\n";
}

/**
 * 
 */
pmsm.updateScreenText = function () {
    pmsm.winsText.text += "Screen:\n";

    for (let row = 0; row < pmsm.NUM_ROWS_DISPLAY; row++) {
        for (let col = 0; col < pmsm.NUM_COLS_DISPLAY; col++) {
            const reel_pos = pmsm.reelPositions[col];
            const symbol = pmsm.REELS[col][(reel_pos + row) % pmsm.REEL_MAX_SYMBOLS];
            pmsm.winsText.text += " " + symbol;
        }
        pmsm.winsText.text += "\n";
    }
}

/**
 * 
 * @param {*} payline 
 * @param {*} symbol 
 * @param {*} num_occurences 
 * @param {*} score 
 */
pmsm.addPaylineText = function (payline, symbol, num_occurences, score) {
    pmsm.winsText.text += "Payline " + payline + ", " + symbol + " x" + num_occurences + ", " + score + "\n";
}

/**
 * 
 */
pmsm.initSpinButton = function () {
    pmsm.spinButton = PIXI.Sprite.from('spin_button');
    let button = pmsm.spinButton;
    button.x = 30;
    button.y = 125;
    button.buttonMode = true;
    button.interactive = true;

    button.on('pointerdown', function () {
        pmsm.doSpin();
    }.bind(this));

    pmsm.uiContainer.addChild(button);
}

/**
 * Adds a multiline textfield for displaying winnings.
 */
pmsm.initWinsTextField = function () {
    const style = new PIXI.TextStyle({
        wordWrap: true,
        wordWrapWidth: 500,
        fontSize: 24,

    });

    let str = //"Positions: 0, 0, 0, 0, 0";

        "Positions: 18, 16, 17, 18, 19\n" +
        "Screen:\n" +
        "hv2 hv2 hv2 lv1 hv1\n" +
        "lv3 lv1 lv3 hv1 lv2\n" +
        "lv3 lv3 lv4 lv2 hv1\n" +
        "Total wins: 6\n" +
        "- payline 1, hv2 x3, 5\n" +
        "- payline 2, lv3 x3, 1\n" +
        "- payline 3, lv3 x3, 1\n" +
        "- payline 4, lv2 x3, 1\n" +
        "- payline 5, lv3 x3, 1\n" +
        "- payline 6, lv3 x3, 1\n" +
        "- payline 7, lv3 x3, 1\n"

    pmsm.winsText = new PIXI.Text(str);
    pmsm.winsText.x = 0;
    pmsm.winsText.y = 400;
    pmsm.uiContainer.addChild(pmsm.winsText);
}