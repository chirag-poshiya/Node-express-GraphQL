const fs = require('fs'); //File system
const path = require('path'); // path

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath); 
    fs.unlink(filePath, err => console.log(err));
};

exports.clearImage = clearImage;