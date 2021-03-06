// firebase code goes here
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDh_E3yGTMDPzjT4OmorVXAsAvUsGb1edU",
    authDomain: "snake-oil-60cf3.firebaseapp.com",
    databaseURL: "https://snake-oil-60cf3.firebaseio.com",
    projectId: "snake-oil-60cf3",
    storageBucket: "snake-oil-60cf3.appspot.com",
    messagingSenderId: "138515038531",
    appId: "1:138515038531:web:e612f78796e28f8c8f6ff6"
  };
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

// reference to the game database
database = firebase.database();


// local data stuff
var val_local = {};
val_local["judges"] = [];
var personal_cookie_data = {};
var local_cookie;

database.ref("active_rounds/").on("value", function(snapshot) {
    val_local["rounds"] = Object.keys(snapshot.val());
});

// var local_cookie = "session-id=99159; game-id=-M7OnVu2ouDNtfmdwZzm; username=Ria; player-id=-M7OnWijzANH5nRu-He_"; // dummy local data
// var local_cookie = "session-id=26642; game-id=-M7NZYXi7MdoIrIafGJA; username=Deep; player-id=-M7Nb37WUBR_rnsbsCwz";

// check for cookie information when the window is loaded
window.onload = function() {

    // check for local memes
    if (this.location.href.includes("file://")) {
        if (local_cookie) {
            welcome_screen();
        } else {
            show_buttons();
        }
    } else {
        if (document.cookie) {
            if (this.getAttributeFromCookie("player-id") == "") {
                show_buttons();
            } else {
                welcome_screen();
            }
        } else {
            show_buttons();
        }
    }
}

function test() {
    database.ref('test/').on('value', function(snapshot) {
        values = Object.values(snapshot.val());
        for (el in values) {
            if (!val_local.includes(values[el])) {
                addItem(values[el]);
                val_local.push(values[el]);
            }
        }
    });    
}

function addData() {
    // get the data from the input element
    var content = document.getElementById("data_val").value;
 
    // do something with the content
    database.ref('test/').push(content);

    // clear the content
    document.getElementById("data_val").value = "";
}

function emptyList(item) {
    document.getElementById("content_list").innerHTML = '';    
}

// then the higher order front-end functions
function addItem(item) {
    var li = document.createElement("li");
    li.innerHTML = item;
    document.getElementById("content_list").append(li);
}

// overall algorithm helper functions go here

// cookie parser code
function getAttributeFromCookie(tag) {
    var cookie;

    if (location.href.includes("file://")) {
        cookie = local_cookie;
    } else {
        cookie = document.cookie;
    }

    if (cookie) {
        var target = tag + "=";
        var chunks = decodeURIComponent(cookie).split(';');
        for (var i = 0; i < chunks.length; i++) {
            var el = chunks[i];
            while (el.charAt(0) == ' ') {
                el = el.substring(1);
            }
            if (el.indexOf(target) == 0) {
                return el.substring(target.length,el.length);
            }
        }
    }

    return "";
}

function setAttributeForCookie(attr, el) {

    if (location.href.includes("file://")) {
        var new_cookie = "";
        new_cookie += "username=" + (attr == "username" ? el : getAttributeFromCookie("username")) + ";";
        new_cookie += "player-id=" + (attr == "player-id" ? el : getAttributeFromCookie("player-id")) + ";";
        new_cookie += "session-id=" + (attr == "session-id" ? el : getAttributeFromCookie("session-id")) + ";";
        new_cookie += "game-id=" + (attr == "game-id" ? el : getAttributeFromCookie("game-id")) + ";";
        new_cookie += "path=/";
        local_cookie = new_cookie;
    } else {
        document.cookie = attr + "=" + el;
    }
}

function hide_buttons() {
    document.getElementById("joiners").style.display = "none";
}

function show_buttons() {
    document.getElementById("joiners").style.display = "block";
}

