const fs = require('fs'); //File system
const path = require('path'); // path

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath); // Define path for file
    fs.unlink(filePath, err => console.log(err)); // remove file from filepath
};

exports.clearImage = clearImage; 