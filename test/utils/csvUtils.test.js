const csvjson = require('../../utils/csvUtils');

const JSON_1 = [
    {
        "version": "1.2.3",
        "tasks" : [
            {
                "id":"taskId2",
                "messages":[
                    "mex5",
                    "mex6",
                    "mex7"
                ]
            },
            {
                "id":"taskId3",
                "messages":[
                    "mex5",
                    "mex6",
                    "mex7"
                ]
            }
        ]
    }
];

const JSON_2 = [
    {
        "version": "1.2.3",
        "tasks" : [1,2,3]
    },
    {
        "version": "1.2.4",
        "tasks" : [1,2,4]
    }
];

const JSON_3 = [
    {
        "version": "1.2.3",
        "tasks" : [
            {
                "id":"taskId2",
                "messages":[
                    "mex5",
                    "mex6",
                    "mex7"
                ]
            }
        ]
    },
    {
        "version": "1.2.4",
        "tasks" : [
            {
                "id":"taskId4",
                "messages":[
                    "mex5",
                    "mex6",
                    "mex8"
                ]
            }
        ]
    }
];

const JSON_4 = [
    {
        "pr,§|,op1": "§|1.2§|.3§|",
        "§prop2§|": "|§|",
        "|prop3, §": "|",
        ", §prop4 ,§": "§"
    }
];

function testCsvJsonConverter(json) {
    let csv = csvjson.jsonToCsvSync(json);
    let resultJson = csvjson.csvToJsonSync(csv);

    expect(resultJson).toEqual(json);
}

test('jsontocsv -> csvtojson JSON 1, should return the same json at the start', () => {
    testCsvJsonConverter(JSON_1);
});

test('jsontocsv -> csvtojson JSON 2, should return the same json at the start', () => {
    testCsvJsonConverter(JSON_2);
});

test('jsontocsv -> csvtojson JSON 3, should return the same json at the start', () => {
    testCsvJsonConverter(JSON_3);
});

test('jsontocsv -> csvtojson JSON 4, should return the same json at the start', () => {
    testCsvJsonConverter(JSON_4);
});