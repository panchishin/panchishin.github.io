# Snake ideas

wontonimo — 04/20/2024 4:22 PM
if snake was an unfolding game, what would you expect to unlock after the following achievements:
5 food eaten
25 food eaten
5 deaths
25 deaths
Score of 5
Score of 10

LazyMammal — 04/20/2024 4:27 PM
Ha! That's a good question. Here is the "system" of Snake [as I see it]:
speed (refresh interval)
food spawn
snake length (score)
control (keyboard)
 
Speed. Can the snake go faster or slower without changing the refresh interval? What about moving two steps forward each interval? Half a step forward? Sound bizarre, right? But what if the grid size doubled and the cell size halved? And the snake width wasn't constrained to one cell?  Or no grid at all, and the snake was able to move non-orthagonally?
Food spawn.  Could multiple food spawn so the player can choose which one to go for?  What about different types of food.  Food that grows or shrinks the snake more.  Food that awards score separately from snake length?  Food that give speed, invulnerability or other status buffs?
Snake length.  What if the snake could intentionally change its length?  Where would the body volume go?  Would the snake get skinnier if it got longer?  Get thicker if it got shorter? Would this be different from "growing" or would it be a choice in the manner of growth?
Control. Can the player unlock auto-pilot? Crash avoidance? Path planning (aka Navigation hints)? What about alternate control methods: click to move to waypoint, etc.

LazyMammal — 04/20/2024 4:34 PM
Other.  Unlock skins/cosmetics, mini-games, new hazards and rewards, ...
That's all I can think of right now off the top of my head 😄

LazyMammal — 04/20/2024 4:43 PM
Oh, barriers!
How about another snake that wants to race you for the food?

LazyMammal — 04/20/2024 4:53 PM
I just realized the Snake/Tron dichotomy.

LazyMammal — 04/21/2024 10:19 AM
P.S. another unlock candidate, Scrolling Terrain (the play field can be larger than the viewport).  Not sure the best way to implement: smooth vs stepped scrolling.

wontonimo — 04/21/2024 10:21 AM
I was thinking the same thing about the scrolling terrain.
With wide corridor mazes in some directions
A* path finding could be an unlock, with max depth being an upgradable parameter

LazyMammal — 04/21/2024 10:26 AM
Please add "unlock Rotation Controls".  Left/A or Right/D would rotate the heading. Both times I died was from pressing the direction keys too soon (both before the interval finished).  Rotation oriented controls would prevent such a senseless death

I was thinking that each 'ability' would have a cool down and fire off after the cool down.  So if the A* has a cool down of 2 sec, then it would plot a course and not plot another one for 2 sec.  If the snake finished the course before then it would just go straight or use another ability

wontonimo — 04/21/2024 10:28 AM
I was thinking something a little different, an unlock to prevent turning into death, so it would ignore your input if it caused instant death
But I like the turning keys also!

LazyMammal — 04/21/2024 10:29 AM
You could make the Ability into a Spell at first.  The user could have a toolbar (like Orb) and fire them off when available. A later unlock could add Auto-Activation toggle the user could set for one ability.  Further unlocks could increment the number of Automatons the user can configure (to auto-activate multiple abilities).

wontonimo — 04/21/2024 10:31 AM
The cooldown would be in opposition to the escalating speed, such that as you progress the speed of the game will outstrip your cool down.  Leading to need to upgrade the cooldown

LazyMammal — 04/21/2024 10:31 AM
Why not both?  You can offer the Rotation controls or[and] offer 180-Death prevention.  The Rotation controls can be a selectable option (not forced) and the 180-Death prevention could be permanent or a skill with cooldown or a food option buff 😄 
Or if the user unlocked Rotation (and selected it??) you could morph 180-Death prevention into auto-crash avoidance that would work with the tail as well.  Again with a cooldown and also not omniscient (it might auto-crash-avoid into a dead end). 

wontonimo — 04/21/2024 10:34 AM
Like in evolve where there isn't just 1 resource, I was thinking the along the same lines.  Resources would be things like time alive, apples eaten, wall death, self collision death, starvation time


wontonimo — Today at 12:01 PM
what screen size works best for publishing games to crazygames and mathgames and those other platforms?
or does it matter?

Lomaz — Today at 12:02 PM
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
is what i normally go with
crazygames has a fixed size, don't rmember what it is


with Justin
I haven't coded that yet.  The first upgrades will be things like 
    auto respawn
    auto turn right before death
    auto turn left before death
    prevent death by going backwards
    faster start time
    slower time speedup
    add red apples