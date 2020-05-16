// firebase code goes here
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBQkztAPMrfs1NHJpD0kco1CmEO5AZbYNA",
    authDomain: "example-project-580d5.firebaseapp.com",
    databaseURL: "https://example-project-580d5.firebaseio.com",
    projectId: "example-project-580d5",
    storageBucket: "example-project-580d5.appspot.com",
    messagingSenderId: "390342480610",
    appId: "1:390342480610:web:67ccbd8a2259c443bf44bb",
    measurementId: "G-E8ZVB82C99"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// reference to the game database
database = firebase.database();


// local data stuff
var val_local = {};
var personal_cookie_data = {};
// var local_cookie;
var local_cookie = "session-id=99159; game-id=-M7OnVu2ouDNtfmdwZzm; username=Ria; player-id=-M7OnWijzANH5nRu-He_"; // dummy local data
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
            welcome_screen();

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

function join() {
    hide_buttons();
    show_input("game_code","Enter Game Code");
    document.getElementById('game_code').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            var game_code = document.getElementById('game_code').value;            
            if (!game_code.replace(/\s/g, '').length) {
                alert("Field cannot be empty");
            } else {
                document.getElementById('game_code').value = "";
                hide_input("game_code");
                setAttributeForCookie("session-id",game_code);
                database.ref("active_rounds/"+game_code).once("value",function(snapshot) {
                    setAttributeForCookie("game-id",snapshot.val());
                });

                player_prompt("member");
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
    var colors = ["#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#ecf0f1","#95a5a6","#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d"];
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

    database.ref('games/' + getAttributeFromCookie('game-id') + '/current_judge').on('value', function(snapshot) {
        var el = document.querySelector("#" + snapshot.val() + " p:nth-child(2)").innerHTML = "(Judge)";
    });

    document.getElementById('game_screen').innerHTML += "<p id='game_status'>Status Text</p>";
    var draw_btn = document.createElement('button');
    draw_btn.id = 'draw_btn';
    draw_btn.innerHTML = "Draw Your Cards";    
    document.getElementById('game_screen').append(draw_btn);

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
                    document.getElementById(players[i]).classList.add('unselected');
                }
                document.getElementById(players[i]).classList.add('player_preview');
                document.getElementById(players[i]).style.backgroundColor = val_local["players"][players[i]]['background'];
                document.getElementById(players[i]).classList.remove('not_drawn');    
            }


            // if user is the judge
            if (val_local["current_judge"] == getAttributeFromCookie("player-id")) {
                var unselected = document.getElementsByClassName('unselected');
                for (var i = 0; i < unselected.length; i++) {
                    unselected[i].addEventListener('click', visualTurnShift);                  
                }
            }
        } else if (mode == "turn") {
            document.getElementById('game_status').innerHTML = val_local["players"][val_local["current_player"]]["username"] + "'s Turn"; 

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

            counter = 45;
            var x = setInterval(function() {
                var now = new Date().getTime();

                var distance = val_local["dead_line"] - now;


                var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                document.querySelector("#" + val_local["current_player"] + " p:nth-child(2)").innerHTML = seconds;

                if (distance < 0 && val_local["current_player"] != "") {
                    clearInterval(x);
                    document.querySelector("#" + val_local["current_player"] + " p:nth-child(2)").innerHTML = val_local["players"][val_local["current_player"]]["score"];
                    database.ref('games/' + getAttributeFromCookie('game-id') + '/players/' + val_local["current_player"] + "/went").set(true);
                    val_local["current_player"] = "";
                    database.ref('games/' + getAttributeFromCookie('game-id') + "/current_player").set("");
                    if (document.getElementsByClassName('unselected').length > 0) {
                        database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set('choosing');
                    } else {
                        database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set('decision');
                    }
                }
                
            }, 1000);
        } else if (mode == "decision") {
            document.getElementById("game_status").innerHTML = "Now, Judge " + val_local["players"][val_local["current_judge"]]["username"] + " is making a decision.";
            database.ref('games/' + getAttributeFromCookie('game-id') + '/players/' + getAttributeFromCookie("player-id") + "/went").set(false);

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


            if (val_local["current_judge"] == getAttributeFromCookie("player-id")) {
                var unselected = document.getElementsByClassName('unselected');
                for (var i = 0; i < unselected.length; i++) {
                    unselected[i].addEventListener('click', pickRoundWinner);                  
                }
            }

        } else if (mode == "verdict") {            
            document.getElementById("game_status").innerHTML = "Judge " + val_local["players"][val_local["current_judge"]]["username"] + " has picked " + val_local["players"][val_local["round_winner"]]["username"] + "!";
            database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + val_local["round_winner"] + "/score").once("value", function(snapshot) {
                database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + val_local["round_winner"] + "/score").set(snapshot.val() + 1);
                document.querySelector("#" + val_local["round_winner"] + " p:nth-child(2)").innerHTML = snapshot.val() + 1;
            });
            val_local["round_winner"] = "";
            var judge = val_local["current_judge"];
            document.querySelector("#" + val_local["current_judge"] + " p:nth-child(2)").innerHTML = val_local["players"][val_local["current_judge"]]["score"];

            while(judge == val_local["current_judge"]) {
                judge = players[getRandomizer(0,players.length - 1)];
            }

            val_local["current_judge"] = judge;

            database.ref("games/" + getAttributeFromCookie("game-id") + "/current_judge").set(judge);
            database.ref("games/" + getAttributeFromCookie("game-id") + "/game_mode").set("round_start");
            val_local["players"][val_local[getAttributeFromCookie("player-id")]]["drawn"] = false;
            val_local["players"][val_local[getAttributeFromCookie("player-id")]]["card"] = "";
            database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + getAttributeFromCookie("player-id") + "/drawn").set(false);
            database.ref("games/" + getAttributeFromCookie("game-id") + "/players/" + getAttributeFromCookie("player-id") + "/card").set("");

        } else if (mode == "finished") {

        }
    });

    // gauge overall status of drawing
    database.ref('games/' + getAttributeFromCookie('game-id') + '/players/').on('value',function(snapshot) {
        var players = Object.keys(snapshot.val());
        for (var i = 0; i < players.length; i++) {
            if (val_local['game_mode'] == 'round_start' && snapshot.val()[players[i]]['drawn']) {
                document.getElementById(players[i]).classList.remove('not_drawn');
                document.getElementById(players[i]).classList.add('player_preview');
                document.getElementById(players[i]).style.backgroundColor = snapshot.val()[players[i]]['background'];
            }

            if (snapshot.val()[players[i]]['went']) {
                document.getElementById(players[i]).classList.remove("unselected");
                document.getElementById(players[i]).classList.add("went");
            } else {
                document.getElementById(players[i]).classList.remove("went");   
            }

            if (document.getElementsByClassName('went').length == players.length) {
                alert("why...");
                database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set('decision');
            }

            val_local["players"][players[i]]["score"] = snapshot.val()[players[i]]["score"];

        }

        if (document.getElementsByClassName('not_drawn').length == 0 && val_local['game_mode'] == 'round_start') {
            database.ref('games/' + getAttributeFromCookie('game-id') + '/game_mode').set('choosing');
        }
        
    });
}

