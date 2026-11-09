# BizBall moments: Higgsfield clip brief

Eight short clips, one per moment. Each replaces the drawn version in the
game when it loads in time; the drawn version stays as the fallback.

## Rules for every clip

- **Characters:** use the reference images in `docs/cast/` (one per
  character, front and side view). Original characters only. Never upload
  photos of real players, and never name a real player, club or
  competition in a prompt.
- **Kit:** our team wears green shirts with white trim, white shorts,
  green socks. Opponents wear grey. The referee wears black. No logos or
  sponsor text.
- **Format:** portrait 9:16, 1080 x 1920, 3.5 seconds (5 seconds is fine,
  I will trim), no sound, no text or captions in the video.
- **Framing:** keep the action in the middle of the frame. The top
  third gets covered by "GOAL" or "CONCEDED" from about 1.1 seconds on,
  so keep faces below it in the final shot.
- **Timing:** the game's effects are fixed to these beats.
  - Goals: the ball hits the net at about **1.1 seconds**. Hold the
    celebration until the end.
  - Concedes: the bad moment lands at about **1.15 seconds**, a second
    angry beat (a slam, a stamp) at about **1.95 seconds**.
- **Look:** night match, floodlights, rain where noted, broadcast camera
  feel, shallow depth of field on close-ups. Pick one style (stylised 3D
  animation works best with the references) and keep it for all eight.
- **File names:** save as `<name>.mp4` using the names below and drop them
  in `public/moments/`.

## The clips

### 1. thunderbolt.mp4 (goal) - The Captain
Night match, packed stadium. The Captain (armband on his left arm) runs
onto a loose ball 35 yards out and strikes it first time. Cut: the ball
rockets past a full-stretch keeper into the top corner, net bulging, at
1.1 seconds. Cut: the Captain sprints toward the camera roaring, both
fists pumping, crowd blurred and jumping behind him.

### 2. rain-slide.mp4 (goal) - The Striker
Heavy rain under floodlights. The Striker drops to his knees and slides
across the soaked pitch straight toward a low camera, spray fanning off
both knees, arms spread wide, head tilted back roaring. He stops close to
the lens at 1.1 seconds and holds the pose as rain falls.

### 3. the-slip.mp4 (concede) - The Captain
Heavy rain, a cup final, the decisive penalty. The Captain runs up; as he
plants his standing foot it slides out from under him and he lands
hard on his backside in the wet at 1.15 seconds, the ball trickling
wide. Cut: close-up, sitting in the rain, hands on his head; at 1.95
seconds he slams both fists into the turf, water splashing.

### 4. last-act.mp4 (concede) - The Maestro, the Rival, the Referee
The Rival mutters something at the Maestro's back. The Maestro stops,
turns slowly, and drives his forehead into the Rival's chest; the Rival
flies backwards onto the grass at 1.15 seconds. Cut: the Referee raises
a red card high, sharp and bright, at 1.95 seconds. Cut: the Maestro
walks slowly past a silver trophy on a plinth, head down, colour
draining from the shot.

### 5. overhead.mp4 (goal) - The Striker
A looping cross. The Striker, back to goal, leaps and flips upside down,
scissoring his legs to hit an overhead kick. Cut: the ball flies into
the top corner past a frozen keeper at 1.1 seconds. Cut: the Striker
cups both hands behind his ears toward the crowd with a smug grin.

### 6. the-chip.mp4 (goal) - The Maestro
Penalty, camera behind the taker. The keeper dives hard to one side
early; the ball floats slowly and softly down the middle into the net at
1.1 seconds. Cut: the Maestro shrugs, palms up, completely calm, a tiny
smirk.

### 7. own-goal.mp4 (concede) - The Stopper, our keeper
A high ball into our box. The Stopper (big ginger centre-back) rises
above everyone and powers a perfect header... backwards over his own
keeper into our net at 1.15 seconds. He turns, horrified. Cut: close-up,
hands on his head; at 1.95 seconds he roars in anger and slams his fists
down.

### 8. scorpion.mp4 (concede) - their keeper
Our shot loops toward goal. Their keeper dives forward, arches his back
and flicks the ball away with both heels over his head (a scorpion kick)
at 1.15 seconds, landing on his chest. Cut: close-up, he looks at the
camera with a smug smile and wags one finger "no" at 1.95 seconds.

## Wiring a clip in

Add `video: "<name>.mp4"` to that moment in `src/lib/moments.ts`. The
game plays the clip only if it starts within 300 ms, and always uses
the drawn version for people with reduced motion or data saver on.
