//FirstView Component Constructor

Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if (i == 0)
        return this;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1 ));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};

function FirstView() {
    var gameButton = Titanium.UI.createButton({
        title : 'Start Game',
        top : '5%',
        width : 100,
        height : 50,
        color : 'white',
        backgroundColor : 'black',
        borderRadius : 8
    });
    var currentSong = 0;
    
    var ballads;
    function loadSongs() {
        if (Titanium.Network.online == true) {
            var request = Titanium.Network.createHTTPClient();
            request.enableKeepAlive = true;
            request.setTimeout(100000000);
            request.open('GET', "http://powerballad-onpaas.rhcloud.com/rest/powerballads");
            request.onload = function() {
                ballads = JSON.parse(request.responseText);
                ballads.shuffle();
                Ti.API.info(ballads);
            };
            request.send();
        }
    }

    function playSong(songToPlay) {
        if(songToPlay >= ballads.length) {
            songToPlay = 0;
            currentSong = 0;
        }
        Ti.API.info('Playing song # ' + songToPlay);
        gameButton.setTitle('Play again');
        var streamer = Ti.Media.createAudioPlayer({
            url : ballads[songToPlay].SongURL
        });
        streamer.start();

        streamer.addEventListener('change', function(e) {
            Ti.API.info('State: ' + e.description + ' (' + e.state + ')');
            if (e.description === 'stopping') {
                streamer.stop();
            }
            if (e.description === 'stopped') {
                songOver(songToPlay);
            }
        });
    }

    function songOver(playedSong) {
        currentSong++;
        // Display Options Dialog
        var wrongOptions = [];
        wrongOptions.push(ballads[playedSong].SongBand);
        for (var i = 0; i < 3; i++) {
            var random = bands[Math.floor(Math.random() * bands.length)];
            if (wrongOptions.indexOf(random) != -1) {
                i--;
            } else {
                wrongOptions.push(random);
            }
        }
        wrongOptions.shuffle();
        var bandChoices = {
            options : wrongOptions,
            destructive : 0,
            title : 'Who is the band?'
        };
        var dialog = Ti.UI.createOptionDialog(bandChoices);
        dialog.show();
        dialog.addEventListener('click', function(e) {
            var choice = e.source.options[e.index];
            if (choice === ballads[playedSong].SongBand) {
                // The user got it right
                alert("Correct");
            } else {
                // The user got it wrong
                alert("Wrong");
            }
        });
    }

    //create object instance, a parasitic subclass of Observable
    self = Ti.UI.createView();
    loadSongs();

    var backgroundImage = Titanium.UI.createImageView({
        width : '100%',
        height : '100%',
        image : '/images/background.png',
        left : 0,
        top : '5%',
        borderRadius : 0
    });

    if (Ti.Platform.osname === "android") {
        backgroundImage.setTop(0);
    }

    gameButton.addEventListener('click', function(e) {
        playSong(currentSong);
    });
    self.add(backgroundImage);
    self.add(gameButton);
    return self;
}

module.exports = FirstView;
