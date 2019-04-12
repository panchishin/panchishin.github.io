
var simulations_run = 0;

var flakes = [];

$(document).ready(function(){



function initdrawit() {

    var nextFlake = Date.now()
    var lastUpdate = Date.now()
    var execute = false;

    var canvas = canvas || document.getElementById("canvas");
    var context = context || canvas.getContext('2d');
    var infobox = infobox || document.getElementById("infobox");
    flakes = [];

    function drawit() {
        var now = Date.now();
        var deltatime = now - lastUpdate;
        lastUpdate = now;

        context.clearRect(0, 0, canvas.width, canvas.height);

        flakes = flakes.filter(function(flake){
            context.save()
            context.translate(flake.x,flake.y);
            context.rotate(flake.y/10);
            context.fillStyle = "hsl(120, "+(flake.s*10)+"%, 60%)";
            context.fillRect( -flake.s/2 , -flake.s/2 , flake.s , flake.s);
            context.restore()
            flake.y += deltatime * 0.01 * flake.s;
            return flake.y < canvas.height        
        });

        infobox.innerHTML = "Total Flakes : " + flakes.length;

        window.requestAnimationFrame(drawit);
    }

    drawit();
}
initdrawit();



$(".darkmodetoggle").click(function(that){
    $("body").toggleClass("light")
    $("body").toggleClass("dark")
})


$(".runsimulation").click(function(that){
    simulations_run += 1;
    $("#statsoutput").html("Simulations : "+simulations_run);
    if ( simulations_run >= 5 ) {
        $("#stats").fadeIn(800)
    }
    flakes.push({
        x : Math.random() * canvas.width ,
        y : 0 , 
        s : Math.random() * 7 + 1
    })

})


});