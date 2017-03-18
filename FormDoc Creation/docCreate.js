var ss = SpreadsheetApp.openById('');
var responseSheet = ss.getSheets()[0];
//have to put a complete list below
var caseMgrs = {"email1": "mgr1",
                "email2": "mgr2"};

function add_to_template(student, rowNum, oldPdf) {
  //Logger.log(student.folder);
  //need to gather the specific instance of the student under dataN
  var data = responseSheet.getDataRange().getValues().slice(1);
  var dataN = data[data.length-1];
  //Logger.log(dataN);
  var timeNow = new Date(); 
  var folder = DriveApp.getFolderById(student.folder);
  
  //default values
  typeof dataN[0] === undefined || dataN[0] === ''  ? dataN[0] = timeNow : dataN[0];
  typeof dataN[3] === undefined || dataN[3] === '' ? dataN[3] = timeNow : dataN[3];
  if(typeof dataN[4] === undefined || dataN[4] === '') {
    dataN[4] = dataN[3]; 
    dataN[4].setFullYear(dataN[3].getFullYear() + 1);
  }
  typeof dataN[13] === undefined || dataN[13] === '' ? dataN[13] = dataN[4] : data[13];
 
  timeNow = timeNow.toDateString();
  var obj = { "Date": [dataN[0], dataN[3], dataN[4], data[13]], "StudentInfo": [student.sasid, student.name, student.folder], "Plan": [dataN[5].split(";"), dataN.slice(6,13)], "Sig/Agree": dataN.slice(13,18) };
  var templateId = '';
  var doc = DriveApp.getFileById(templateId).makeCopy(student.name + ' - 504 - ' + timeNow, folder /*destination*/);
  var id = doc.getId();
  //Logger.log(id);
  //Logger.log(doc.getName());
  var newDoc = DocumentApp.openById(id);
  var body = newDoc.getBody();
  var numElements = body.getNumChildren();
  //for(var i =0; i < numElements-1; i++) {Logger.log("%s: %s - %s", i, body.getChild(i).getType(), body.getChild(i).asText().getText());};
  body.getChild(11).asParagraph().appendText("\t" + obj["StudentInfo"][0]).setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(12).asParagraph().appendText("\t\t" + obj["StudentInfo"][1]).setAttributes({'ITALIC': false, 'BOLD': true});
  
  body.getChild(15).asParagraph().appendText("\t" + obj["Date"][0].toDateString()).setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(16).asParagraph().appendText("\t" + obj["Date"][1].toDateString()).setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(17).asParagraph().appendText("\t" + obj["Date"][2].toDateString()).setAttributes({'ITALIC': false, 'BOLD': true});
  
  var table = body.getTables()[0];
  for(var k = 0; k < obj["Plan"][0].length; k++) {
    if(typeof obj["Plan"][0][k] === undefined || obj["Plan"][0][k] === '' ) { var str = ["",""] } //makes a couple of table cells
    else { var str = obj["Plan"][0][k].split("("); } ;
    var row = table.appendTableRow();
    row.appendTableCell(str[0]);
    row.appendTableCell(str[1].slice(0,-1));
  };
  
  var lifeAct = obj['Plan'][1][6] || obj['Plan'][1][3];
  
  body.getChild(23).asListItem().appendText("\n\n" + obj["Plan"][1][0] + "\n").setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(24).asListItem().appendText("\n\n" + obj["Plan"][1][1] + "\n").setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(26).asListItem().appendText("\n\n" + obj["Plan"][1][2] + "\n").setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(27).asListItem().appendText("\n\n" + lifeAct + "\n").setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(28).asListItem().appendText("\n\n" + obj["Plan"][1][4] + "\n").setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(29).asListItem().appendText("\n\n" + obj["Plan"][1][5] + "\n").setAttributes({'ITALIC': false, 'BOLD': true});
  
  body.getChild(32).asParagraph().appendText("\t" + caseMgrs[dataN[1]] + "\n").setAttributes({'ITALIC': false, 'BOLD': true});
  body.getChild(33).asParagraph().appendText("\t" + obj["Sig/Agree"][0].toDateString() + "\n").setAttributes({'ITALIC': false, 'BOLD': true});
  
  //Logger.log(body.getChild(28).getAttributes());
  
  newDoc.saveAndClose();
  convertPDF(id, folder, rowNum, oldPdf);
  doc.setTrashed(true);
  //return id;
};

function convertPDF(docId, folder, rowNum, oldPdf) {
  
  //somewhere in this function will have to archive files based on DocID(of pdf) on spreadsheet
  //will also have to actually put the ID onto the spreadsheet --> this will be tricker.  After this.... APP GOOD TO GO!!!
  
  var doc = DocumentApp.openById(docId);
  var docblob = doc.getAs('application/pdf');
    /* Add the PDF extension */
  docblob.setName('temp' + ".pdf");
  var file = DriveApp.createFile(docblob);
  var copy = file.makeCopy(doc.getName() + ".pdf", folder);
  var pdfId = copy.getId();
  file.setTrashed(true);
  var lCol = responseSheet.getLastColumn();
  responseSheet.getRange(rowNum, lCol).setValue(pdfId);
  //Logger.log(folder.getFoldersByName('Archive') === undefined);
  var folders = folder.getFoldersByName('Archive');
  if (folders.hasNext()) {
   var archFold = folders.next();
   var id = archFold.getId();
   Logger.log("EXISTS");
   Logger.log(id);
   archFold = DriveApp.getFolderById(id);
   var archFoldId = archFold.getId();
 }
  else { 
    var archFold = folder.createFolder('Archive'); 
    var id = archFold.getId();
    Logger.log("DOESN'T EXIST");
    Logger.log(id);
    archFold = DriveApp.getFolderById(id);
    var archFoldId = archFold.getId();
    //Logger.log(archFold.getId());
    
  };
  if(oldPdf !== "empty") { 
    Logger.log(oldPdf);
    var archFold = DriveApp.getFolderById(archFoldId);
    var archFile = DriveApp.getFileById(oldPdf);
    var archName = archFile.getName() || "ArchivedDoc.pdf";
    Logger.log(archName);
    Logger.log(archFold.getId());
    archFile.makeCopy("ARCHIVED - " + archName, archFold);
    archFile.setTrashed(true);
  };

};