function create_new() {
    hide_buttons();
    database.ref('active_rounds').once('value').then(function(snapshot) {
        var sess_id = -1;
        if (snapshot.val()) {
            sess_id = getRandomizer(1000,99999);
            var active = Object.keys(snapshot.val());
            while (active.includes(sess_id)) {
                sess_id = getRandomizer(1000,9999);
            }
        } else {
            sess_id = getRandomizer(1000,9999);
            console.log(sess_id);
        }

        
        var game_data = {
            
        };
        
        setAttributeForCookie("session-id",sess_id);

        var game_id = database.ref('games/' + sess_id + "/").push(game_data).key;

        database.ref("active_rounds/"+sess_id).set(game_id);


        setAttributeForCookie("game-id",game_id);

        database.ref('games/' + getAttributeFromCookie('game-id') + '/accepting_players').set(true);
        database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set("round_start");

        player_prompt("owner");
    });
}

function getRandomizer(bottom, top) {
    return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
}

function containsNonDigit(code) {
    for (var i = 0; i < code.length; i++) {
        if (isNaN(i - parseFloat(i))) {
            return true;
        }
    }
    return false;
}


function join() {
    hide_buttons();
    show_input("game_code","Enter Game Code");
    document.getElementById('game_code').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            var game_code = document.getElementById('game_code').value.trim();            
            if (!game_code.replace(/\s/g, '').length) {
                alert("Field cannot be empty");
            } else if (containsNonDigit(game_code)) {
                alert("Code contains non-digits");
            } else {
                var pass = false;

                if (val_local["rounds"]) {
                    pass = val_local["rounds"].indexOf(game_code) != -1;
                }

                if (pass) {
                    document.getElementById('game_code').value = "";
                    hide_input("game_code");
                    setAttributeForCookie("session-id",game_code);
                    database.ref("active_rounds/"+game_code).once("value",function(snapshot) {
                        setAttributeForCookie("game-id",snapshot.val());
                    });
    
                    player_prompt("member");
                } else {
                    alert("Invalid Game Code!");
                }
            }
        }
    });
}

function player_prompt(mode) {
    show_input("player_input","Enter Player Name");
    document.getElementById('player_input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            var player_name = document.getElementById('player_input').value;
            if (!player_name.replace(/\s/g, '').length) {
                alert("Field cannot be empty");                
            } else {
                document.getElementById('player_input').value = "";
                hide_input("player_input");
                setAttributeForCookie("username",player_name);
                player_obj = {
                    "username": player_name,
                    "score": 0,
                    "card": "",
                    "role": mode,
                    "background": generateRandomColor(),
                    "drawn": false
                }
                var player_id = database.ref("games/"+getAttributeFromCookie("game-id")).child("players/").push(player_obj).key;
                setAttributeForCookie("player-id",player_id);
                welcome_screen();
            }
        }
    });
}

function generateRandomColor() {
    var colors = ["#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#95a5a6","#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d"];
    return colors[getRandomizer(0,colors.length - 1)];    
}

function show_input(btn, msg) {
    document.getElementById(btn).placeholder = msg;
    document.getElementById(btn).style.display = "inline-block";
    document.getElementById(btn).focus();
}

function hide_input(btn) {
    document.getElementById(btn).placeholder = "";
    document.getElementById(btn).style.display = "none";
}

function welcome_screen() {
    // check for local mode for testing
    document.getElementById("welcome_screen").style.display = "block";
    document.querySelector("#welcome_screen p:nth-child(1)").innerHTML = "Session ID: " + getAttributeFromCookie("session-id") + " (share w/ friends!)";
    document.querySelector("#welcome_screen p:nth-child(2)").innerHTML = "Welcome " + getAttributeFromCookie("username") + "!";
    data = {
        username: getAttributeFromCookie("username"),
        background: "darkorange"
    }
    
    database.ref('games/' + getAttributeFromCookie("game-id") + '/players/').on("value", add_player_previews);
}

