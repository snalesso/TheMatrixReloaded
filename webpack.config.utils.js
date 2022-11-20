const path = require('path');

module.exports = {
    getPath(relativePath) {
        if (relativePath == null)
            return path.resolve(__dirname);
        return path.resolve(__dirname, relativePath);
    }
}