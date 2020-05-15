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
var val_local = [];
// var local_cookie;
var local_cookie = "username=honeybadgerdeep;player-id=ID54;game-id=57;path=/"; // dummy local data

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
    var new_cookie = "";

    var cookie = "";

    if (location.href.includes("file://")) {
        cookie = local_cookie;
    } else {
        cookie = document.cookie;
    }

    // check for various properties in the game
    new_cookie += "username=" + (attr == "username" ? el : getAttributeFromCookie("username")) + ";";
    new_cookie += "player-id=" + (attr == "player-id" ? el : getAttributeFromCookie("player-id")) + ";";
    new_cookie += "game-id=" + (attr == "game-id" ? el : getAttributeFromCookie("game-id")) + ";";
    new_cookie += "path=/";

    if (location.href.includes("file://")) {
        local_cookie = new_cookie;
    } else {
        console.log(new_cookie);
        document.cookie = new_cookie;
    }
}

function reload() {
    window.location.reload();
}

function hide_buttons() {
    document.getElementById("joiners").style.display = "none";
}

function show_buttons() {
    document.getElementById("joiners").style.display = "block";
}

function create_new() {
    hide_buttons();
    // set game ID cookie to the game code
    player_prompt();
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
                setAttributeForCookie("game-id",game_code);
                player_prompt();
            }
        }
    });
}

function player_prompt() {
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
                welcome_screen();    
            }
        }
    });
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
    document.querySelector("#welcome_screen p:nth-child(1)").innerHTML = "Session ID: " + getAttributeFromCookie("game-id") + " (share w/ friends!)";
    document.querySelector("#welcome_screen p:nth-child(2)").innerHTML = "Welcome " + getAttributeFromCookie("username") + "!";
    data = {
        username: getAttributeFromCookie("username"),
        background: "darkorange"
    }
    add_player_preview(data);

}

function add_player_preview(data) {
    var preview = document.createElement("div");
    preview.classList.add("player_preview");
    preview.innerHTML = data['username'];
    preview.style.backgroundColor = data['background'];
    document.getElementById("welcome_screen").append(preview);
}
