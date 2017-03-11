//testrr chanced to readRosters ; addManual & removeManual combined to changeManual

// this is my first Happy Change! :)
var ss = SpreadsheetApp.openById('permissionsSheetId');
var permTest = ss.getSheetByName('PermTest');
var sepTest = ss.getSheetByName('SepTest');
var archive = ss.getSheetByName('Archive');

var managersIEP = {}; //building to manager

var managers504 = {}; //building to manager
var adminlist = "";  //email list comma separated
var managerlist = ""; //email list comma separated

var email_manage = {}; //will have to read the building as multiple buildings, split by commas, then map :(  --> manager: [Service Type, Building] ... all strings

var principals = {}; //building: admin-comma-sep


function activeUser() {
  var email = Session.getActiveUser().getEmail();
  return email;
}

function readRosters(teachR) {
  var building;
  var studMeta;
  var start = new Date().getTime();
  var arr = {'one': permTest.getDataRange().getValues(), 'two': sepTest.getDataRange().getValues().slice(1)};
  var obj = { 'Manager': [], 'Automatic': [], 'Manual': []};
  if(teachR === undefined) {teachR = 'default email addr'}
  
  if(managerlist.indexOf(teachR) !== -1) {
    building = email_manage[teachR];
    studMeta = arr['one']
      .filter(function(teacher) { if(teacher[0].toString() === '1534147462') {Logger.log([teacher, building])}; return (teacher[3].indexOf(teachR) !== -1 || (building[1].indexOf(teacher[5].toString()) !== -1 && building[0] === teacher[6].toString() && teacher[7].toString() === 'Manager')); });
    studMeta.forEach(function(student) {
      return obj[student[7]].indexOf(student[0]) === -1 ? obj[student[7]].push(student[0]) : obj[student[7]];
    });
  }
  else if(adminlist.indexOf(teachR) !== -1) {
    studMeta = arr['one']
     .filter(function(teacher) { return (principals[teacher[5]].indexOf(teachR) !== -1); });
    studMeta.forEach(function(student) {
      return obj['Manual'].indexOf(student[0]) === -1 ? obj['Manual'].push(student[0]) : obj['Manual'];
    });
  }
  else {
    studMeta = arr['one']
     .filter(function(teacher) { return (teacher[3].indexOf(teachR) !== -1); });
    studMeta.forEach(function(student) {
      return obj[student[7]].indexOf(student[0]) === -1 ? obj[student[7]].push(student[0]) : obj[student[7]];
    });
  };
  
//  studMeta.forEach(function(student) {
//    return obj[student[7]].indexOf(student[0]) === -1 ? obj[student[7]].push(student[0]) : obj[student[7]];
//  });

  var fullArr = obj['Manager'].concat(obj['Automatic'].concat(obj['Manual']));
  var dat = arr['two']
    .filter(function(perms) { return fullArr.indexOf(perms[0]) !== -1 });
  var end = new Date().getTime();
  Logger.log('Total time: ' + parseFloat((end-start)/1000) + ' seconds');
  //Logger.log(obj);
  return [obj, dat, studMeta];
}

