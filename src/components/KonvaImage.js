import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Image } from 'react-konva';

export const KonvaImage = ({ image, imageWidth = 447, imageHeight = 447, isPreview }) => {
    const [konvaImage, setKonvaImage] = useState(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = isPreview ? image.thumbnailUrl : image.photoUrl;
        img.onload = () => {
            setKonvaImage(img);
        }
    }, [image.photoUrl]);

    return (
        <div>
            {konvaImage ? (
                <Stage width={imageWidth} height={imageHeight}>
                    <Layer>
                        <Image image={konvaImage} width={imageWidth} height={imageHeight} />
                        {image.coords?.map((coord, index) => (
                            <Line 
                                key={index}
                                points={coord.flatMap(({ x, y }) => [x * imageWidth, y * imageHeight])} 
                                stroke="yellow" 
                                strokeWidth={2}
                                lineCap="round"
                                lineJoin="round"
                            />
                        ))}
                    </Layer>
                </Stage>
            ): null}
        </div>
    );
}