const cp = require('child_process');
var exports = module.exports = {};
exports.deploy = async function (foldername){
    console.log(foldername)
    var script = cp.exec('sample.bat',
    (error,stdout,stderr)=>{
        console.log(stdout);
        console.log(stderr)
        if(error !=null ){
            console.log(`exec error: ${error}`)
        }
    })
    return(stdout)
}
//  var script = cp.exec('sample.bat',
//     (error,stdout,stderr)=>{
//         console.log(stdout);
//         console.log(stderr)
//         if(error !=null ){
//             console.log(`exec error: ${error}`)
//         }
        
//     })