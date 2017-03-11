<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<!--<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>-->
<script>
//showThingsB changed to showThings
//testrr chanced to readRosters ; addManual & removeManual combined to changeManual

$(document).ready(function(){
var user = $("#user").text();
var email;

if(("admin emails, sep by comma").indexOf(user) !== -1) {
  email = prompt("Please type your kearsarge email address");
  if(email === '') { email = 'default email'};
  } else { email = user; };
  google.script.run.withSuccessHandler(showThings).readRosters(email)
  $("#students").on('click', '.kids', function (e) {
    e.stopPropagation();
  $(this).siblings().toggle();
  });
  
  $('#students').on('click','button', function(e) {
    e.stopPropagation();
    var sasid = $(this).closest('ul').siblings().attr('id');
    if(event.target.getAttribute('type') === 'delete') {
      var email = $(this).siblings()[0].innerHTML
      //alert([sasid, email]);
      $(this).parent().remove()
      google.script.run.changeManual(sasid, email, 'delete');
    }
    else if(event.target.getAttribute('type') === 'add' && $(this).siblings(':input').val().length) {
      var email = $(this).siblings(':input').val();
      var text = '<button type="delete" class="manbutt">x</button>' + '<div style="float:right;">' + email + '</div>';
      $('<li />', {html: text}).prependTo($(this).parent().parent().before());
      google.script.run.changeManual(sasid, email, 'add');
      $(this).siblings(':input').val('');
    };
  });    
});

function periodSort(id) {
var attr = $('#' + id + " :checked")[0].value
  var rrr = [];
  var lis;
  var lisId;
  var header;
  if(id === 'teacherSort') { lisId = '#teachlist'; lis = $('#teachlist [' + attr + ']'); header = 'TEACHING'} else if(id === 'managerSort') { lisId = '#managelist'; lis = $('#managelist [' + attr + ']'); header = 'MANAGING'} else if(id === 'manualSort') { lisId = '#manuallist'; lis = $('#manuallist [' + attr + ']'); header = 'MANUAL'};
  lis.each( function() {
    });
    // Add all lis to an array
    for(var i = lis.length; i--;){
        if(lis[i].nodeName === 'LI')
            rrr.push(lis[i]);
    }
    
    rrr.sort(function(a,b) {
      if(a.getAttribute(attr) > b.getAttribute(attr)) return 1;
      else if(a.getAttribute(attr) < b.getAttribute(attr)) return -1;
      else return 0;
    });
    
    $(lisId).html('<lh><h3>' + header + '</h3></lh>');
    for(var i = 0; i < rrr.length; i++) {
      var attribute = rrr[i].getAttribute(attr);
      if(attr === 'name') {
        $(lisId).append(rrr[i]);
      }
      else if($('#' + attribute).length) {
        $('#' + attribute).append(rrr[i]);
      }
      else if(id === 'teacherSort') {
        $(lisId).append('<li style="clear: both;"><fieldset><ul id="' + attribute + '"><lh><h2>' + attribute.replace(/_/g, " ").replace(/AND/g, "&").replace("B504", "504").replace("XXX", "\.") + '</h2></lh><br></ul></fieldset></li>');
        
      }
      else if(id === 'managerSort') {
        $(lisId).append('<li style="clear: both;"><fieldset><ul id="' + attribute + '"><lh><h2>' + attribute + '</h2></lh><br></ul></fieldset></li>');
      }
      
      else if(id === 'manualSort') {
        $(lisId).append('<li style="clear: both;"><fieldset><ul id="' + attribute + '"><lh><h2>' + attribute + '</h2></lh><br></ul></fieldset></li>');
      }
      
      $('#' + attribute).append(rrr[i]);
    }
}

