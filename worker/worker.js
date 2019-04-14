
console.log(location.search)
var parameters = {}
location.search.slice(1).split("&").forEach( function(key_value) { var kv = key_value.split("="); parameters[kv[0]] = kv[1]; })

console.log(parameters)

var worker_id = parameters['worker_id']*1;
var data = parameters['value']*1

var started = false;

function count() {
    data+= 1;
    postMessage({"id":worker_id,"value":data,"message":("Worker " + worker_id + " , Value " + data)})
    setTimeout(count,1000)
}


onmessage = function(event) {

    if ( (event.data.type === "init" )) {
        postMessage({"id":worker_id,"value":data,"message":("Worker " + worker_id + " , Initialized with Value " + data)})

    } else if ( !started && (event.data.type === "start" )) {
        
        started = true;
        setTimeout(count,1000);

    }
};