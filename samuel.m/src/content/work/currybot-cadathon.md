---
title: "Currybot — WCP CADathon"
date: 2026-05-15
tags: [frc, cad, robotics, cadathon]
category: project
excerpt: "A complete CAD submission for the WCP Hero Heist CADathon — a Gadgeteer-archetype FRC robot featuring swerve drive, hooded shooter, two-stage elevator, and a wrist for story panel scoring."
---

Named after the greatest sharpshooter of all time, Currybot is our submission to the WCP Hero Heist CADathon. This writeup covers the full design process — from game analysis and strategic archetype selection through subsystem-level decisions — for a robot built around 8033's manufacturing capabilities: two CNC routers, a CO2 laser cutter, a manual lathe, and a variety of 3D printers.

The color scheme follows 8033's identity: black anodized tubes, purple powder coated plates, tinted polycarbonate, and purple/black 3D prints.

## Strategy

### Needs and Wants

Analyzing Hero Heist, we concluded that a robot competitive at the California regional or championship division level needed to be able to do almost everything on the field. This led us to the **Gadgeteer archetype**, capable of scoring both story panels and speech bubbles at multiple heights.

Our requirements breakdown was straightforward:

**Needs** — swerve drive; score panels in all levels except the top of East Foothills; possess and score four speech bubbles into all goals; possess a story panel and three speech bubbles simultaneously; ground intake both speech bubbles and story panels; control or neutralize a district in more than three seconds.

**Wants** — climb high/mid; ground intake story panels.

**Won't** — have a turret; play multiple classes; climb low; passthrough panel scoring.

### Cycle Path

During autonomous, the plan was to quickly gain ownership of the East Foothill district by scoring a preloaded hatch panel, picking up another one, then scoring three to eight speech bubbles in that district.

During teleop, we expected the meta to shift over the season from pure scoring toward "whack-a-mole" — robots trying to steal districts from each other rather than simply filling them. Since raw speech bubble scoring is relatively inefficient, the primary lever for winning is district control. That means being able to respond fast when an opponent tries to take over your district, or to counter-cycle theirs.

<img src="/currybot/cycles.png" alt="Cycle path diagram" style="max-width:72%" />


### Archetype

We wanted to maximize speech bubble shooting without compromising panel scoring, focusing on quickly filling nearby districts. We explored options in KrayonCAD — including a version with a turret — but ultimately decided the turret wasn't worth the complexity. We referenced 1678's 2022 season, which achieved the #1 EPA in one of the most turret-heavy games in FRC history *without* a turret. Our conclusion: design minimally to stay close to the 90 lb target and reach the ceiling of what a turret-less robot can do.

<img src="/currybot/archetype-concept.png" alt="Initial KrayonCAD concept" style="max-width:72%" />

The layout we settled on: intake at the very back, shooter at the very front, thin elevator on the side. We considered a telescope with clamping fork for climbing but cut it to save weight and stay focused on cycling — fast endgames take more than eight seconds, and we could steal districts from other strong teams at the last moment instead.

For story panel pickup we went through three iterations and decided against a passthrough or multi-panel system — the weight and volume cost was too high to justify while keeping our shooter pipeline intact. We designed a wrist that grabs the nub of the panel, minimizing weight compared to a full-panel-width intake like many 2019 teams ran.

For the shooter we chose a 2021-style adjustable hood with SDS brass flywheels. For the intake and indexer we chose a four-bar for compact packaging and defense resistance, and a 254-2022-style indexer to quickly center the ball in minimal space.

## Design Process

The most important early step was setting up a well-defined master sketch from which all geometry could be derived and changed without causing integration problems downstream. We started with a side profile showing the intake, indexer, shooter, and elevator positions, then moved into highly detailed, dimensionally accurate High Fidelity Block CAD using a process inspired by Orion DeYoe's HF Block CAD method. The block CAD is deeply parametric — changes deep into development don't require redoing whole subsystems.

From the master sketch we expanded each mechanism in turn until we reached Currybot's final state, going through significant iteration on each subsystem before committing to hardware.

## Subsystems

### Drivebase

<img src="/currybot/drivebase.png" alt="Drivebase CAD" style="max-width:72%" />

SDS Mk5n modules with the R2 gear ratio were chosen for their light weight, compact packaging, and unmatched traction through the wide injection molded TPU tread. R2 made sense given that Hero Heist has somewhat long cycles without necessarily requiring rapid full-field sprints. The chassis is a 28" drivetrain (expanded to 28.5" with mounting plates) to save weight while remaining stable under extension.

