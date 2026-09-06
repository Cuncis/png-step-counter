import { Lottie } from 'lottie-react';

const WALKING_ANIMATIONS = {
    male: '/animations/boy-walking.json',
    female: '/animations/girl-walking.json',
} as const;

// The trailing leg/arm on both files is authored with an After Effects
// `loopOutDuration('cycle', 0)` expression: it only has keyframes for the
// first half of the stride and relies on that expression to keep cycling
// afterwards. `LottieLight` strips the expression engine to save bundle
// size, so that limb froze at its last keyframe and snapped back on every
// loop. The full `Lottie` build evaluates expressions, so it keeps cycling
// smoothly instead.
//
// The last frame (40) also exactly duplicates frame 0 on the properties that
// are fully keyframed, so trimming the segment to end one frame early avoids
// rendering that pose twice in a row at the seam.
const LOOP_SEGMENT = [0, 39] as const;

export default function WalkingAnimation({ gender }: { gender: string | null }) {
    const src = gender === 'female' ? WALKING_ANIMATIONS.female : WALKING_ANIMATIONS.male;

    return <Lottie src={src} className="mx-auto h-44 w-44" loop autoplay segment={LOOP_SEGMENT} />;
}