function appND(selector, studDat, permdat, period) {
if(period === undefined) { period = 'Z' };
var list;
var newMap = [];
  var idz='';
  switch(selector) {
    case 'Manager':
      idz = '#managelist';
      studDat[6] !== undefined && studDat[6].length > 0 ? newMap = studDat[6].split(',') : newMap;
      break;
    case 'Automatic':
      idz = '#teachlist';
      break;
    case 'Manual':
      idz = '#manuallist';
      break;
  }
  var num = newMap.length;

  if(selector === 'Automatic') {
    period = period.replace(/ /g, "_").replace(/&/g, "AND").replace(/\./g, "XXX") ; //this is the global version of replace.  regular matches first instance only.
  }
  $(idz).append('<li style="list-style-type:none;" class=' + selector + ' service=' + studDat[3].toString() + ' name=' + (studDat[1].replace(". ", "").split(",")[0]).replace(/\'/g, "_") + ' group=' + period + ' building=' + permdat[5].replace(/ /g, "") + '><span class="kids" id='+ studDat[0] + '>' + '<img src="data:image/png;base64,' + studDat[5] + '" class="' + studDat[3].toString() + '"><br>' + "<div class='additional'></div>" + "<a href='https://drive.google.com/drive/u/0/folders/" + studDat[4].toString() + " 'target='_blank'>" + studDat[1] + '</a></span><ul style="list-style-type:none; display: none;" class="manualperm"></ul></li>');
  if(selector === 'Manager') {
    $('#' + studDat[0] + ' .additional').text("Add'l: " + num.toString());
  }
  if(num > 0) $('#' + studDat[0] + ' .additional').css("color", "red");
  
  if(newMap.length > 0) {
    for(var i=0; i < newMap.length; i++) {   
        $('#' + studDat[0] + '~.manualperm').append('<li><button type="delete" class="manbutt">x</button>' + '<div style="float:right;">' + newMap[i] + '</div>' + '</li>');
    }
  }
};

function showThings(things) {
  //var list = $('#students');
  //list.empty();
  if(things[0]['Manager'].length > 0) {
  $('#managerSort').css("display", "inline-block");
  $('#managing').css("display", "inline-block");
    //list.append('<div id="managing"><ul id="managelist"><lh><h3>MANAGING</h3></lh></ul></div><br>');
  }
  if(things[0]['Automatic'].length > 0) {
  $('#teacherSort').css("display", "inline-block");
  $('#teaching').css("display", "inline-block");
  //$('#teaching').css("clear", "both");
    //list.append('<div id="teaching"><ul id="teachlist"><lh><h3>TEACHING</h3></lh></ul></div><br>');
    
  }
  if(things[0]['Manual'].length > 0) {
  $('#manual').css("display", "inline");
    //list.append('<div id="manual"><ul id="manuallist"><lh><h3>OTHER EDUCATIONAL INTEREST</h3></lh></ul></div><br>');
    
  }
  things[1].forEach(function(studDat) {
  var filt = things[2].filter(function(studz) {return studz[0] === studDat[0];})[0];
  var period = things[2].filter(function(student) {return (student[0] === studDat[0] && student[7] === 'Automatic'); })[0];
  var bool = filt[3].split('@')[0];
    if(things[0]['Manager'].indexOf(studDat[0]) !== -1) {
    //add some functionality here to determine case manager or NOT
    
    //var bool = filt[3].split('@')[0];
      appND('Manager', studDat, filt, bool);
      $('#' + studDat[0] + '~.manualperm').append('<li style="clear: both;"><input type="email" placeholder="employee@kearsarge.org" /><button type="add">Add to list</button></li>');
      
    }
    else if( (things[0]['Manual'].indexOf(studDat[0])  !== -1) && (things[0]['Automatic'].indexOf(studDat[0] === -1)) ) { appND('Manual', studDat, filt, period[6]) }
    if(things[0]['Automatic'].indexOf(studDat[0])  !== -1) {
      //var period = things[2].filter(function(student) {return (student[0] === studDat[0] && student[7] === 'Automatic'); })[0];
      appND('Automatic', studDat, filt, period[4]) 
    }
  });
};

function displayPhoto(id) {
var url = "https://drive.google.com/uc?export=view&id=" + id.toString();
  $("#photo img").attr("src", url);
}

</script>