const fs = require('fs'); 

const path = require('path');  

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath); // Define path for file
    fs.unlink(filePath, err => console.log(err)); // remove file from filepath
};

exports.clearImage = clearImage; 