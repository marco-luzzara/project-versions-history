String.prototype.replaceAll = function(search, replacedString) {
    return this.split(search).join(replacedString);
}

module.exports = {

    /**
     * cast an object into the corresponding csv line
     * @param {Object} jsonObj 
     */
    castObjectToCsv: function(jsonObj) {
        let line = "";

        for (let key in jsonObj) {
            let curObjValue = jsonObj[key];

            if (typeof(curObjValue) === 'object')
                curObjValue = JSON.stringify(curObjValue);

            line += `§${curObjValue.replaceAll("§", "§|")}§,`;
        }

        return line.slice(0, -1);
    },

    /**
     * cast a single csv line into the corresponding object, given fields that corresponds to its properties
     * @param {string} line - csv line
     * @param {Array} fields - array of object properties. If the number of properties is greater than the number
     * of specified fields, the remaining properties are the index of the current propery itself. For example, with the csv line
     * first, second, third
     * and the fields ["first_field", "second_field"]
     * then the resulting object is 
     * {
     *     "first_field": "first",
     *     "second_field": "second",
     *     "2": "third"
     * } 
     * @param {Number} retrieveUntil - given that each field has an index, this parameter specifies at which index (included) 
     * the reading must stop, returning the temporary object. It is useful when you need only a part of the csv content
     */
    castCsvToObject: function(line, fields = [], retrieveUntil = undefined) {
        let resultObj = {};

        const lineChunkRegex = /§(.+?)§(?!\|)/g;
        let rgxMatch = {};
        let counter_field = 0;
        while (rgxMatch !== null) {
            rgxMatch = lineChunkRegex.exec(line);

            if (rgxMatch === null || retrieveUntil === counter_field - 1)
                break;
            
            if (fields.length <= counter_field)
                fields[counter_field] = counter_field.toString();

            let field_value = rgxMatch[1].replaceAll("§|", "§");
            try {
                resultObj[fields[counter_field]] = JSON.parse(field_value);
            }
            catch (exc) {
                resultObj[fields[counter_field]] = field_value;
            }

            counter_field++;
        }

        return resultObj;
    },

    /**
     * converts a json object to csv string. fields are delimited by '§', escaped with '§|'
     * @param {Array | string} jsonArray - array of objects or stringed array
     * @returns {string} csv content
     */
    jsonToCsvSync: function(jsonArray) {
        if (typeof(jsonArray) === 'string')
            jsonArray = JSON.parse(jsonArray);

        if (!Array.isArray(jsonArray) || jsonArray.length < 1)
            throw new Error('the json must be a non-empty array');

        let fields = Object.keys(jsonArray[0]);

        let csvArray = [this.castObjectToCsv(fields)];
        for (let jsonObj of jsonArray) {
            let csvLine = this.castObjectToCsv(jsonObj);
            csvArray.push(csvLine);
        }

        return csvArray.join("\n");
    },

    /**
     * converts a csv string to a json object. first line must contain the fields
     * @param {string} csv
     * @returns {Array} array of objects
     */
    csvToJsonSync: function(csv) {
        if (typeof(csv) !== 'string')
            throw new Error('csv parameter must be a string');

        let jsonArray = [];

        let [fields, ...lines] = csv.split("\n");
        let fieldsObject = this.castCsvToObject(fields);

        fields = Object.keys(fieldsObject).reduce((arr, key) => {
            arr[parseInt(key)] = fieldsObject[key];
            return arr;
        }, []);

        for (let line of lines) {
            let jsonObj = this.castCsvToObject(line, fields);
            jsonArray.push(jsonObj);
        }

        return jsonArray;
    }
}