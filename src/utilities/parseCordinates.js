export const parseCoordinates = (parts) => {
    const coordinates = [];

    for (let i = 0; i < parts.length; i += 2) {
      coordinates.push({
        x: parseFloat(parts[i]),
        y: parseFloat(parts[i + 1]),
      });
    }

    return coordinates;
};