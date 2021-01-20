const sql = require('mssql');
// const sqlConfig = {
// password: 'Password@123',
// database: 'a3s',
// stream: false,
// options: {
//     enableArithAbort: true,
//     encrypt: true
// },
// port: 1433,
// user: 'a3s',
// server: 'a3sserver.database.windows.net',
// }
var Insertdata = async function sqlresponse(data,a3sId){

    if(data.Operation == 'GetActivityLog'){
        if(a3sId){
            var request = new sql.Request();
            var getdata = await request.query("SELECT * FROM activitylog WHERE Email = '"+data.Email+"' AND OU = '"+a3sId+"'ORDER BY Time ASC")
            return (getdata)
        }
    }
    if(data.Operation === 'GetNotificationLog'){
        var request = new sql.Request();
        var getdata = await request.query("SELECT * FROM activitylog WHERE Email = '"+data.Email+"' AND Date = '"+data.Date+"' ORDER BY Time ASC")
        return (getdata)
    }
    if(data.Operation === 'GetAdmin'){
        var request = new sql.Request();
        var getdata = await request.query("SELECT * FROM admin_auth.loginauth WHERE a3sId = '"+a3sId+"'")
        return (getdata)
    }
    if(data.Operation === 'CreateURLTable'){
        var request = new sql.Request();
        var getdata = await request.query("SELECT * FROM configURLs")
        return (getdata)
    }
    // need to be deleted --- start
    if(data.Operation == 'GetSavedProgress'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'GetSavedData'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'DeleteSavedData'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'DeleteSavedData'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'GetSchedules'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'GetAllSetSchedules'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'DeleteSetSchedules'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'changeData'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'DeleteAllSchedules'){
       return ('Wrong Operation')
    }
    if(data.Operation == 'DeleteSelectedSchedule'){
        return ('Wrong Operation')
    }
    if(data.Operation == 'GetSetSchedules'){
        return ('Wrong Operation')
    }
    // end----
}
//CREATE TABLE activitylog (Email VARCHAR(100), Name VARCHAR(250), Date VARCHAR(100), Time VARCHAR(100), Activity VARCHAR(6000) );
exports.Getsqlresponse = async function (req,res){
Insertdata(req.body,req.header('id')).then(resp => {
    res.send(resp)
})
}