"use client";

import { ImageCarousel } from "@alvarosky/ui";

const images = [
    "/profile_images/mauro_1.png",
    "/profile_images/mauro_2.png",
    "/profile_images/mauro_3.png",
];

export default function ProfileCarousel() {
    return (
        <div className="relative h-[480px] md:h-[720px] w-full flex items-end justify-center overflow-visible">
            <ImageCarousel
                images={images}
                className="h-full w-full"
                imageClassName="object-contain object-bottom"
                priority
            />
        </div>
    );
}