function changeManual(sasid, email, type) {
  var ss = SpreadsheetApp.openById('default Permiisions Sheet ID');
  var mainSheet = ss.getSheetByName('SepTest');
  var classSheet = ss.getSheetByName('PermTest')
  var mainIndeces;
  var classIndeces;
  var mainData = mainSheet.getDataRange().getValues();
  var classData = classSheet.getDataRange().getValues();
  
  var stud = mainData.filter(function(student, index) {
    if(student[0].toString() === sasid.toString()) {mainIndeces = index + 1}; return student[0].toString() === sasid.toString(); 
    });
  //Logger.log(stud[0][6]);
  if(type === 'add') {
  stud[0][6].length > 0 ? stud[0][6] += ',' + email : stud[0][6] = email;
  mainSheet.getRange(mainIndeces, 7).setValue(stud[0][6])
  classSheet.appendRow([sasid,stud[0][1] ,stud[0][2] ,email, , ,stud[0][3], 'Manual'])
  }
  
 /* 
var position = classData.reduce(function(r, student, index) {
  if(student[0].toString() === sasid.toString() && student[3] === email )
    r = index + 1;
    return {r: ;
}, -1);
*/
 else if(type === 'delete') {
   if(stud[0][6].split(',').length > 1) { var stringy = stud[0][6].replace("," + email, "") }
   else { var stringy = stud[0][6].replace(email, "") };
   classData.filter(function(student,index) {
    if(student[0].toString() === sasid.toString() && student[3] === email ) { classIndeces = index+1; };  Logger.log(index+1); return student[0].toString() === sasid.toString(); 
   });
   Logger.log([mainIndeces, classIndeces]);
   Logger.log(stringy);
   classSheet.deleteRow(classIndeces);
   mainSheet.getRange(mainIndeces, 7).setValue(stringy)
 }   
};
//this function needs a complete re-write: 
function updateAndArchive() {
  //var ss = SpreadsheetApp.openById('1XjlD2axlzK5uLclgI4tVaW_nAoJqTiFiynkbNfGfOQA');
  //var sheets = ss.getSheets();
  //var permTest = ss.getSheetByName('PermTest');
  //var sepTest = ss.getSheetByName('SepTest');
  
  var mainFolder = DriveApp.getFolderById('mainFolder ID');
  
  var arr = {'one': permTest.getDataRange().getValues(), 'two': sepTest.getDataRange().getValues().slice(1)};  
  
  //check is creating a string of SASIDs from the permTest sheet.
  var check = arr['one']
    .filter(function(sss) { return sss[7] !== 'Manager' })
    .reduce(function(total, currentValue) { if(total.indexOf(currentValue[0].toString()) === -1  ) {return total + currentValue[0].toString() + ','; } else {return total } }, '' );
  //var checkSep = arr['two'].reduce(function(total, currentValue) { if(total.indexOf(currentValue[0].toString()) === -1  ) {return total + currentValue[0].toString() + ','; } else {return total } }, '' );
  
  //if student doesn't have a record on our data sheet but does on PS, add it to our data sheet
  var checkArr = check.split(',').slice(0,-2);
  var mapDat = arr['two'].map(function(maps) { return maps[0] });
  var dataNoClass = arr['two'].filter(function(studDat) { return check.indexOf(studDat[0].toString()) === -1 });
  var classNoData = arr['one'].filter(function(studDat2) { return (mapDat.indexOf(studDat2[0]) === -1 && studDat2[7] !== 'Manager') });
  
  Logger.log("In data: " + dataNoClass.length.toString());
  Logger.log("In class: " + classNoData.length.toString());
  
  var repData = arr['two'].filter(function(studDat) { return check.indexOf(studDat[0].toString()) !== -1 });
  var obj = {};
  dataNoClass.forEach(function(kid) {
    var date = new Date();
    kid.pop();
    ss.getSheetByName('Archive').appendRow(kid.concat([date]));
    Drive.Files.update({'parents': [ { "id": "archive folder ID" }] }, kid[4]); // Hopefully this is the archive folder.  Old: 0ByWvNeGl1jslaG92VUNGS3lNeFE
  });
  
  //obj will have format SASID: [name, student_number, service, emails]
  classNoData.forEach(function(kid) {
    if(obj.hasOwnProperty(kid[0])) { if(obj[kid[0]][3].indexOf(kid[3]) === -1) { obj[kid[0]][3] += ',' + kid[3] } } else { obj[kid[0]] = [kid[1], kid[2], kid[6].toString(), kid[3]]  }
  });
  Logger.log(Object.keys(obj).length);
  Logger.log(obj);
  sepTest.clear();
  sepTest.appendRow([ "State_StudentNumber", "LastFirst", "Student_Number", "IEP/504", "FolderID", "PicString", "Manual" ]);
  
  // before running the code below, should check for student in archive FIRST.  Then bring back student data if found, including folder.
//  var archiveDat = archive.getDataRange().getValues();
  for(var keys in obj) {
//    var isArchive = archiveDat.filter(function(stateno) {
//      return stateno[0] === keys;
//      
//    })[0];
//    if(isArchive !== undefined && isArchive[0] === keys) {
//      var foldId = isArchive[4];
//      sepTest.appendRow([isArchive.slice(0,-1)]);   
//    }      
//    else {
//      var folds = mainFolder.createFolder(obj[keys][0]);
//      var foldId = folds.getId();
//      sepTest.appendRow([keys].concat(obj[keys].slice(0,obj[keys].length-1)).concat(foldId));
//    };
      var folds = mainFolder.createFolder(obj[keys][0]);
      var foldId = folds.getId();
      sepTest.appendRow([keys].concat(obj[keys].slice(0,obj[keys].length-1)).concat(foldId));
    switch(obj[keys][2]) {
      case 'B504':
        //Logger.log('504');
        Drive.Files.update({'folderColorRgb': '#0000FF'}, foldId ) 
        break;
      case 'IEP':
        //Logger.log('IEP');
        Drive.Files.update({'folderColorRgb': '#00FF00'}, foldId ) 
        break;
    }
  }
  
  
  var formulas = [];
  var objLen = Object.keys(obj).length;
  Logger.log(objLen);
  
  for(var i=0; i < objLen; i++) {
    formulas.push(["=VLOOKUP(A" + (i+2).toString() + ",PhotoStrings!A:C, 3, False)"]);
  }
  
  var range = sepTest.getRange("F2:F" + (1+objLen).toString());
  
  if(formulas.length > 0) { Logger.log(formulas); range.setFormulas(formulas) } ;
  
  var newRange = sepTest.getRange(2+objLen, 1, repData.length, 7);
  newRange.setValues(repData);
  
  //Logger.log(formulas);
  //Logger.log(range.getA1Notation());
  //Logger.log(dataNoClass);
  //Logger.log(classNoData.length);
};

