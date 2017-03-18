function doGet(e) {
 ScriptApp.newTrigger('myFunction')
   .forForm(FormApp.getActiveForm())
   .onFormSubmit()
   .create();
}

function myFunction() {
  //SpreadsheetApp.flush();
  var id = '1wkSDB6y-bPXwfDdX7u1nFCHwd7WMJQkaErFGdyF0GDU';
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheets()[0];
  var formUrl = ss.getFormUrl();             // Use form attached to sheet
  var form = FormApp.openByUrl(formUrl);
  var formResponses = form.getResponses();
  //Logger.log(formResponses[formResponses.length-1]);
  var thisResponse = formResponses[formResponses.length-1].getItemResponses();
  //var sasid = thisResponse[0].getResponse();
  //Logger.log(sasid);
  

  var lRow = sheet.getLastRow();
  var lRowStr = lRow.toString();
  var nameFoldCells = sheet.getRange(lRow, 19, 1, 2);
  nameFoldCells.setFormulas([["=vlookup(C" + lRowStr +", SepTest!A:E,2,FALSE)","=vlookup(C" + lRowStr +", SepTest!A:E,5,FALSE)"]]);
  var sasid = sheet.getRange("C" + lRowStr).getValue();
  Logger.log(sasid);
  var folder = sheet.getRange("T" + lRowStr).getValue();
  var name = sheet.getRange("S" + lRowStr).getValue();
  var student = {"name": name, "sasid": sasid, "folder": folder};
  //Logger.log(student);
  var data = sheet.getDataRange().getValues();
  var rowNums = [];
  var toArchive = data.filter(function(stud, index) { stud[2] === sasid ? rowNums.push(index) : "" ; return stud[2] === sasid} );
  if(rowNums.length > 1) {
    Logger.log("ROWNUMS1: %s", rowNums);
    rowNums = rowNums.slice(0,rowNums.length-1);
    Logger.log("ROWNUMS2: %s", rowNums);
    rowNums.forEach(function(row) { Logger.log(row); ss.getSheetByName('Archive').appendRow(data[row]); sheet.deleteRow(row+1) });
  };
  SpreadsheetApp.flush();
  var editResponseUrl = formResponses[formResponses.length-1].toPrefilledUrl();
  //Logger.log(editResponseUrl);
    //var urlCol = sheet.getLastColumn();
    
  lRow = sheet.getLastRow();
  Logger.log(lRow);
  var urlCell = sheet.getRange(lRow, 18);
  //Logger.log(urlCell.getA1Notation());
  var urlRange = urlCell.setValue(editResponseUrl);
  
  //next step is to create/update the actual document
  //add student name and folder link as columns.
  lRowStr = lRow.toString();
  
  Logger.log(toArchive);
  Logger.log(toArchive.length);
  if(toArchive.length > 1 /* && toArchive[0].slice(-1) !== '' */) { var oldPdf = toArchive[0].slice(-1) }
  else { /* lRow = lRow + 1; */ var oldPdf = "empty" };
  Logger.log(oldPdf[0]);
  Logger.log(oldPdf);
  Logger.log(typeof oldPdf);
  Logger.log(typeof oldPdf[0]);
  if(typeof oldPdf === "object") { oldPdf = oldPdf[0] };
  Logger.log("To Archive: %s", rowNums);
  
  
  //Logger.log(sasid);
  SpreadsheetApp.flush();
  add_to_template(student, lRow, oldPdf)
}

