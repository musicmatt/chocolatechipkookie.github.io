var canvas;
var MAX_PLAYERS = 5;
var no_players = 2;
var timer_box = null;

var clicks = [];
var start=false;
var pause = false;

var colors = ["#000000","#FF0000","#00FF00","#0000FF","#FFFF00"];

var max_time = 5;
var gen_first = 0;
var active_player = 0;

var timers = [];
var players = null;

var unitWidth = 0;
var unitHeight = 0;


function parseTime(time){
    var hours = Math.floor(time/3600000)
    var minutes = Math.floor(time%3600000/60000)
    var seconds = Math.floor(time%60000/1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startSequence(){
    // Set start flag to true
    start = true;

    unitWidth = 0.8*windowWidth;

    unitHeight = (windowHeight - (10*no_players) - 2 * 30 - 20) / (no_players + 3);
    
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

        timer_box.stroke = colors[active_player];
        players[active_player].timer_start = Date.now();
    }

    // Create a timer box for every player
    for(var i = 0; i < no_players; ++i){
        var timer = new Clickable();
        timer.locate(0.1 * windowWidth, 10 + (unitHeight + 10) * i);
        timer.resize(unitWidth, unitHeight);
        timer.strokeWeight = 10;
        timer.stroke = colors[i];
        timer.id = i;
        timer.textSize = 20;
        timer.textFont = 'Courier New';
        timer.onPress = function(){
            if(active_player == this.id){
                players[this.id].big_pass = true;
                var finished = players.reduce((acc, elem)=> acc && elem.big_pass, true);
                if (finished){
                    // Next gen
                    active_player = gen_first = (gen_first + 1) % no_players;
                    players.forEach(player=>player.big_pass = false);
                    timer_box.stroke = colors[active_player];
                    // Enter pause
                    enterPause();
                }
                else{
                    nextPlayer();
                }
            }
        }

        timer.updateText = function () {
            var time_delta = 0;
            if ((this.id == active_player)&&!pause){
                time_delta = Date.now() - players[this.id].timer_start;
            }
            this.text = parseTime(players[this.id].time - time_delta);
            return this;
        }

        timers.push(timer);
    }

    // Create the main timer box
    timer_box = new Clickable();
    timer_box.locate(0.1 * windowWidth, 40 + (unitHeight + 10) * no_players);
    timer_box.resize(unitWidth, unitHeight * 2);
    timer_box.textSize = 40;
    timer_box.textFont = 'Courier New';
    timer_box.strokeWeight = 30;
    // Update text to the current player time
    timer_box.updateText = function(){
        var time_delta = !pause ? Date.now() - players[active_player].timer_start : 0;
        this.text = parseTime(players[active_player].time - time_delta);
        return this;
    };
    // On press change player
    timer_box.onPress = nextPlayer;

    // Create button for pause
    clickPause = new Clickable();
    clickPause.locate(0.1 * windowWidth, 70 + (unitHeight + 10) * no_players + 2*unitHeight);
    clickPause.resize(unitWidth, unitHeight);
    clickPause.text = 'Pause';
    clickPause.onPress = enterPause;
    clickPause.textSize = 40;
    clickPause.textFont = 'Courier New';

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
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    count=0;

    clickNoPlayers = new Clickable();
    clickNoPlayers.locate(20, 20);
    clickNoPlayers.onOutside = function () {
        this.color = "#EEEEEE";
        this.text = no_players;
        this.textColor = "#000000";
    };

    clickNoPlayers.onPress = function () {
        no_players += 1;

        if (no_players > 5) 
            no_players = 2;

        this.text = no_players;
    };

    clickTime = new Clickable();
    clickTime.locate(170, 20);
    clickTime.onOutside = function () {
        this.color = "#EEEEEE";
        this.text = max_time;
        this.textColor = "#000000";
    }
    clickTime.onPress = function () {
        max_time = (max_time + 5) % 120;
        this.text = max_time;
    }

    clickStart = new Clickable();
    clickStart.locate(10, 200);
    clickStart.textScaled = true;
    clickStart.text = "Start";
    clickStart.resize(250, 100);
    clickStart.onPress = startSequence;
  
    for(var i = 0; i < MAX_PLAYERS; ++i){
        var click = new Clickable();
        click.id = i;
        click.locate(20 + 100 * i, 100);
        click.text = "";
        click.color = colors[i];
        click.onPress = function () {
            colorRotate(this.id);
        }
        clicks.push(click);
    }
}


function draw() {
    background(192,192,192);
    if (!start){
        clickNoPlayers.draw();
        clickStart.draw();
        clickTime.draw();

        for(var i = 0; i < no_players; ++i){
            clicks[i].draw();
        }
    }
    else{
        timer_box.updateText().draw();
        clickPause.draw();
        timers.forEach(timer => timer.updateText().draw());
    }
}