function add_player_previews(snapshot) {
    // clear players
    var p = document.getElementsByClassName('player_preview');
    while (p[0]) {
        p[0].parentNode.removeChild(p[0]);
    }

    var players = Object.keys(snapshot.val());
    for (var i = 0; i < players.length; i++) {
        var preview = document.createElement("div");
        preview.classList.add("player_preview");
        preview.innerHTML = snapshot.val()[players[i]]['username'];
        preview.style.backgroundColor = snapshot.val()[players[i]]['background'];
        document.getElementById("welcome_screen").append(preview);    
    }

    if (val_local["players"] != snapshot.val()) {
        val_local["players"] = snapshot.val();
    }

    database.ref('games/' + getAttributeFromCookie("game-id") + '/accepting_players').on("value", function(snapshot) {
        if (snapshot.val() == false) {            
            game_view();
        }
    });    

    if (snapshot.val()[getAttributeFromCookie("player-id")]["role"]=="owner") {
        var preview = document.createElement("div");
        preview.classList.add("player_preview");
        preview.innerHTML = "Begin Game!";
        preview.id = "begin";
        preview.style.backgroundColor = "none";
        preview.onclick = game_view;
        document.getElementById("welcome_screen").append(preview);
    }
}

function game_view() {
    database.ref('games/' + getAttributeFromCookie("game-id") + '/players/').off("value", add_player_previews);
    var p = document.getElementsByClassName('player_preview');
    while (p[0]) {
        p[0].parentNode.removeChild(p[0]);
    }

    document.getElementById("welcome_screen").style.display = "none";    
    document.getElementById("game_screen").style.display = "block";

    // build out players view
    var players = Object.keys(val_local["players"]);
    var owner = "";
    for (var i = 0; i < players.length; i++) {
        var p_view = document.createElement("div");
        var name = document.createElement("p");
        var ct = document.createElement("p");
        if (val_local["players"][players[i]]['role'] == "owner") {
            owner = players[i];
        }
        p_view.classList.add("player_preview");
        name.innerHTML = val_local["players"][players[i]]['username'] + "<br/>";
        p_view.append(name);
        ct.innerHTML = val_local["players"][players[i]]['score'];
        p_view.append(ct);
        p_view.classList.add("not_drawn");
        p_view.id = players[i];
        document.getElementById("game_screen").append(p_view);    
    }

    // no longer accepting players
    database.ref('games/' + getAttributeFromCookie('game-id') + '/accepting_players').set(false);

    // set the first judge to the owner
    val_local['current_judge'] = owner;
    database.ref('games/' + getAttributeFromCookie('game-id') + '/current_judge').set(owner);
    database.ref('games/' + getAttributeFromCookie('game-id') + '/current_player').set("");

    var game_stat = document.createElement('p');
    game_stat.id = 'game_status';
    game_stat.innerHTML = "Status Text"; 
    if (!document.getElementById('game_status')) {
        document.getElementById('game_screen').append(game_stat);
    }

    var draw_btn = document.createElement('button');
    draw_btn.id = 'draw_btn';
    draw_btn.innerHTML = "Draw Your Cards";
    if (!document.getElementById('draw_btn')) {
        document.getElementById('game_screen').append(draw_btn);
    }

    var card = document.createElement('div');
    card.id = 'card';
    card.style.display = "none";
    card.style.backgroundColor = val_local["players"][getAttributeFromCookie("player-id")]['background'];
    document.getElementById('game_screen').append(card);

    // drawing cards feature
    document.getElementById('draw_btn').addEventListener('click',function(e) {
        //randomize card deck shuffle
        var card_msg = "";
        if (getAttributeFromCookie('player-id') == val_local['current_judge']) {
            card_msg = randomOccupation();
        } else {
            var card_msg = randomWord() + " " + randomWord();
        }
        database.ref('games/' + getAttributeFromCookie('game-id') + '/players/' + getAttributeFromCookie('player-id') + '/drawn').set(true);
        database.ref('games/' + getAttributeFromCookie('game-id') + '/players/' + getAttributeFromCookie('player-id') + '/card').set(card_msg);
    });

    // remove/add card button based on need to draw
    database.ref('games/' + getAttributeFromCookie('game-id') + '/players/' + getAttributeFromCookie('player-id') + '/drawn').on('value', function(snapshot) {        
        document.getElementById('draw_btn').style.display = snapshot.val() ? "none": "block";
        document.getElementById('card').style.display = snapshot.val() ? "block" : "none";
    });

    // check for card values
    database.ref('games/' + getAttributeFromCookie('game-id') + '/players/' + getAttributeFromCookie('player-id') + '/card').on('value', function(snapshot) {
        split = snapshot.val().split(" ");
        document.getElementById('card').innerHTML = "";
        for (var i = 0; i < split.length; i++) {
            if (i != 0) {
                document.getElementById('card').innerHTML += '<br/>';
            }
            document.getElementById('card').innerHTML += split[i];
        }
    });

    database.ref('games/' + getAttributeFromCookie('game-id') + '/dead_line').on('value',function(snapshot) {
        if (snapshot.val() != "") {
            val_local["dead_line"] = snapshot.val();
        }
    });

    database.ref('games/' + getAttributeFromCookie('game-id') + '/current_player').on('value',function(snapshot) {
        if (snapshot.val()) {
            val_local["current_player"] = snapshot.val();
        } 
    });

    database.ref('games/' + getAttributeFromCookie('game-id') + '/round_winner').on('value',function(snapshot) {
        if (snapshot.val()) {
            val_local["round_winner"] = snapshot.val();
        } 
    });

    database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').on('value',function(snapshot) {
        var mode = snapshot.val();
        val_local["game_mode"] = mode;
        var players = Object.keys(val_local["players"]);
        console.log(val_local["game_mode"]);
        // round has started, all players invited to draw cards
        if (mode == "round_start") {
            // update status
            document.getElementById('game_status').innerHTML = "Everyone should draw...";

            // everyone must draw
            for (var i = 0; i < players.length; i++) {
                document.getElementById(players[i]).style.backgroundColor = "";
                document.getElementById(players[i]).classList.add('not_drawn');
            }


        } else if (mode == "choosing") {
            // update status
            document.getElementById('game_status').innerHTML = "Judge is choosing the next player";

            // everyone has drawn
            for (var i = 0; i < players.length; i++) {
                if (players[i] != val_local["current_judge"]) {
                    if (!document.getElementById(players[i]).classList.contains('went')) {
                        document.getElementById(players[i]).classList.add('unselected');
                    }
                }
                document.getElementById(players[i]).classList.add('player_preview');
                document.getElementById(players[i]).style.backgroundColor = val_local["players"][players[i]]['background'];
                document.getElementById(players[i]).classList.remove('not_drawn');    
            }


            // if user is the judge
            if (val_local["current_judge"] == getAttributeFromCookie("player-id")) {
                var unselected = document.getElementsByClassName('unselected');
                for (var i = 0; i < unselected.length; i++) {
                    if (val_local["game_mode"] == "choosing") {
                        unselected[i].addEventListener('click', visualTurnShift);
                    } else if(val_local["game_mode"] == "decision") {
                        unselected[i].addEventListener('click', visualTurnShift);
                    }
                }
            }
        } else if (mode == "turn") {
            // everyone has drawn
            for (var i = 0; i < players.length; i++) {
                if (players[i] != val_local["current_judge"]) {
                    if (!document.getElementById(players[i]).classList.contains('went')) {
                        document.getElementById(players[i]).classList.add('unselected');
                    }
                }
                document.getElementById(players[i]).classList.add('player_preview');
                document.getElementById(players[i]).style.backgroundColor = val_local["players"][players[i]]['background'];
                document.getElementById(players[i]).classList.remove('not_drawn');
            }
        } else if (mode == "decision") {
            document.getElementById("game_status").innerHTML = "Now, Judge " + val_local["players"][val_local["current_judge"]]["username"] + " is making a decision.";
            database.ref('games/' + getAttributeFromCookie('game-id') + '/players/' + getAttributeFromCookie("player-id") + "/went").set(false);

            // everyone has drawn
            for (var i = 0; i < players.length; i++) {
                document.getElementById(players[i]).classList.add('player_preview');
                document.getElementById(players[i]).style.backgroundColor = val_local["players"][players[i]]['background'];
                document.getElementById(players[i]).classList.remove('not_drawn');
            }
        } else if (mode == "verdict") {       
            if (val_local["current_judge"] && val_local["round_winner"] && val_local["current_judge"] != "") {
                alert("Judge " + val_local["players"][val_local["current_judge"]]["username"] + " has picked " + val_local["players"][val_local["round_winner"]]["username"] + "!");
                if (val_local["current_judge"] == getAttributeFromCookie("player-id")) {
                    database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + val_local["round_winner"] + "/score").once("value", function(snapshot) {
                        database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + val_local["round_winner"] + "/score").set(snapshot.val() + 1);
                    });
                    var judge = val_local["current_judge"];
                    while(judge == val_local["current_judge"] && val_local["judges"].indexOf(judge) != -1) {
                        judge = players[getRandomizer(0,players.length - 1)];
                    }
                    database.ref("games/" + getAttributeFromCookie("game-id") + "/current_judge").set(judge);

                    val_local["round_winner"] = "";
                    val_local["players"][getAttributeFromCookie("player-id")]["drawn"] = false;
                    val_local["players"][getAttributeFromCookie("player-id")]["card"] = "";
                    for (var i = 0; i < players.length; i++) {
                        database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + players[i] + "/drawn").set(false);
                    }
                    database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + getAttributeFromCookie("player-id") + "/card").set("");
    
                    database.ref("games/" + getAttributeFromCookie("game-id") + "/game_mode").set("round_start");
                    database.ref("games/" + getAttributeFromCookie("game-id") + "/round_winner").set("");
                } else {
                    val_local["round_winner"] = "";
                    val_local["players"][getAttributeFromCookie("player-id")]["drawn"] = false;
                    val_local["players"][getAttributeFromCookie("player-id")]["card"] = "";
                    database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + getAttributeFromCookie("player-id") + "/drawn").set(false);
                    database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + getAttributeFromCookie("player-id") + "/card").set("");    
                }    
            }
        } else if (mode == "finished") {
            // calculate the winner
            max_id = "";
            max = 0;
            max_occurrences = 0;

            for (var i = 0; i < players.length; i++) {
                if (val_local["players"][players[i]]["score"] >= max) {
                    if (val_local["players"][players[i]]["score"] != max) {
                        max_occurrences = 0;
                    }
                    max_id = players[i];
                    max = val_local["players"][players[i]]["score"];
                    max_occurrences++;
                }
            }

            // announce the winner
            if (max_occurrences == 1) {
                alert(val_local["players"][max_id]["username"] + " wins!");
            } else {
                alert("There's a tie!");
            }

            // clear cookie data
            if (location.href.includes("file://")) {
                local_cookie = undefined;
            } else {
                setAttributeForCookie("username","");
                setAttributeForCookie("player-id","");
                setAttributeForCookie("session-id","");
                setAttributeForCookie("game-id","");
                console.log(document.cookie);
            }
        
            // refresh the page
            window.location.reload(false);                
        }
    });

    database.ref('games/' + getAttributeFromCookie('game-id') + '/current_judge').on('value',function(snapshot) {
        if (snapshot.val()) {
            document.querySelector("#" + val_local["current_judge"] + " p:nth-child(2)").innerHTML = val_local["players"][val_local["current_judge"]]["score"];
            document.getElementById(snapshot.val()).classList.remove("unselected");
            document.getElementById(snapshot.val()).classList.remove("went");
            val_local["current_judge"] = snapshot.val();
            if (val_local["judges"].indexOf(snapshot.val()) == -1) {
                val_local["judges"].push(snapshot.val());
            }
            val_local["judges"].push(snapshot.val());
            if (val_local["judges"].length == Object.keys(val_local["players"]).length) {
                val_local["judges"] = [];
                val_local["judges"].push(snapshot.val());
            }
            document.querySelector("#" + snapshot.val() + " p:nth-child(2)").innerHTML = "(Judge)";            
        }
    });

    database.ref('games/' + getAttributeFromCookie('game-id') + '/current_player').on('value',function(snapshot) {
        val_local["current_player"] = snapshot.val();

        if (val_local["current_player"] != "") {
            document.getElementById('game_status').innerHTML = val_local["players"][val_local["current_player"]]["username"] + "'s Turn";

            counter = 45;
            var x = setInterval(function() {
                var now = new Date().getTime();
    
                var distance = val_local["dead_line"] - now;
    
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
                if (val_local["current_player"] != "") {
                    document.querySelector("#" + val_local["current_player"] + " p:nth-child(2)").innerHTML = seconds;
                }
    
                if (distance < 0 && val_local["current_player"] != "") {
                    clearInterval(x);
                    document.querySelector("#" + val_local["current_player"] + " p:nth-child(2)").innerHTML = val_local["players"][val_local["current_player"]]["score"];
                    database.ref('games/' + getAttributeFromCookie('game-id') + '/players/' + val_local["current_player"] + "/went").set(true);
                    val_local["current_player"] = "";
                    database.ref('games/' + getAttributeFromCookie('game-id') + "/current_player").set("");
                    if (document.getElementsByClassName('unselected').length > 0 && val_local["game_mode"] != "decision") {
                        database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set('choosing');
                    } else {
                        if (val_local["game_mode"] == "choosing") {
                            database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set('decision');
                        }
                    }
                }
                
            }, 1000);    
        }
    });


    document.getElementById('game_header').addEventListener('click', function(e) {
        if (getAttributeFromCookie("player-id") == val_local["current_judge"]) {
            database.ref("games/" + getAttributeFromCookie("game-id") + "/game_mode").set("finished");
        }
    });

    document.getElementById('game_header').addEventListener('mouseenter', function(e) {
        if (getAttributeFromCookie("player-id") == val_local["current_judge"]) {
            document.getElementById(e.target.id).innerHTML = "End Game";        
        }
    });

    document.getElementById('game_header').addEventListener('mouseleave', function(e) {
        if (getAttributeFromCookie("player-id") == val_local["current_judge"]) {
            document.getElementById(e.target.id).innerHTML = "DCF Plays Snake Oil!";
        }
    });

    // gauge overall status of drawing
    database.ref('games/' + getAttributeFromCookie('game-id') + '/players/').on('value',function(snapshot) {
        var players = Object.keys(snapshot.val());
        for (var i = 0; i < players.length; i++) {
            if (val_local['game_mode'] == 'round_start') {
                if (snapshot.val()[players[i]]['drawn']) {
                    document.getElementById(players[i]).classList.remove('not_drawn');
                    document.getElementById(players[i]).classList.add('player_preview');
                    document.getElementById(players[i]).style.backgroundColor = snapshot.val()[players[i]]['background'];
                } else {
                    document.getElementById(players[i]).classList.add('not_drawn');
                    document.getElementById(players[i]).style.backgroundColor = "none";    
                }
            }

            // if (val_local['game_mode'] != 'round_start') {
                if (snapshot.val()[players[i]]['went']) {
                    document.getElementById(players[i]).classList.remove("unselected");
                    document.getElementById(players[i]).classList.add("went");
                } else {
                    if (players[i] != val_local["current_judge"]) {
                        document.getElementById(players[i]).classList.add("unselected");
                        document.getElementById(players[i]).classList.remove("went");    
                    }
                }    
            // } 

            if (document.getElementsByClassName('went').length == players.length - 1 && val_local['game_mode'] == 'turn') {
                database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set('decision');
            }

            val_local["players"][players[i]]["score"] = snapshot.val()[players[i]]["score"];
            if (players[i] != val_local["current_judge"]) {
                document.querySelector("#" + players[i] + " p:nth-child(2)").innerHTML = val_local["players"][players[i]]["score"];
            }


        }

        if (document.getElementsByClassName('not_drawn').length == 0 && val_local['game_mode'] == 'round_start') {
            database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set('choosing');
        }
        
    });
}

