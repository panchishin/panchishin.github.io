
var worker_id = Date.now() % 100000;

var data = 0;

var started = false;

function count() {
    data+= 1;
    postMessage({"id":worker_id,"value":data,"message":("Worker " + worker_id + " , Value " + data)})
    setTimeout(count,1000)
}


onmessage = function(event) {

    if( event.data.type === "init" ) {

        data = event.data.value;
        postMessage({"id":worker_id,"value":data,"message":("Worker " + worker_id + " , Initialized with : " + data)})

    } else if ( !started && (event.data.type === "start" )) {
        
        started = true;
        setTimeout(count,1000);

    }
};