function updatePermissions() {
  var managers = { "B504": managers504, "IEP": managersIEP };
  var ss = SpreadsheetApp.openById('');
  var sheet = ss.getSheetByName('SepTest');
  var perms = ss.getSheetByName('PermTest');
  var sheetDat = sheet.getDataRange().getValues().slice(300,315);
  var permDat = perms.getDataRange().getValues();
  var obj = { 'Manager': {}, 'Automatic': {}, 'Manual': {} };
  
  //creates the object above without duplicates...
  permDat.forEach(function(student) {
    var type = student[7].toString();
    var zasid = student[0].toString();
    var mail = student[3].toString();
    var building = student[5].toString();
    var service = student[6].toString();
     if(type === 'Manager') {
       if(!(obj[type].hasOwnProperty(zasid))) { 
         obj[type][zasid] = [mail, building, service]; 
       } else if(obj[type][zasid][0].indexOf(mail) === -1) { 
        obj[type][zasid][0] += "~~~" + mail;
       };
     }
     else if(!(obj[type].hasOwnProperty(zasid))) {  //this conditional actually seems redundant...
       obj[type][zasid] = [mail,building]; 
     } else if(obj[type][zasid][0].indexOf(mail) === -1) { 
       obj[type][zasid][0] += "~~~" + mail;
     };
  });
  
  for(var sasid in obj['Automatic']) {
    
    var emails = obj['Automatic'][sasid][0];
    //Logger.log(emails);
    var autoMail = principals[obj['Automatic'][sasid][1]];
    autoMail.split(",")
      .forEach(function(automaticMail) { if(emails.indexOf(automaticMail) === -1) { emails += "~~~" + automaticMail} });
    Logger.log(emails);
    emails = emails.split("~~~");
    if(obj['Manual'][sasid]) {
      //Logger.log(sasid);
      //Logger.log(obj['Manual'][sasid]);
      var tempEmails = obj['Manual'][sasid][0].split("~~~");
      Logger.log(tempEmails);
      tempEmails
        .forEach(function(exp) { emails.push(exp); });
    }
    //Logger.log(emails);
    var dat = sheetDat.filter(function(instance) {  return instance[0].toString() === sasid.toString() })[0];

    try { 
      var folderID = dat[4]; 
    
    
      var folder = DriveApp.getFolderById(folderID);
      var viewerArray = folder.getViewers();
      for(var i=0; i < viewerArray.length; i++) { folder.removeViewer(viewerArray[i]); }
      
      for(var a=0; a<emails.length; a++) {
        Drive.Permissions.insert(
          {
            'role': 'reader',
            'type': 'user',
            'value': emails[a]
          },
          folderID,
          {
            'sendNotificationEmails': 'false'
          }
        );
        
      }
    }
    catch(err) { "Error: "+ err.toString(); /* + Logger.log(sasid.toString()); */} 
  }
  
  for(var sasid in obj['Manager']) {
    var emails = obj['Manager'][sasid][0];
    var inst = obj['Manager'][sasid];
    var manageMail = managers[inst[2]][inst[1]];
    if(inst[2] === 'BOTH') { Logger.log(sasid); manageMail = managers['B504'][inst[1]] + managers['IEP'][inst[1]] };

    manageMail.split(",")
      .forEach(function(managerMail) { if(emails.indexOf(managerMail) === -1) { emails += "~~~" + managerMail} });
    emails = emails.split('~~~');
    //Logger.log(emails);
    var dat = sheetDat.filter(function(instance) { /* Logger.log([instance[0], sasid]); */ return instance[0].toString() === sasid.toString() })[0];
    //Logger.log(dat);
    try { 
      //Logger.log("manager TRY"); 
      var folderID = dat[4]; 
      var folder = DriveApp.getFolderById(folderID);
      var editorArray = folder.getEditors();
    
      for(var i=0; i < editorArray.length; i++) {
        var curmail = editorArray[i].getEmail();
        if(curmail !== '' && curmail !== '' && curmail !== '') {
          folder.removeEditor(editorArray[i]);
        } 
      }
      //need to add emails to the list  (Dom for Karas kids, etc).  Use the objects above.
      for(var a=0; a<emails.length; a++) {
        Drive.Permissions.insert(
          {
            'role': 'writer',
            'type': 'user',
            'value': emails[a]
          },
          folderID,
          {
            'sendNotificationEmails': 'false'
          }
        );
      }
    }
    catch(err) { Logger.log("Error: " + err.toString()  + " ~~~" + obj['Manager'][sasid].toString() );  } 
  }
  
};
