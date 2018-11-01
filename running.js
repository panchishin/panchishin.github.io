
var options = {
    landing : {
        'heel first' : { 
            desc : 'land on your heel first, just like the shoe companies say to.' , 
            mods : { injury : 0.1 } 
        },
        'toe first' : {
            desc : 'land on your toes first, it is tiring but easier on your shins.' ,
            mods : { effeciency : -0.05 }
        }
    },
    hydration : {
        'whatever' : {
            desc : 'you just run, you will adapt, maybe.',
            mods : { effeciency : -0.02 }
        },
        'water' : {
            desc : 'good ol H2oh, it is what the body needs.',
            mods : { }
        },
        'sports drink' : {
            desc : 'you need the electrolikes dude.',
            mods : { effeciency : +0.01 , cost : +2 }
        },
        'cola' : {
            desc : 'it has energy and makes me go!',
            mods : { effeciency : +0.02 , cost : +2 , injury : +0.02 }
        },
        'coffee' : {
            desc : 'coffee coffee coffee',
            mods : { effeciency : +0.05 , cost : +2 , injury : +0.05 }
        }
    },
    warmup : {
        'none' : {
            desc : 'life is my warmup',
            mods : { }
        },
        'stretch' : {
            desc : 'gotta get the tendon-things and muscle-things stretched and de-notted.  You know it works cuz it hurts.',
            mods : { injury : -0.02 , time : +0.1 }
        },
        'light exersise' : {
            desc : 'gotta walk before you run, literally.',
            mods : { injury : -0.03 , time : +0.2 }
        }
    },
    frequency : {
        'once a week' : {
            desc : 'that often',
            mods : { injury : -0.05 , time : +0.0 }
        },
        'twice a week' : {
            desc : 'that often',
            mods : { injury : -0.02 , time : +1.0 }
        },
        'every other day' : {
            desc : 'that often',
            mods : { injury : -0.01 , time : +3.0 }
        },
        'most every days' : {
            desc : 'that often',
            mods : { injury : +0.00 , time : +5.0 }
        },
        'every day' : {
            desc : 'that often',
            mods : { injury : +0.01 , time : +7.0 }
        }
    }
}

