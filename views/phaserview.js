
////////////////////
//NETHACK ROOM VIEW

// map dimensions
var ROWS = 50; var COLS = 50; var FONT = 36;
// the structure of the map
var randommap; var asciidisplay;
// a list of all actors, 0 is the player
var player; var actorList; var livingEnemies;
// points to each actor in its position, for quick searching
var actorMap; var ACTORS = 11; // number of actors per level, including player
function openGameView() {

    function create() {
        // init keyboard commands
        game.input.keyboard.addCallbacks(null, null, onKeyUp);
        // initialize map
        initMap();
        // initialize ascii display
        asciidisplay = [];
        for (var y = 0; y < ROWS; y++) {
            var newRow = [];
            asciidisplay.push(newRow);
            for (var x = 0; x < COLS; x++)
                newRow.push(initCell('', x, y));
        }
        // initialize actors
        initActors();
        // draw level
        drawMap();
        drawActors();
    }

    function initCell(chr, x, y) {
        // add a single cell in a given position to the ascii display
        var style = {
            font: FONT + "px monospace",
            fill: "#fff"
        };
        return game.add.text(FONT * 0.6 * x, FONT * y, chr, style);
    }

    function initMap() {
        console.log(postsOnThisPage);
        var contentBucket = '';
        var titleBucket = '';
        var postcount = 10;
        randommap = [];
        for (var i = 0; i < postcount; i++) {
            contentBucket.concat(String(postsOnThisPage[i]['content']));
        }
        for (var i = 0; i < postcount; i++) {
            titleBucket.concat(String(postsOnThisPage[i]['title']));
        }
        console.log("CONTENTBUCKET");
        console.log(titleBucket);
        // create a new random map

        for (var y = 0; y < ROWS; y++) {
            var newRow = [];
            for (var x = 0; x < COLS; x++) {
                if (Math.random() > 0.75) {
                    newRow.push('#');
                } else {
                    newRow.push('.');
                }
            }
            randommap.push(newRow);
        }
    }

    function drawMap() {
        for (var y = 0; y < ROWS; y++)
            for (var x = 0; x < COLS; x++)
                asciidisplay[y][x].content = randommap[y][x];
    }
    function drawActors() {
        for (var a in actorList) {
            if (actorList[a] != null && actorList[a].hp > 0)
                asciidisplay[actorList[a].y][actorList[a].x].content = a == 0 ? '' + player.hp : 'e';
        }
    }
    function canGo(actor, dir) {
        return actor.x + dir.x >= 0 &&
            actor.x + dir.x <= COLS - 1 &&
            actor.y + dir.y >= 0 &&
            actor.y + dir.y <= ROWS - 1 &&
            randommap[actor.y + dir.y][actor.x + dir.x] == '.';
    }
    function moveTo(actor, dir) {
        // check if actor can move in the given direction
        if (!canGo(actor, dir))
            return false;

        // moves actor to the new location
        var newKey = (actor.y + dir.y) + '_' + (actor.x + dir.x);
        // if the destination tile has an actor in it 
        if (actorMap[newKey] != null) {
            //decrement hitpoints of the actor at the destination tile
            var victim = actorMap[newKey];
            victim.hp--;

            // if it's dead remove its reference 
            if (victim.hp == 0) {
                actorMap[newKey] = null;
                actorList[actorList.indexOf(victim)] = null;
                if (victim != player) {
                    livingEnemies--;
                    if (livingEnemies == 0) {
                        // victory message
                        var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill: '#2e2', align: "center" });
                        victory.anchor.setTo(0.5, 0.5);
                    }
                }
            }
        } else {
            // remove reference to the actor's old position
            actorMap[actor.y + '_' + actor.x] = null;

            // update position
            actor.y += dir.y;
            actor.x += dir.x;

            // add reference to the actor's new position
            actorMap[actor.y + '_' + actor.x] = actor;
        }
        return true;
    }

    function onKeyUp(event) {
        // draw map to overwrite previous actors positions
        drawMap();

        // act on player input
        var acted = false;
        switch (event.keyCode) {
            case Phaser.Keyboard.LEFT:
                acted = moveTo(player, { x: -1, y: 0 });
                break;

            case Phaser.Keyboard.RIGHT:
                acted = moveTo(player, { x: 1, y: 0 });
                break;

            case Phaser.Keyboard.UP:
                acted = moveTo(player, { x: 0, y: -1 });
                break;

            case Phaser.Keyboard.DOWN:
                acted = moveTo(player, { x: 0, y: 1 });
                break;
        }

        // enemies act every time the player does
        if (acted) {
            for (var enemy in actorList) {
                // skip the player
                if (enemy == 0)
                    continue;

                var e = actorList[enemy];
                if (e != null)
                    aiAct(e);
            }
        }
        // draw actors in new positions
        drawActors();
    }
    function aiAct(actor) {
        var directions = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
        var dx = player.x - actor.x;
        var dy = player.y - actor.y;

        // if player is far away, walk randomly
        if (Math.abs(dx) + Math.abs(dy) > 6)
            // try to walk in random directions until you succeed once
            while (!moveTo(actor, directions[randomInt(directions.length)])) { };

        // otherwise walk towards player
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                // left
                moveTo(actor, directions[0]);
            } else {
                // right
                moveTo(actor, directions[1]);
            }
        } else {
            if (dy < 0) {
                // up
                moveTo(actor, directions[2]);
            } else {
                // down
                moveTo(actor, directions[3]);
            }
        }
        if (player.hp < 1) {
            // game over message
            var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over\nCtrl+r to restart', { fill: '#e22', align: "center" });
            gameOver.anchor.setTo(0.5, 0.5);
        }
    }

    function initActors() {
        console.log(postsOnThisPage);
        // create actors at random locations
        actorList = [];
        actorMap = {};
        for (var e = 0; e < ACTORS; e++) {
            // create new actor
            var actor = {
                x: 0,
                y: 0,
                hp: e == 0 ? 3 : 1,
                link: postsOnThisPage[randomInt(10)]['content']
            };
            do {
                // pick a random position that is both a floor and not occupied
                actor.y = randomInt(ROWS);
                actor.x = randomInt(COLS);
            } while (randommap[actor.y][actor.x] == '#' || actorMap[actor.y + "_" + actor.x] != null);

            // add references to the actor to the actors list & map
            actorMap[actor.y + "_" + actor.x] = actor;
            actorList.push(actor);
        }

        // the player is the first actor in the list
        player = actorList[0];
        livingEnemies = ACTORS - 1;
    }
    $("#big-container").hide();
    $("#gameview").css('display', 'block');

    var game = new Phaser.Game(COLS * FONT * 0.6, ROWS * FONT, Phaser.AUTO, null, { create: create });
    //window.location.href = "game.html";
}