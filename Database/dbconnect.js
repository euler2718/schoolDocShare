var addressInt = '';
var addressExt = '';
var user = '';
var userPwd = '';
var db = '';
var oracleString = "jdbc:oracle:thin:" + user + "/" + userPwd + "@" + addressExt +":1521:" + db

var course_query = "SELECT DISTINCT Students.state_studentnumber, Students.lastfirst, Students.student_number, LOWER(Teachers.Email_Addr), CONCAT(Courses.Course_Name, CONCAT('_', CC.Section_Number)) as Course, Schools.name, SPED.services " +
                   "FROM Students " + 
                   "LEFT JOIN CC on Students.ID = CC.StudentID " +
                   "LEFT JOIN Teachers on CC.TeacherID = Teachers.ID " +
                   "LEFT JOIN Courses on CC.Course_Number = Courses.Course_Number " +
                   "LEFT JOIN (SELECT id, CASE ps_customfields.getstudentscf(id, 'Sped') WHEN 'Y' THEN 'IEP' ELSE 'B504' END services from Students ) SPED ON Students.ID = SPED.id " +
                   "LEFT JOIN Schools on Students.schoolid = Schools.school_number " +
                   "WHERE Students.enroll_status = 0 " +
                   "AND Teachers.Email_Addr IS NOT NULL " +
                   "AND Courses.Course_Name NOT LIKE '%LUNCH%' " +
                   "AND SYSDate >= CC.DateEnrolled AND SYSDate <= CC.DateLeft " +
                   "AND (ps_customfields.getstudentscf(Students.id,'Sped') = 'Y' OR ps_customfields.getstudentscf(Students.id,'504') = 'Y')";

function readFromTable() {
  
  var conn = Jdbc.getConnection(oracleString, user, userPwd);
  var start = new Date();
  var stmt = conn.createStatement();
  var meta = conn.getMetaData();
  var results = stmt.executeQuery(course_query);
  var metaRS = results.getMetaData();
  var numCols = results.getMetaData().getColumnCount();
  var arr = [];
  var counter = 0;
  
  while (results.next()) {
    counter += 1;    
    var rowString = '';
    for (var col = 0; col < numCols; col++) {
      
      try { rowString += results.getString(col + 1).trim()+ '~~~'; }
      catch(err) {
        
        //Logger.log("\n\n~~~~~~~~~~~ERROR!~~~~~~~~~~~: \n\n\t" + results.getMetaData().getColumnName(col+1) + "\n");
      }
    }
    rowString = rowString + 'Automatic'
    var spl = rowString.split('~~~');
    if(arr.indexOf(spl) === -1) arr.push(spl);
    //arr.push(rowString.split('~~~'));
  }
  
  results.close();
  stmt.close();

  var end = new Date();
  
  Logger.log('Time elapsed: %sms', end - start);
  Logger.log(arr);
  
  return arr;
};

var ss = SpreadsheetApp.openById('');
var permTest = ss.getSheetByName('PermTest');
var sepTest = ss.getSheetByName('SepTest');

function cleanSheet() {  // I am worried about the asynchronicity of this.  Will have to use callback / no Promise in Google (GAS)
  var results = readFromTable();
  permTest.sort(8);
  
  var data = permTest.getDataRange().getValues();
  var newdata = data.filter(function(student) { return student[student.length-1] !== 'Automatic'});
  
  if(newdata.length > 0) {results = results.concat(newdata)};
  permTest.clear(); //sort sheet by last column (Auto/Manu/Manager). Grab data, filter by Manu/Manager, add to results, copy to sheet.
  var range = permTest.getRange(1, 1, results.length, 8);
  range.setValues(results);
};