function visualTurnShift(e) {    
    if (val_local["game_mode"] == "choosing" && val_local["current_judge"] == getAttributeFromCookie("player-id")) {
        var el = e.target;
        while (el.id == "") {
            e = e.parentNode;
        }
        database.ref('games/' + getAttributeFromCookie("game-id") + "/current_player").set(el.id);
        database.ref('games/' + getAttributeFromCookie("game-id") + "/game_mode").set("turn");
        var now = Date.now();
        database.ref('games/' + getAttributeFromCookie("game-id") + "/dead_line").set(now + 45000);    
    } else if (val_local["game_mode"] == "decision" && val_local["current_judge"] == getAttributeFromCookie("player-id")) {
        var el = e.target;
        while (el.id == "") {
            e = e.parentNode;
        }
        database.ref('games/' + getAttributeFromCookie("game-id") + "/round_winner").set(el.id);
        database.ref('games/' + getAttributeFromCookie("game-id") + "/game_mode").set("verdict");
    }
}

function randomOccupation() {
    arr = ["doctor", "chem-e", "engineer", "movie-star", "hitchhiker","couch potato","newlywed","rapper","hostage","sports mascot","caveman","secret admirer","fashion model","teacher","spy","politician","hunter","pirate","cowboy","nurse","diva","dumpster diver","kindergartner","billionare","sports fan","pro wrestler","senior citizen","geek","ninja","prom date","soldier","party host","super hero","youtuber","UniTrans driver","zombie","cheerleader","babysitter","Paparazzi"]
    return arr[getRandomizer(0,arr.length - 1)];
}

