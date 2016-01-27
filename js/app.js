angular.module('app', ['components'])

.controller('Afficheur', function($scope, $locale, $http) {
  $scope.data = {};

  var context;
  var bufferLoader;
  var bufferList;

  var source = [];

  var gainNode = [];
  var changeRequest = [];

  var StateCouleur = [];
  var couleurChange = false;

  var widthEcran = parseInt($(".pad").css("width"));

  var modeAuto = true;
  var mode_assiste = true;

  var taille_progressbar = 0;

  var partition = [
    [11, 0, 1, 5, 7, 17],
    [0, 1, 5, 7, 9, 13],
    [0, 1, 5, 7, 14],
    [0, 1, 5, 7, 11, 15, 17],
    [0, 1, 5, 7, 11, 15, 17, 9, 10, 16],
    [0, 3, 18, 19, 20],
    [0, 3, 18, 19, 21],
    [0, 3, 18, 19, 22],
    [0, 3, 18, 19, 20],
    [11, 0, 3, 5, 7, 17],
    [11, 0, 3, 5, 7, 9, 10]
  ];
  var indicePartition = 0;

  $('#myModal').modal('show');
  var bandReady = false;
  var valueChargement = 0;

  function loadAndPlay() {
      try {
          context = new AudioContext();
      }
      catch(e) {
          alert("Web Audio API is not supported in this browser");
      }

      bufferLoader = new BufferLoader(
          context,
          [
            "audio/drum1.mp3",
            "audio/drum2.mp3",
            "audio/drum3.mp3",
            "audio/drum4.mp3",
            "audio/drum5.mp3",
            "audio/guitar.mp3",
            "audio/guitar2.mp3",
            "audio/bass1.mp3",
            "audio/bass2.mp3",
            "audio/solo1.mp3",
            "audio/solo2.mp3",
            "audio/riff.mp3",
            "audio/bigsolo.mp3",
            "audio/solo_p1.mp3",
            "audio/solo_p2.mp3",
            "audio/solo_p3.mp3",
            "audio/percu_intro.mp3",
            "audio/violons.mp3",
            "audio/accomp2.mp3",
            "audio/basse2.mp3",
            "audio/solo2_p1.mp3",
            "audio/solo2_p2.mp3",
            "audio/solo2_p3.mp3"
          ],
          finishedLoading
      );

      bufferLoader.load();
  }

  function playSound(buffer, time, numNode) {
    var source = context.createBufferSource();
    
    source.buffer = buffer;
    source.loop = false;
    source.connect(gainNode[numNode]);
    gainNode[numNode].connect(context.destination);
    source.start(time);

    source.onended = onEnded(numNode);
    
    return source;
  }


  function onEnded(numNode) {
      //console.log('playback finished'+numNode);
  }


  $scope.data.etatChargement = "";
  function finishedLoading(buffList) {
    $scope.data.etatChargement = "OK";
    

    $scope.$apply();

    bufferList = buffList;
  }

  $scope.data.buttonDisabled = "disabled";

  setInterval(function () {
    if(valueChargement < 80)
    {
      valueChargement += 2;
    }
    else if($scope.data.etatChargement == "OK")
    {
      valueChargement += 5;
    }
    
    if (valueChargement >= 100)
    {
      $scope.data.buttonDisabled = "";
    }
    

    $('.progress-bar').css('width', valueChargement+'%');
    $scope.$apply();

  }, Math.floor(20));

  $scope.data.clickStartBand = function () {
    if($scope.data.buttonDisabled == "")
    {
      $('#myModal').modal('hide');
      startBand();
    }
  };

  function startBand() { // Démarrage du script principal

    // We'll start playing the rhythm 100 milliseconds from "now"
    var startTime = context.currentTime + 0.100;
    
    var tempo = 90; // BPM (beats per minute)
    var quarterNoteTime = 60 / tempo;
    var mesure = quarterNoteTime * 4;
    var dureeSample = mesure*4;

    console.log(bufferList.length);
    console.log(dureeSample*1000);

    var i = 0;

    angular.forEach(bufferList, function(value, key) {
      gainNode[i] = context.createGain();
      gainNode[i].gain.value = 0;
      changeRequest[i] = false;
      StateCouleur[i] = false;
      source[i] = playSound(value, 0, i);
      i++;
    });

    gainNode[16].gain.value = 2;
    gainNode[11].gain.value = 2;

    setInterval(function () {  // A chaque mesure

      var i = 0;

      if(modeAuto)
      {
        for (var i = 0; i < bufferList.length; i++) { // Pour chaque instrument
          if(i!= 12) source[i] = playSound(bufferList[i], 0, i);

          gainNode[i].gain.value = 0;

          for (var j = 0; j < partition[indicePartition].length; j++) {
            if(i == partition[indicePartition][j])
            {
              gainNode[i].gain.value = 2;
            }
          }
        }

        if(indicePartition < partition.length-1)
        {
          indicePartition++;
        }
        else
        {
          indicePartition = 1;
        }
      }
      else
      {
        angular.forEach(bufferList, function(value, key) {
          if(i!= 12) source[i] = playSound(value, 0, i);

          if(changeRequest[i])
          {
            gainNode[i].gain.value = !gainNode[i].gain.value*2;
            changeRequest[i] = false;
          }

          i++;
        });
      }

      taille_progressbar = 0;
      $('.progresstime').css('width', taille_progressbar+'%');

      
    }, Math.floor(dureeSample*1000 - 20));
       
    setInterval(function () {
      if(!mode_assiste)
      {
        var i = 0;
        
         angular.forEach(bufferList, function(value, key) {
            if(changeRequest[i])
            {
              gainNode[i].gain.value = !gainNode[i].gain.value*2;
              changeRequest[i] = false;
            }
            i++;
          });
       }

       taille_progressbar += 100/(dureeSample*50);
       $('.progresstime').css('width', taille_progressbar+'%');


    }, Math.floor(20));
    

    setInterval(function () {
      var i = 0;

      couleurChange = !couleurChange;

      angular.forEach(bufferList, function(value, key) {
        
        if(changeRequest[i])
        {
          StateCouleur[i] = couleurChange;
        }
        else
        {          
          if(gainNode[i].gain.value) // Si en lecture
          {
            StateCouleur[i] = true;
          }
          else 
          {
            StateCouleur[i] = false;
          }
        }

        i++;
      });

      $scope.$apply();
    }, Math.floor(quarterNoteTime * 1000 / 2));

    /*var colors = [
      "#BF3B58",
      "#5B3349",
      "#F4C284",
      "#F5A286",
      "#F06363"
    ];
    var iColor = 0;

    setInterval(function () {
      var color = 0;

      if(iColor < colors.length) 
      {
        color = colors[iColor];
        iColor++;
      }
      else
      {
        iColor = 0;
        color = colors[iColor];
        
      }

      //$("body").css("background-color", color);
    }, Math.floor(mesure * 1000));*/

    $(".pad").css("height", (widthEcran * (9 / 16)) + "px");
  }



  loadAndPlay();


  var drumState = false;
  var guitarState = false;

  $scope.data.clicOnOff = function(numNode) {
    //gainNode[numNode].gain.value = !gainNode[numNode].gain.value;
    changeRequest[numNode] = true;
    modeAuto = false;
  };

  $scope.data.couleurBouton = function(numNode) {
    if(StateCouleur[numNode])
    {
      return "success";
    }
    else return "danger";
  };

  $scope.data.css_brightness = function(numNode) {
    if(StateCouleur[numNode])
    {
      return "-webkit-filter: brightness(1);-moz-filter: brightness(1);-o-filter: brightness(1);-ms-filter: brightness(1);filter: brightness(1);height:"+(widthEcran * (9 / 16)) + "px;";
    }
    else 
    {
      return "-webkit-filter: brightness(0.2);-moz-filter: brightness(0.2);-o-filter: brightness(0.2);-ms-filter: brightness(0.2);filter: brightness(0.2);height:"+(widthEcran * (9 / 16)) + "px;";
    }
  };

  $scope.data.css_brightness_mode_assiste = function() {
    if(mode_assiste)
    {
      return "-webkit-filter: brightness(1);-moz-filter: brightness(1);-o-filter: brightness(1);-ms-filter: brightness(1);filter: brightness(1);height:"+(widthEcran * (9 / 16)) + "px;";
    }
    else 
    {
      return "-webkit-filter: brightness(0.2);-moz-filter: brightness(0.2);-o-filter: brightness(0.2);-ms-filter: brightness(0.2);filter: brightness(0.2);height:"+(widthEcran * (9 / 16)) + "px;";
    }
  };

  $scope.data.clic_mode_assiste = function() {
    mode_assiste = !mode_assiste;
    console.log(mode_assiste);
  };
});
