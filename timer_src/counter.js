var canvas;
var MAX_PLAYERS = 5;
var no_players = 3;
var timer_box = null;

var clicks = [];
var start=false;
var pause = false;

var colors = ["#444444","#B90E0A","#11AA11","#3344AA","#CCCC11"];
var text_color = "#000"
var button_color = "#DDD"
var passed_color = "#999";

var max_time = 5;
var gen_first = 0;
var generation = 1;
var active_player = 0;

var timers = [];
var players = null;


function parseTime(time){
    var negative = false;

    if (time < 0){
        time = -time;
        negative = true;
    }

    var hours = Math.floor(time/3600000)
    var minutes = Math.floor(time%3600000/60000)
    var seconds = Math.floor(time%60000/1000)

    return `${negative ? "-":""}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startSequence(){
    // Set start flag to true
    start = true;

    var unitWidth = 0.8*windowWidth;
    var unitHeight = (windowHeight - (10*no_players) - 2 * 30 - 15) / (no_players + 3);
    
    // Create players
    players = new Array(no_players).fill().map(Object);
    players.forEach(function(elem){
        elem.time = max_time * 60 * 1000;
        elem.big_pass = false;
        elem.timer_start = Date.now();
    });

    function nextPlayer(){
        players[active_player].time -= Date.now() - players[active_player].timer_start;
        
        do {
            active_player = (active_player + 1) % no_players;
        } while(players[active_player].big_pass);

        players[active_player].timer_start = Date.now();
    }

    function nextGen(){
        timers[gen_first].strokeWeight = 
        active_player = gen_first = (gen_first + 1) % no_players;
        players.forEach(player=>player.big_pass = false);
        timers.forEach(timer => timer.color = button_color);
        timer_box.stroke = colors[active_player];
        generation += 1;
    }

    // Create a timer box for every player
    for(var i = 0; i < no_players; ++i){
        var timer = new Clickable();
        timer.locate(0.1 * windowWidth, 10 + (unitHeight + 10) * i);
        timer.resize(unitWidth, unitHeight);
        timer.color = button_color;
        timer.textColor = text_color;
        timer.strokeWeight = 10;
        timer.stroke = colors[i];
        timer.id = i;
        timer.textSize = 20;
        timer.textFont = prototype;
        timer.onPress = function(){
            // If paused, the player cannot pass
            if(pause) return;
            // If big pass, able to unpass
            if(players[this.id].big_pass){
                players[this.id].big_pass = false;
                this.color = button_color;
                return;
            }
            // Player can only pass when he is active
            if(active_player == this.id){
                // Update player to big pass
                players[this.id].big_pass = true;
                this.color = passed_color;
                // Check if the generation is finished
                var finished = players.reduce((acc, elem)=> acc && elem.big_pass, true);
                if (finished){
                    // Go to next generation and pause
                    nextGen();
                    enterPause();
                }
                else{
                    // Go to next player
                    nextPlayer();
                }
            }
        }
        timer.updateText = function () {
            var time_delta = 0;
            if ((this.id == active_player)&&!pause){
                time_delta = Date.now() - players[this.id].timer_start;
            }
            var time = parseTime(players[this.id].time - time_delta);
            this.text = this.id == gen_first ? `[${time}]` : time;
            return this;
        }

        timers.push(timer);
    }

    // Create the main timer box
    timer_box = new Clickable();
    timer_box.locate(0.1 * windowWidth, 40 + (unitHeight + 10) * no_players);
    timer_box.resize(unitWidth, unitHeight * 2);
    timer_box.textColor = text_color;
    timer_box.color = button_color;
    timer_box.textSize = 40;
    timer_box.textFont = prototype;
    // Update text to the current player time
    timer_box.updateText = function(){
        var time_delta = !pause ? Date.now() - players[active_player].timer_start : 0;
        this.text = `${parseTime(players[active_player].time - time_delta)}\nGen: ${generation}`;
        return this;
    };
    // On press change player
    timer_box.onPress = nextPlayer;

    // Create button for pause
    clickPause = new Clickable();
    clickPause.locate(0.1 * windowWidth, 70 + (unitHeight + 10) * no_players + 2*unitHeight);
    clickPause.resize(unitWidth, unitHeight);
    clickPause.textColor = text_color;
    clickPause.color = button_color;
    clickPause.text = 'Pause';
    clickPause.onPress = enterPause;
    clickPause.textSize = 40;
    clickPause.textFont = prototype;

    function enterPause(){
        // Ako se ulazi u pauzu
        if(!pause){
            players[active_player].time -= Date.now() - players[active_player].timer_start;
        }
        else{
            players[active_player].timer_start = Date.now();
        }
        pause = !pause;
        clickPause.text = pause ? "Unpause" : "Pause";
    }

}

function colorRotate (index){
    var tmp = colors[MAX_PLAYERS-1];

    for(var i = MAX_PLAYERS-1; i >= index; --i){
        colors[i]=colors[i-1];        
    }

    colors[index]=tmp;

    for(var i = 0; i < MAX_PLAYERS; ++i){
        clicks[i].color = colors[i];        
    }
}

function setup() {
    // Set graphics globals
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    prototype = loadFont('../resources/fonts/Prototype.ttf');

    var unitHeight = (windowHeight - 8 * 15) / 7;

    //Create player counter
    clickNoPlayers = new Clickable();
    clickNoPlayers.locate(0.1*windowWidth, 15);
    clickNoPlayers.resize(0.35*windowWidth, unitHeight);
    clickNoPlayers.color = button_color;
    clickNoPlayers.text = no_players;
    clickNoPlayers.textFont = prototype;
    clickNoPlayers.textSize = 40;
    clickNoPlayers.onPress = function () {
        no_players += 1;
        if (no_players > 5) 
            no_players = 1;
        this.text = no_players;
    };

    // Create time counter
    clickTime = new Clickable();
    clickTime.locate(0.55*windowWidth, 15);
    clickTime.resize(0.35*windowWidth, unitHeight);
    clickTime.color = button_color;
    clickTime.text = max_time;
    clickTime.textFont = prototype;
    clickTime.textSize = 40;
    clickTime.onPress = function () {
        max_time = max_time + 5;
        if(max_time > 120){
            max_time = 5;
        }
        this.text = max_time;
    }

    clickStart = new Clickable();
    clickStart.locate(0.1*windowWidth, unitHeight + 30);
    clickStart.resize(0.8*windowWidth, unitHeight);
    clickStart.updatePosition = function(){
        this.locate(0.1*windowWidth, 15 + (unitHeight + 15) * (no_players + 1));
        return this;
    }

    clickStart.color = button_color;
    clickStart.textScaled = true;
    clickStart.text = "Start";
    clickStart.textFont = prototype;
    clickStart.textSize = 40;
    clickStart.onPress = startSequence;
  
    for(var i = 0; i < MAX_PLAYERS; ++i){
        var click = new Clickable();
        click.id = i;
        click.locate(0.1*windowWidth, 15 + (unitHeight + 15) * (i+1));
        click.resize(0.8*windowWidth, unitHeight);
        click.text = "";
        click.color = colors[i];
        click.onPress = function () {
            colorRotate(this.id);
        }
        clicks.push(click);
    }
}

function draw() {
    if (!start){
        background(32, 32, 32);
        clickNoPlayers.draw();
        clickStart.updatePosition().draw();
        clickTime.draw();

        for(var i = 0; i < no_players; ++i){
            clicks[i].draw();
        }
    }
    else{
        background(colors[active_player]);
        timer_box.updateText().draw();
        clickPause.draw();
        timers.forEach(timer => timer.updateText().draw());
    }
}
