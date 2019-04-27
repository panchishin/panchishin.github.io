
function createFPSReporter(element_id){
    let fps_element = document.getElementById(element_id);
    let requests = 0;
    let lastTime = Date.now();
    let clock = 0;
    return function(){
      let thisTime = Date.now();
      requests += 1
      if (thisTime - lastTime >= 500) {
          let rate = 1000*requests/(thisTime - lastTime);
          clock = (clock+1)%4;
          fps_element.innerHTML = Math.round( rate ) + " " + (clock==0?"/":(clock==1?"-":(clock==2?"\\":"|"))) ;
          requests = 0;
          lastTime = thisTime;
      }
    }
};