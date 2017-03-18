# schoolDocShare
sharing documents in google permissions based on roster lists

This application connects a schools database (test scores, class/schedule info) for the purposes of dynamically sharing documents.
Specifically this is designed for 504 & IEP sharing, but it essentially updates permissions on google drive folders based on 
teacher rosters.  Anything can go into the folders to be shared with appropriate parties.

This is a module of a larger application, which is meant for analysis and information logging for teachers, case managers, directors and other administration
or support staff.

When a student is flagged inside of the database (which in this case is powerschool, powered by OracleDB) as having a 504 or IEP,
a student's schedule is collected, along with teacher emails, a folder is created for the student inside of a parent folder, and shared
initially only with the student's scheduled teachers.  Student is given a case manager based on school/district criteria (discretion of the
director) and the manager may add additional parties to have viewing permission of student data.  504 managers also have the ability to
update or create 504s for the student, which start as a Google Form, and transform into a pdf stored in the student folder , while archiving any old documents.
This idea is based off of the way New Hampshire handles IEP updates/creation.
