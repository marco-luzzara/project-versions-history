const fs = require("fs");

module.exports = {
    /**
     * get file size
     * @param {string | Buffer | URL} path 
     * @param {Object} options 
     * @returns {fs.Stats}
     */
    getFileSize: function(path, options) {
        return new Promise((resolve, reject) => {
            fs.stat(path, options, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    },

    readFile: function(path, options) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, options, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    },

    writeFile: function(path, data, options) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, options, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },

    appendFile: function(path, data, options) {
        return new Promise((resolve, reject) => {
            fs.appendFile(path, data, options, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },

    // taken from https://www.npmjs.com/package/read-last-lines
	/**
	 * Read in the last `n` lines of a file
	 * @param  {string}   input_file_path - file (direct or relative path to file.)
	 * @param  {int}      maxLineCount    - max number of lines to read in.
	 * @param  {encoding} encoding        - specifies the character encoding to be used, or 'buffer'. defaults to 'utf8'.
	 *
	 * @return {Array} lines
	 */
	// readLastlinesSync: function(input_file_path, maxLineCount, encoding) {

	// 	const NEW_LINE_CHARACTERS = ["\n"];

	// 	if (encoding == null)
	// 		encoding = "utf8";

	// 	const readPreviousChar = function( stat, file, currentCharacterCount) {
	// 		let bytesReadAndBuffer = fs.readSync(file, Buffer.alloc(1), 0, 1, stat.size - 1 - currentCharacterCount);
    //         return String.fromCharCode(bytesReadAndBuffer[1][0]);
	// 	};

    //     let self = {
    //         stat: null,
    //         file: null,
    //     };

    //     if (!fs.existsSync(input_file_path))
    //         throw new Error("file does not exist");

    //     try {
    //         self.stat = fs.statSync(input_file_path);
    //         self.file = fs.openSync(input_file_path, "r");
    
    //         let chars = 0;
    //         let lineCount = 0;
    //         let lines = "";
    
    //         const do_while_loop = function() {
    //             if (lines.length > self.stat.size) {
    //                 lines = lines.substring(lines.length - self.stat.size);
    //             }
    
    //             if (lines.length >= self.stat.size || lineCount >= maxLineCount) {
    //                 if (NEW_LINE_CHARACTERS.includes(lines.substring(0, 1))) {
    //                     lines = lines.substring(1);
    //                 }
    
    //                 fs.closeSync(self.file);
    
    //                 if (encoding === "buffer") {
    //                     return Buffer.from(lines, "binary");
    //                 }
    
    //                 return Buffer.from(lines, "binary").toString(encoding);
    //             }
    
    //             let nextCharacter = readPreviousChar(self.stat, self.file, chars);
    //             lines = nextCharacter + lines;
    
    //             if (NEW_LINE_CHARACTERS.includes(nextCharacter) && lines.length > 1) {
    //                 lineCount++;
    //             }
    //             chars++;
    
    //             return do_while_loop();
    //         };
    
    //         return do_while_loop();
    //     }
    //     catch (exc) {
    //         if (self.file !== null) 
    //             fs.closeSync(self.file);

    //         throw exc;
    //     }
	// }
};