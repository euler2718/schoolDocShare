<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<!--<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>-->
<script>

$(document).ready(function(){
var user = $("#user").text();
var email;

if(("__comma-sep emails__").indexOf(user) !== -1) {
  email = prompt("Please type your __school__ email address");
  if(email === '') { email = ''};
  } else { email = user; };
  
  google.script.run.withSuccessHandler(showThings).readRosters(email);
  
  $("#students").on('click', '.kids', function (e) {
    e.stopPropagation();
  $(this).siblings().toggle();
  });
  
  $("#students").on('click', '.document', function (e) {
    e.stopPropagation();
    var sasid = $(this).parent().attr('id');
    var link = $(this).siblings('a');
    var name = link.text();
    var folder = link.attr('href');
    google.script.run.withSuccessHandler(prefilledLink).findKid(parseInt(sasid));
  });
  
  $('#students').on('click','button', function(e) {
    e.stopPropagation();
    var sasid = $(this).closest('ul').siblings().attr('id');
    if(event.target.getAttribute('type') === 'delete') {
      var email = $(this).siblings()[0].innerHTML
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
function prefilledLink(student) {
  window.open(student, '_blank');
  window.focus();
};
function periodSort(id) {

  var attr = $('#' + id + " :checked")[0].value
  var rrr = [];
  var buildingObj = {};
  var buildingAttributes = {};
  var lis;
  var lisId;
  var header;
  if(id === 'teacherSort') { lisId = '#teachlist'; lis = $('#teachlist [' + attr + ']'); header = 'TEACHING'} else if(id === 'managerSort') { lisId = '#managelist'; lis = $('#managelist [' + attr + ']'); header = 'MANAGING'} else if(id === 'manualSort') { lisId = '#manuallist'; lis = $('#manuallist [' + attr + ']'); header = 'MANUAL'};
  lis.each( function() {
    });
    // Add all lis to an array
    for(var i = lis.length; i--;){
    //here is where I add to the object
        if(lis[i].nodeName === 'LI')
            rrr.push(lis[i]);
    }
    
    //put each of the LI's into an Object based on building...then sort each k:Value Array
    rrr.forEach(function(student) {
      var attrib = student.getAttribute("building");
      var liveAttribute = student.getAttribute(attr);
      buildingObj.hasOwnProperty(attrib) ? buildingObj[attrib].push(student) : buildingObj[attrib] = [student];
      buildingAttributes.hasOwnProperty(attrib) ? "" : buildingAttributes[attrib] = [];
      buildingAttributes[attrib].indexOf(liveAttribute) === -1 ? buildingAttributes[attrib].push(liveAttribute) : "";
    });
    for(var key in buildingObj) {
      buildingObj[key].sort(function(a,b) {
        if(a.getAttribute(attr) > b.getAttribute(attr)) return 1;
        else if(a.getAttribute(attr) < b.getAttribute(attr)) return -1;
        else return 0;
      });
    }
    
    rrr.sort(function(a,b) {
      if(a.getAttribute(attr) > b.getAttribute(attr)) return 1;
      else if(a.getAttribute(attr) < b.getAttribute(attr)) return -1;
      else return 0;
    });
    
    $(lisId).html('<lh><h3>' + header + '</h3></lh>');
    for(var building in buildingAttributes) {
      $(lisId).append('<li><fieldset><ul id="' + header + building + '"><lh><h2>' + building + '</h2></lh></ul></fieldset></li>');
      buildingAttributes[building].forEach(function(attriX) {
        if(attr !== 'name') {
          $('#' + header + building).append('<li style="float: left;"><fieldset><ul id="' + header + building + attriX + '"><lh><h2>' + attriX.replace(/_/g, " ").replace(/AND/g, "&").replace("B504", "504").replace("XXX", "\.") + '</h2></lh><br></ul></fieldset></li>');
        }
      });
    }
    for(var building in buildingObj) {
    var selectR = '#' + header + building;

      for(var i = 0; i < buildingObj[building].length; i++) {
        var attribute = buildingObj[building][i].getAttribute(attr);
        if(attr === 'name') {
          $(selectR).append(buildingObj[building][i]);
        }
        else if($('#' + header + building + attribute).length) {
          $('#' + header + building + attribute).append(buildingObj[building][i]);
        }
        
        else {
        
        alert(header + building + attribute);
        };
      }
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
  if(selector === 'Manager' && (studDat[3].toString() === "B504" || studDat[3].toString() === "BOTH") ) {
  $(idz).append('<li style="list-style-type:none;" class=' + selector + ' service=' + studDat[3].toString() + ' name=' + (studDat[1].replace(". ", "").split(",")[0]).replace(/\'/g, "_") + ' group=' + period + ' building=' + permdat[5].replace(/ /g, "") + '><span class="kids" id='+ studDat[0] + '>' + '<img src="data:image/png;base64,' + studDat[5] + '" class="' + studDat[3].toString() + '"><br>' + "<div class='additional'></div>" + "<a href='https://drive.google.com/drive/u/0/folders/" + studDat[4].toString() + " 'target='_blank'>" + studDat[1] + '</a><br><button type="button" class="document">UPDATE/CREATE 504</button></span><ul style="list-style-type:none; display: none;" class="manualperm"></ul></li>');
  }
  else {
  
    $(idz).append('<li style="list-style-type:none;" class=' + selector + ' service=' + studDat[3].toString() + ' name=' + (studDat[1].replace(". ", "").split(",")[0]).replace(/\'/g, "_") + ' group=' + period + ' building=' + permdat[5].replace(/ /g, "") + '><span class="kids" id='+ studDat[0] + '>' + '<img src="data:image/png;base64,' + studDat[5] + '" class="' + studDat[3].toString() + '"><br>' + "<div class='additional'></div>" + "<a href='https://drive.google.com/drive/u/0/folders/" + studDat[4].toString() + " 'target='_blank'>" + studDat[1] + '</a></span><ul style="list-style-type:none; display: none;" class="manualperm"></ul></li>');

  };
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
  if(things[0]['Manager'].length > 0) {
  $('#managerSort').css("display", "inline-block");
  $('#managing').css("display", "inline-block");
  }
  if(things[0]['Automatic'].length > 0) {
  $('#teacherSort').css("display", "inline-block");
  $('#teaching').css("display", "inline-block");    
  }
  if(things[0]['Manual'].length > 0) {
  $('#manual').css("display", "inline");   
  }
  things[1].forEach(function(studDat) {
  var filt = things[2].filter(function(studz) {return studz[0] === studDat[0];})[0];
  var period = things[2].filter(function(student) {return (student[0] === studDat[0] && student[7] === 'Automatic'); })[0];
  var bool = filt[3].split('@')[0];
    if(things[0]['Manager'].indexOf(studDat[0]) !== -1) {
      appND('Manager', studDat, filt, bool);
      $('#' + studDat[0] + '~.manualperm').append('<li style="clear: both;"><input type="email" placeholder="employee@kearsarge.org" /><button type="add">Add to list</button></li>');   
    }
    else if( (things[0]['Manual'].indexOf(studDat[0])  !== -1) && (things[0]['Automatic'].indexOf(studDat[0] === -1)) ) { appND('Manual', studDat, filt, period[6]) }
    if(things[0]['Automatic'].indexOf(studDat[0])  !== -1) {
      appND('Automatic', studDat, filt, period[4]) 
    }
  });
};

function displayPhoto(id) {
var url = "https://drive.google.com/uc?export=view&id=" + id.toString();
  $("#photo img").attr("src", url);
}
</script>