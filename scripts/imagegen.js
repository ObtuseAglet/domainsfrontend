function genNFT(domainName) {
    var icon = blockies.create({ // All options are optional
        seed: domainName, // seed used to generate icon data, default: random
        color: 'random', // to manually specify the icon color, default: random
        bgcolor: 'random', // choose a different background color, default: random
        size: 10, // width/height of the icon in blocks, default: 8
        scale: 8, // width/height of each block in pixels, default: 4
        spotcolor: 'random' // each pixel has a 13% chance of being of a third color,
        // default: random. Set to -1 to disable it. These "spots" create structures
        // that look like eyes, mouths and noses.
    });
    
    document.body.appendChild(icon);
}