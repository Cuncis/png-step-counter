import { Lottie } from 'lottie-react';

const WALKING_ANIMATIONS = {
    male: '/animations/boy-walking.json',
    female: '/animations/girl-walking.json',
} as const;

export default function WalkingAnimation({ gender }: { gender: string | null }) {
    const src = gender === 'female' ? WALKING_ANIMATIONS.female : WALKING_ANIMATIONS.male;

    return <Lottie src={src} className="mx-auto h-28 w-28" loop autoplay />;
}
