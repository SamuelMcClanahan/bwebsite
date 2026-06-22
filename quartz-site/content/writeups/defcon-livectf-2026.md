---
title: "DEF CON CTF Qualifiers 2026: LiveCTF"
description: How we built tooling, iterated bots, and dominated an 80×1000 PvP battlefield across six phases to earn the most points in LiveCTF.
tags: [ctf, livectf, defcon, bot-strategy]
date: 2026-05-10
---

We earned 1935 points in LiveCTF this year, the most out of any team. This writeup describes our tooling, methodology, and overall bot strategy.

LiveCTF this year was formatted as a set of eighty 1000-bot PvP matches in each of six phases. Depending on the phase, you earn points for getting kills and staying on/entering a region.

## Tooling

### Dashboard

Our primary tooling was a server to constantly simulate many games at a time:

![Dashboard leaderboard](https://hackmd.io/_uploads/rkHQFJreGe.png)

Importantly, we can upload our bot binaries to a dashboard, which displays a leaderboard of bots sorted by expected value of points. Various metrics about the bot (wins, games, ELO, best, etc.) are also provided, though histograms give us a better understanding of the distribution of scores:

![Score histograms](https://hackmd.io/_uploads/ry4wYkHxGg.png)

Games are simulated at a rate of roughly 100/minute, and this gives us a pretty good idea of which bot is best over a long period of time. This also allows us to compare downloaded bots from other teams when available, and choose which bot to deploy. Generally, we would be confident to move a good prototype from the testing server to the live game server in about 2–3 minutes.

Of course, our bots do not play the same strategy as the bots in the live game, but having all of the bots play in the same arena makes for a good heuristic as to what bot is the "best", provided there are enough bots.

### Compiler and Assembler

Compared to the tooling we made for the server, the tooling we used to compile and assemble together bytecode-readable binaries was somewhat decentralized: not all of us used the same tools—different people had their own set of tooling. The general high-level idea and the initial tooling, though, was shared. Through a rudimentary compiler, we abstracted implementation to a C-like language, so we could implement routines with higher-level programming constructs. We also made a basic assembler so we could program VM instructions in Python. Both of these tools (along with others we had) made the friction of going from idea to completed program much lesser, both for us and LLMs. LLMs served as a very helpful tool during this phase: they allowed us to describe high-level bot behavior and strategies in natural language and turn them into VM-ready binaries, saving us time and energy from largely mechanical tasks.

Interestingly enough, we did not obfuscate our own bots, though there were certainly talks to do such within one of our in-person groups. There was strong *potential* for obfuscation, given the stack-machine nature of the VM architecture and the fact that there was no effective separation between code and data (e.g. there were no permissions). Ultimately though, we thought obfuscation was a poor use of our time, and would only marginally slow down other teams in their analysis of our strategies. This proved right: another team discussed in the DEF CON Quals discord that they had tooling to recreate bots solely based on their behavior in the game, which would've made any programmatic obfuscation pointless.

### Reversing

We used LLMs through harnesses like Codex to help reverse engineer binaries that were released after the end of each stage using tools like IDA Pro. This LLM-assisted reversing of the game binary itself was also how we uncovered the bugs we later exploited, such as the teleport mechanic and quad-kill behavior discovered in Phase 4.

Binary reversing was much more AI-driven than the manual work we actually did like scouting, strategizing, and engineering together bots at a high level. These parts remained almost-solely human-driven.

For the most part, we manually scouted and inspected other bots and developed countermeasures. Though we did write a MCP server to allow LLM agents to perform quantitative strategic analysis on other teams (e.g. "how long did X team last"), behavioral analysis was all done by people.

### General Strategy

I think our success in LiveCTF was for two main reasons:

1. that we had good timezone coverage in our merger between players in the US, Europe, and South Korea; and
2. that we placed a much larger than normal importance on LiveCTF following our understanding of scoring mechanisms.

Throughout the 24 hours that LiveCTF was running, we generally had 2–4 players on at all times developing new strategies, doing recon on other teams, working on tooling, and actively deploying new bots.

When we struggled to improve, we watched matches of the top-performing bots from other teams to reverse engineer their strategies. At times, we directly downloaded the binaries uploaded by teams from previous phases and analyzed them to complement our own strategies.

## Phase 1

The first bot we submitted was this "lunge" idea, which seemed to work relatively well. Since movement is resolved before the trigger is processed, the bot can lunge into the same "lane" as a different bot, anticipating movement towards the same direction, then retreat afterward. This was the bot we used for most of this phase.

We also (with our rudimentary compiler) created a "linehunter" strategy that was quite efficacious. This simple bot moved back and forth on the x-axis, periodically shooting. After some iteration on the movement speed and distance of movement, we deployed this for the latter part of the first phase, seeing how helpful our local battleground was.

Phase 1 was ultimately simple. A dominant strategy employed by other teams was to stay put (or minimally move) and shoot in all cardinal directions. Phase 1 was also where we experimented with some LLM-driven algorithm ideation. We saw some success, but at most LLMs were able to iterate perhaps 10–20% beyond what we currently had. We ultimately concluded that design ideation was much better done by humans, as LLMs simply weren't able to holistically account for all of the niche and wide-spread intricacies of the game, alongside the strategies being employed by other teams. Perhaps better LLM integrations would've resolved some of this, but LLMs were simply not able to come up with anything novel that performed significantly better than anything else we had. Our "King Von" bot from Phase 4, which performed often >2× higher than our opponents, was human-designed, from ideas we had on paper (and talking verbally with each other in one of our in-person groups) to implementation iteration.

## Phase 2

The biggest change in Phase 2 was that, unlike Phase 1, triggers were introduced. In particular, we confirmed that `trigger bit 2` corresponded to weapon switching, which meant that the core meta was not simply "move and shoot," but rather "switch weapons while shooting." The trigger bits we identified were `1 = fire`, `2 = cycle weapon`, and `4 = half-speed movement`.

Our initial strategy was a 4-tick turret. The bot barely moved, stayed mostly in place, rotated through four directions, and fired every tick. Because the firing cooldown and the direction-rotation cycle were slightly out of sync, it was able to cover multiple directions consistently, and this worked well in the early stage of Phase 2.

The next improvement focused on adjusting the trigger schedule. The key idea was to alternate triggers like `7, 3, 7, 3, ...`. This allowed the bot to fire every tick and continuously cycle weapons, while applying half-speed movement only every other tick. The goal was to make frequent use of the stronger Phase 2 weapons—especially the second weapon, which appeared to have a wider hitbox—while avoiding the downside of being slowed down too much.

After that, we reviewed actual game replays and improved the bot to reduce the `stuck problem`, where our bot would get trapped in a corner and become unable to do anything. We kept the existing attack pattern, but adjusted the movement logic to reduce cases where the bot got pinned against walls.

Finally, instead of testing only against the performance of our mock playground, we collected other teams' bots from actual Phase 2 game data and ran local simulations against them to select candidates. Some candidates did not look as strong in the mock environment, but performed better against real opponents in our tests, so we ended up deploying one of those bots.

## Phase 3

The biggest change in Phase 3 was that flags drop at the location where a bot is killed, and a bot earns points by moving onto a flag.

In Phase 3, we used the following 3 types of bots, continuously replacing whichever achieved the highest average score in our mock playground.

1. A bot using the same strategy as in Phase 2, with triggers like `7, 3, 7, 3, ...` and a fix for the stuck problem
2. A bot selected by collecting other teams' real Phase 3 game bots, simulating against them locally, then using genetic search/sweeps to pick variants and mutate their trigger bit configurations—testing values like `−1`, `31`.
3. A bot using the 4-tick turret strategy from early Phase 2.

Initially, we deployed type 1 bots using the Phase 2 strategy to achieve high scores in the mock playground environment.

As the game progressed, we collected strategies from other teams' bots in replays, modified trigger bits and other elements in various ways, tested the bots' strategies in the mock playground, and deployed whichever bot received the highest average score.

During the game, the strategy used in the early stages of Phase 2 again achieved high scores in the mock playground, and this pattern repeated until the end of Phase 3, with the three types of bots taking turns achieving the highest average scores.

We deployed various types of bots against real opponents, but score variance was large in every game, making it difficult to accurately evaluate performance differences between bots. As a result, we alternated between the three types of bots and recorded a mid-range score.

## Phase 4

During phase four, we created what we called the "King Von" bot, characterized primarily by its hyper aggressive behavior. The core idea is to jump to nearby bots and shoot to eliminate them immediately. The bot periodically ran a syscall to identify nearby players, then used the move function to try and jump to their position, allowing us to kill them and collect their flag at once.

Our first idea was to try and create a "map" of the region around us, caching the location of where nearby bots were. Then, if we are able to determine that a bot has somehow "vanished" from this region (i.e. they were killed), we would try to move there to claim their flag. We couldn't get a version of this that worked well, and we realized that a better way of getting flags was to jump onto players and eliminate them directly.

This tactic was exceptionally successful for a few reasons:

1. Most enemy bots were passive at this stage. They either moved or shot randomly, stayed stationary, or evaded when others approached. What we realized is that, instead of staying alive while doing nothing, actively hunting for easy targets often yielded a higher score, even in cases where we died early due to the aggressiveness.
2. When we teleport onto an enemy bot, we can shoot it immediately upon arrival, before it can even detect us. By teleporting to the enemy bot's position before killing it, we receive points both for eliminating the bot and for capturing the flag, allowing us to maximize the number of points we earn.
3. Through some testing, we realized if we use the quad shot weapon when we are on top of another bot, it kills them four times and drops four flags, effectively multiplying the amount of points we get from killing a bot by four.

While we entered phase four very late, this bot was extremely effective and elevated us from ~30th to 2nd within the phase. As the phase continued, the core concept did not change, but King Von underwent a large amount of tuning to improve, which was made easier through all our tooling.

Via our testing server and an MCP server we were able to have an agent iterate on the bot continuously, changing more general parameters as we saw fit from replays, like how greedy the bot was, or how it tried to lead into a target. We also realized that the ELO rating system we implemented had become saturated due to a large number of old and simple bots. In light of this, we empirically found that the average score metric we recorded was far more effective at determining success in the actual game, though it was certainly not one-to-one.

All of this enabled the Von bot to become highly effective, setting a record score in Phase 4 of over 900 points. It was probably the most dominant bot we made overall.

![King Von score record](https://hackmd.io/_uploads/r1bFnktlGe.png)

## Phase 5

This phase introduced a literal KoTH mechanic: bots could earn one point per tick for simply staying at the hill, and earn two points every time they entered the hill. This addition made path finding to the hill the obvious mechanic that would earn a lot of points (~3600 over each game if successful). Since the map is too large/difficult to encode, we precompute a set of "waypoints" on the map that the bot can travel between freely to reach the hill. Every spawn position on the game board can reach at least one waypoint, so the bot is programmed to reach the nearest waypoint first, then navigate the graph to reach the root node (i.e. the hill). We called this strategy "WayNet" (i.e. waypoint network).

This phase also introduced swept hitboxes on bullets. That means when a bot moves, its hitbox extends to the entire path it moved: a bot that travelled further at once had a larger hitbox, since it swept from the initial position of the bot to its final position. This wasn't a major concern early on, but as the phase progressed people started to notice common paths taken by our bots and began camping near the paths. We call this behavior "sniping" — because they literally snipe our birds down mid air (as we move past them).

To address this issue, we implemented multiple strategies.

1. We made our bot spend several ticks (about 7) standing still at the beginning of each round. This delay allowed us to survive the chaotic "kill wave" that happened at the start of each round. Once more than half of the bots had died from this kill wave, it became much safer for us to travel, increasing the probability that our bot would reach the hill intact.
2. We made our bot use alternative routes instead of reusing several common paths to the center. We also made the bot prefer paths near the border of the map rather than moving directly through the middle, where many campers were located. Based on our in-game observations, we blacklisted several highly dangerous sections that were frequently covered by campers.
3. We also introduced Path Obfuscation because we found that some campers would predict our path based on our previous movements and snipe us mid-air. For example, if we moved horizontally from point A to point B, they would assume that we would continue along the same line toward point C, where A, B, and C are collinear. The core idea of Path Obfuscation is to take small steps and make random moves every few steps, confusing campers that try to predict our path.

After arriving at the hill, our bot would remain there until around the 3,000th tick. It would then begin scanning nearby bots and attempt to shoot anyone wandering past us. Waiting on the hill for a period of time allowed other bots there to accumulate points, so killing them later granted us more points than we would have received if we had eliminated them earlier.

This delayed-kill strategy proved to be incredibly effective, as our best run reached 9,000 points in a single round by killing an enemy bot near the end of the round at the hill.

## Phase 6

During this stage, we switched to a completely new map that was distributed *only* through this stage. Ironically, this phase was largely luck-based: most other teams, including us, copied each other and settled on a bot that "ping ponged" around the map (kind of like how the iconic bouncing DVD logo moved):

![DVD logo bounce](https://img.itch.zone/aW1hZ2UvNDk3MzE4LzI1NzEwMjIuZ2lm/original/NbUQh8.gif)

Most of our strategies did not work very well. They were only able to function effectively depending on the location where our bots were randomly spawned. We attempted to adapt our pathfinding algorithm for the new map, but we found that our bots were often spawn killed not even four seconds in; there was little we could do to curb this reality, though some teams tried to work around this by hugging the walls to reduce exposure to enemy bots.

Though there was also a KoTH added to this phase, we didn't develop a bot that would make use of the area on this new map. Our own findings from qualitative analysis actually told us that DVDing around the map would actually yield us *more points* than using the KoTH, even with exploiting the point bonus given for entering and leaving the hill.

The points that we accumulated in the earlier phases helped dampen the luck-based nature of this stage: we were only able to win the competition as a whole (by total number of points) by our wins in earlier phases of the CTF, even though we never won any individual stage.

## Conclusion

We thoroughly enjoyed working on the challenges and welcomed the addition of a novel challenge in DEF CON Qualifiers. Although some strategies (like the DVD strategy, for other teams) remained dominant across many of the phases, it was nice theorizing and implementing our own strategies.

In the early phases, we utilized guesswork and experimentation to determine which strategies would score us points, but in the later phases, we relied more heavily on the parts of the game binary we found to be exploitable to our advantage (like teleporting across the map or quad killing bots) to secure our victory.

Our investment in tooling paid dividends throughout the entire competition, letting us iterate and confidently deploy bots into the real game. LLMs also proved to be a useful force multiplier on mechanical tasks such as reversing binaries and compiling VM code. However, human design and intuition ultimately proved to be the deciding factor in our victory.

Finally, our team structure also deserves a mention. Having players spread across time zones meant we had meaningful coverage through the phases. Having a group of people in person focusing on LiveCTF enabled us to rapidly ideate novel strategies, like the King Von bot, through people talking things out and sketching strategies on paper.

## Related

- [[paper-2]], [[forensics-git-2]] — more CTF writeups
- [[cv]]
