var authorize=require("./../lib/index.js");

for(var i in authorize){
    console.log(authorize[i]({
        client_id:"1234567890",
        redirect_uri:"http://localhost"
    }))
}