Bumpers use 8033's configurable system, battle-tested in the 2025 season, made from 3/4" HDPE with closed-cell EVA foam backing.

### Intake

<img src="/currybot/intake.png" alt="Intake CAD" style="max-width:72%" />

We went with a full-width, four-bar linkage intake. Full width makes the robot harder to defend against and lets the intake collapse on itself during heavy hits rather than transferring force into the drivetrain. The arm plates are entirely SRPP — lighter than polycarb and able to absorb impacts without fracturing.

The intake pivot is driven by a Kraken X60 at 27:1 reduction. Rollers are driven by an X44 at 3:1. Roller construction: pipe insulation foam wrapped around a polycarbonate tube, finished with a layer of silicone tubing. The rollers use custom stub rollers from FRCDesignLib, inspired by WCP's stub rollers, to cut weight further.

### Elevator

<img src="/currybot/elevator.png" alt="Elevator CAD" style="max-width:72%" />

We chose a two-stage internally belted continuous elevator for its packaging. Extension is driven by two Kraken X44s on a 3.82:1 gear ratio.

The structure uses 3/8" half-pocketed aluminum crossbars joined perpendicular to each other with tube plugs — a highly rigid arrangement. One belt drives the entire elevator instead of two, which cuts both weight and the number of tension endpoints from four to two, making assembly and tensioning meaningfully easier.

Belts are tensioned by a ratchet plate: the belt is clamped to an HTD pulley driven by the ratchet plate, using 8033 idlers.

### Wrist

<img src="/currybot/wrist.png" alt="Wrist CAD" style="max-width:72%" />

The wrist on the carriage drives dead over 1" round tubing, powered by a Kraken X44 on a 60.375:1 gear ratio with a max rotation time of 0.167 seconds. A final chain reduction and a custom gearbox save weight. Interfaces are shimmed to minimize slop in the system.

Position feedback comes from a WCP Throughbore encoder belted to the same final reduction stage. This gives absolute wrist position — no need to zero on a hardstop at startup.

### Claw

<img src="/currybot/claw.png" alt="Claw CAD" style="max-width:72%" />

The claw uses one Kraken X44 to grasp the top nub of the story panel during intake from either the source or the ground. SRPP construction keeps it resilient against impacts. A 0.09" wall aluminum x-brace prevents the mechanism from parallelogramming under load. The full claw assembly, minus the motor, weighs 2.5 lb.

### Indexer

<img src="/currybot/indexer.png" alt="Indexer CAD" style="max-width:72%" />

The indexer is a pocketed 1/4" aluminum frame using WCP stub rollers to guide speech bubbles to the shooter, and can store four at once. Speech bubbles are vectored using custom polycarbonate wheels wrapped in grip tape. Three X44s drive it at a 3:1 ratio. It compresses the balls slightly — the speech bubbles are essentially the same lightweight, compressible game piece as 2021 Power Cells, which meant this approach translated cleanly.

### Shooter

<img src="/currybot/shooter.png" alt="Shooter CAD" style="max-width:72%" />

The shooter uses an active hood, driven by a 3D printed herringbone gear rack and Kraken X44 on a Z:X gear ratio. Two brass SDS flywheels provide the high moment of inertia needed for consistent velocity, paired with AM Stealth wheels in the contact zone, and custom dead-axle rollers for the back rollers. Two X44s drive the flywheels at a 2:1 ratio.

The whole assembly mounts to a carbon fiber plate and box tubing superstructure for rigidity. Extensive calculation and experimentation went into the optimal flywheel gear ratio, hood angle, moment of inertia, and wheel surface velocity — trajectory was modeled in Desmos throughout.

### Vision

<img src="/currybot/vision.png" alt="Vision — two Limelight 4 cameras" style="max-width:72%" />

One Limelight 4 is mounted on the shooter for optimal pose estimation, enabling shooting on the move. Since the shooter always faces toward the nearest AprilTag in its shooting direction, pose quality is high. A second LL4 is mounted on the elevator carriage to provide tag visibility while scoring story panels at height.

---

<img src="/currybot/full-robot.png" alt="Currybot — full robot CAD" style="max-width:82%" />

[View full Onshape document →](https://cad.onshape.com/documents/11df9b4e95bcf2428d445bf2/w/c12fe1ab07783462ba85e51b/e/a4ae7f77b60d9fdf2bbdcb5c)