function randomWord() {
    arr = ["jalapeno","allergy","enemy","ornament","plasma","propaganda","invisibility","career","megaphone","termite","internship","evidence","oasis","tournament","latte","apocalypse","barbeque","knife","broom","rain","rainbow","river","pony","friend","patch","stool","oil","fluid","game","tongue","yawn","insect","scarf","lava","kite","tooth","star","photo","mountain","button","window","vacuum","night","muscle","key","tent","mistake","paint","robot","shower","mouth","flower","noise","paper","slide","shell","net","hat","desk","fish","cloud","diaper","worm","crowd","horn","crown","pool","cage","jacket","rocket","rake","life","sky","hook","toe","eraser","anger","story","shovel","parade","flag","joke","bowl","soap","bed","dance","pillow","family","doll","laser","fire","dream","art","vest","bacteria","computer","cave","hug","college","pen","boots","powder","hand","wheel","man","school","cape","oven","shirt","head","software","meditation","diet","blog","costume","nose","rumor","wind","bike","beach","wax","razor","helmet","kit","debt","news","fountain","baby","nest","lip","towel","death","sand","raft","work","book","heart","exercise","slime","giggle","odor","moon","spear","virus","fashion","corpse","urge","moisture","urge","corpse","fashion","virus","spear","moon","magnet","glitter","war","movie","TV","shield","candy","grenade","food","island","club","lock","toy","party","armor","sticker","coffin","body","remote","garden","rope","scream","burp","pajamas","belly","mask","music","socks","toilet","shampoo","hood","blood","banana","crocs","spit","bottle","ice","energy","carpet","box","tax","clock","wall"]
    return arr[getRandomizer(0,arr.length - 1)];
}
