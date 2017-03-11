//this is to create//update 504 doc

//Read/Edit Document
function doc() {
  var doc = DocumentApp.openById('');
  var elements = doc.getBody();
  var j;
  var i=0;
  while(!elements.getChild(i).isAtDocumentEnd()) {
    Logger.log("%s: %s", i, elements.getChild(i).getText());
    i++ ;
    j=i;
  }
  Logger.log("%s: %s", j, elements.getChild(j).getText());
}

//DOC -> PDF

function convertPDF(docId) {
  docId = docId || '';
  var doc = DocumentApp.openById(docId);
  //var ui = DocumentApp.getUi();
//  var result = ui.alert(
//      'Save As PDF?',
//      'Save current document (Name:'+doc.getName()+'.pdf) as PDF',
//      ui.ButtonSet.YES_NO);
 // if (result == ui.Button.YES) {
    var docblob = doc.getAs('application/pdf');
    /* Add the PDF extension */
    docblob.setName(doc.getName() + ".pdf");
    var file = DriveApp.createFile(docblob);
//    ui.alert('Your PDF file is available at ' + file.getUrl());
//  } else {
//    ui.alert('Request has been cancelled.');
//  }
}

/**
 * Use Form API to populate form
 * 
 * Addapted from http://stackoverflow.com/a/26395487/1677912
 */
function populateFormResponses(sasid) {
  //I will need to use sasid to create the appropriate form
  //I will need to find the rownum of the sasid instance and replace it on the new submit
  //var ss = SpreadsheetApp.getActive();
  var id = '';
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName("Form Responses 1");
  var data = ss.getDataRange().getValues();  // Data for pre-fill
  var headers = data[0];                     // Sheet headers == form titles (questions)

  var formUrl = ss.getFormUrl();             // Use form attached to sheet
  Logger.log(formUrl);
  var form = FormApp.openByUrl(formUrl);
  var items = form.getItems();
  //var urlCol = headers.indexOf("Prefilled URL");   // If there is a column labeled this
                                                     // way, we'll update it

  // Skip headers, then build URLs for each row in Sheet1.
  for (var row = 1; row < data.length; row++ ) {
    //Logger.log("Generating pre-filled URL from spreadsheet for row="+row);
    Logger.log("Generating response from spreadsheet for row="+row);
    // build a response from spreadsheet info.
    var response = form.createResponse();
    for (var i=0; i<items.length; i++) {
      var ques = items[i].getTitle();           // Get text of question for item
      var quesCol = headers.indexOf(ques);      // Get col index that contains this 
                                                // question
      var resp = ques ? data[row][quesCol] : "";
      var type = items[i].getType().toString();
      Logger.log("Question='"+ques+"', resp='"+resp+"' type:"+type);
      // Need to treat every type of answer as its specific type.
      switch (items[i].getType()) {
        case FormApp.ItemType.TEXT:
          var item = items[i].asTextItem();
          break;
        case FormApp.ItemType.PARAGRAPH_TEXT: 
          item = items[i].asParagraphTextItem();
          break;
        case FormApp.ItemType.LIST:
          item = items[i].asListItem();
          break;
        case FormApp.ItemType.MULTIPLE_CHOICE:
          item = items[i].asMultipleChoiceItem();
          break;
        case FormApp.ItemType.CHECKBOX:
          item = items[i].asCheckboxItem();
          // In a form submission event, resp is an array, containing CSV strings. Join 
          // into 1 string.
          // In spreadsheet, just CSV string. Convert to array of separate choices, ready 
          // for createResponse().
          resp = [resp];
    //      if (typeof resp !== 'string')
    //        resp = resp.join(',');      // Convert array to CSV
   //       resp = resp.split(/ *, */);   // Convert CSV to array
          break;
        case FormApp.ItemType.DATE:
          item = items[i].asDateItem();
          resp = new Date( resp );
          break;
        case FormApp.ItemType.DATETIME:
          item = items[i].asDateTimeItem();
          resp = new Date( resp );
          break;
        default:
          item = null;  // Not handling DURATION, GRID, IMAGE, PAGE_BREAK, SCALE, 
                        // SECTION_HEADER, TIME
          break;
      }
      // Add this answer to our pre-filled URL
      if (item) {
        try {
        var respItem = item.createResponse(resp);
        response.withItemResponse(respItem);
        }
        catch(err) { Logger.log("Error: %s", err); }
      }
      // else if we have any other type of response, we'll skip it
      else Logger.log("Skipping i="+i+", question="+ques+" type:"+type);
    }

    // Submit response
    response.submit();
    //Logger.log(response.toPrefilledUrl());

    // Generate the pre-filled URL for this row
    //var editResponseUrl = response.toPrefilledUrl();

    // If there is a "Prefilled URL" column, update it
    //if (urlCol >= 0) {
    //  var urlRange = sheet.getRange(row+1,urlCol+1).setValue(editResponseUrl);
    //}
  }
};

