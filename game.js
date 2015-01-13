var game = new Phaser.Game(800,600,Phaser.AUTO,'game');
var Game = {};

Game.game = function(){  };
Game.mainmenu = function() {  };
Game.boot = function(){  };
Game.gameover = function() {  };

Game.game.prototype = {

    create: function()
    {
        score = 0;
        pointer = game.add.sprite(game.input.activePointer.position.x,game.input.activePointer.position.y,'aim');
        pointer.anchor.setTo(0.5,0.5);
        pointer.strength = 1;
        pointer.health = 3;
        game.add.sprite(0,0,'sky');
        cans = game.add.group();
        cans.enableBody = true;
        ducks = game.add.group();
        ducks.enableBody = true;
        hearts = game.add.group();
        for(var i = 0; i < pointer.health; i++)
        {
            hearts.create(20 + i * 50,50,'heart');    
        }
        game.physics.arcade.enable(pointer);
        game.input.onDown.add(function(){
            game.physics.arcade.overlap(pointer,cans,Game.game.prototype.hitCan);
            game.physics.arcade.overlap(pointer,ducks,Game.game.prototype.hitDuck);
        });
        game.time.events.loop(3000,this.addCan);
        game.time.events.loop(7000,this.addDuck);
        // emitter.gravity = 200;
        scoreText = game.add.text(20,20,'Score: ' + score,{'fill': 'black','font': ' 20pt UglyFont'});
        scoreText.score = score;
        this.addCan();
    },

    update: function()
    {
        game.physics.arcade.collide(cans);
        pointer.position.setTo(game.input.activePointer.x,game.input.activePointer.y);
        pointer.bringToTop();
        cans.forEachAlive(function(can){
            if(can.position.y >= game.height - can.height / 2) // If the bottom of the can is on the ground
            {
                can.kill();
                pointer.damage(1);
                hearts.getAt(hearts.total -1).destroy();
            }
        });
        if(pointer.exists === false) game.state.start('gameover');
        if(scoreText.score != score) this.updateText();
    },

    render: function()
    {
    },

    addCan: function()
    {
        var can = cans.create(Math.random() * game.width,0,'can');
        can.anchor.setTo(0.5,0.5);
        can.scale.setTo(0.3,0.3);
        can.body.collideWorldBounds = true;
        can.body.gravity.y = 300;
        can.health = 4;
        can.score = 1;
    },

    addDuck: function()
    {
        var duck = ducks.create(0,Math.random() * game.height,'duck');
        duck.anchor.setTo(0.5,0.5);
        duck.scale.setTo(0.3,0.3);
        duck.body.collideWorldBounds = false;
        duck.body.velocity.x = 500;
        duck.score = 10;
    },

    hitCan: function(pointer,can)
    {
        if(!can.invincible)
        {
            can.body.velocity.y = -400;
            can.body.velocity.x = Math.random() * 400 - 200; // From -200 to 200
            can.body.angularVelocity = Math.random() * 400 - 200;
            can.damage(pointer.strength);
            score += can.score;
            can.invincible = true;
            can.alpha = 0.5;
            game.time.events.add(1000,function(){
                can.invincible = false;
                can.alpha = 1;
            });
            var emitter = game.add.emitter(pointer.position.x,pointer.position.y,10);
            emitter.makeParticles('particle');
            emitter.start(true,500,null,10);

        }
    },

    hitDuck: function(pointer,duck)
    {
        score += duck.score;
        duck.kill();
        var emitter = game.add.emitter(pointer.position.x,pointer.position.y,10);
        emitter.makeParticles('particle');
        emitter.start(true,500,null,10);
    },

    updateText: function()
    {
        scoreText.score = score;
        scoreText.text = 'Score: ' + scoreText.score;
    }
};

Game.mainmenu.prototype = {
    create: function()
    {
        game.add.sprite(0,0,'sky');
        var play = game.add.text(game.width/2,game.height/2,"Play",{'align': 'center','font': '50pt UglyFont','fill': 'black'});
        play.anchor.setTo(0.5,0.5);
        play.inputEnabled = true;
        pointer = game.add.sprite(game.input.activePointer.position.x,game.input.activePointer.position.y,'aim');
        pointer.anchor.setTo(0.5,0.5);
        play.events.onInputOver.add(this.focusText,this);
        play.events.onInputOut.add(this.defocusText,this);
        play.events.onInputDown.add(function() {
            game.state.start('game');
        },this);
    },

    update: function()
    {
        pointer.position.setTo(game.input.activePointer.x,game.input.activePointer.y);
        pointer.bringToTop();
    },

    focusText: function(item)
    {
        item.fill = 'red';
    },

    defocusText: function(item)
    {
        item.fill = 'black';
    }
};

Game.boot.prototype = {

    preload: function()
    {
        game.load.image('can','assets/can.png');
        game.load.image('sky','assets/sky.png');
        game.load.image('aim','assets/aim.png');
        game.load.image('particle','assets/particle.png');
        game.load.image('heart','assets/heart.png');
        game.load.image('duck','assets/duck.png');
    },

    create: function()
    {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        // game.state.start('game');
        game.state.start('mainmenu');
    }

};

Game.gameover.prototype = {

    create: function()
    {
        game.add.sprite(0,0,'sky');
        var game_over = game.add.text(game.width/2,game.height/2, "GAME OVER\nScore: " + score + "\nClick to restart...",{'align': 'center','font': '40pt UglyFont','fill':'red'});
        game_over.anchor.setTo(0.5,0.5);
    },

    update: function()
    {
        if(game.input.activePointer.isDown)
        {
            game.state.start('game');
        }
    }
};

game.state.add('boot',Game.boot);
game.state.add('game',Game.game);
game.state.add('gameover',Game.gameover);
game.state.add('mainmenu',Game.mainmenu);
game.state.start('boot');