function pickRoundWinner(e) {
    database.ref('games/' + getAttributeFromCookie("game-id") + "/round_winner").set(e.target.id);
    database.ref('games/' + getAttributeFromCookie("game-id") + "/game_mode").set("verdict");
}

function visualTurnShift(e) {    
    database.ref('games/' + getAttributeFromCookie("game-id") + "/current_player").set(e.target.id);
    database.ref('games/' + getAttributeFromCookie("game-id") + "/game_mode").set("turn");
    var now = Date.now();
    database.ref('games/' + getAttributeFromCookie("game-id") + "/dead_line").set(now + 10000);
    // database.ref('games/' + getAttributeFromCookie("game-id") + "/dead_line").set(now + 45000);
}

function randomOccupation() {
    arr = ["doctor", "lawyer", "engineer", "psychologist", "therapist", "grocer", "businessman", "vendor", "clerk", "salesman", "voodoo doll"];
    return arr[getRandomizer(0,arr.length - 1)];
}

function randomWord() {
    arr = ["doctor", "lawyer", "engineer", "psychologist", "therapist", "grocer", "businessman", "vendor", "clerk", "salesman", "voodoo doll",'hysterical','part','prick','star','furry','whine','town','tiresome','ripe','opposite','pan','meeting','riddle','woman'    ];
    return arr[getRandomizer(0,arr.length - 1)];
}