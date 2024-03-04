
import { list } from "./lib/list";
import * as ud from "./user_data"

//Is valid functions
test("Is valid Email, valid", () => {
    const email = "ellica.sandegren.6257@student.uu.se";
    const check = ud.isValidEmail(email);
    expect(check).toBe(true);
})
test("Is invalid Email", () => {
    const email = "ellica.sandegren.6257student.uu.se";
    const check = ud.isValidEmail(email);
    expect(check).toBe(false);
})

test("Is valid registration plate", () => {
    const reg_plate = "DLJ144";
    const check = ud.isValidRegistrationPlate(reg_plate);
    expect(check).toBe(true)
})
test("Is invalid registration plate", () => {
    const reg_plate = "DL1144";
    const check = ud.isValidRegistrationPlate(reg_plate);
    expect(check).toBe(false)
})

// Create_user function
test('Create a user, valid', () => {
    const info_string = "Ellica,Sandegren,200305170000,ellica.sandegren@gmail.com,0721466217,DLJ144"

    const create_person = ud.create_user(info_string);
    const result = {"call_id": "0721466217",
                    "car": "DLJ144",
                    "email": "ellica.sandegren@gmail.com",    
                    "id": 200305170000, 
                    "name1": "Ellica", 
                    "name2": "Sandegren"};
    expect(create_person).toEqual(result);
})

// User hashtable functions

test("Create user hashtable, valid", () => {
    const size = 10;
    const table = ud.create_user_table(size);
    expect(table).toBeDefined();
    expect(table).not.toBeNull(); 
    expect(table.size).toBe(0); //No key-value pairs added
})

test("Add user to user hashtable, valid", () => {
    const record = {
        name1: "Ellica",
        name2: "Sandegren",
        id: 200305170000,
        email: "ellica.sandegren@gmail.com",
        call_id: "0721466218",
        car: "DLJ145"
    };
    const id = record.id;
    const table = ud.create_user_table(5);
    const add = ud.add_user_to_hashtable(record, id, table);

    const foundUser = ud.find_user_record(id, table);
    expect(foundUser).toEqual(record);
})

test("Get user ID from user hashtable, valid", () => {
    const record = {
        name1: "Ellica",
        name2: "Sandegren",
        id: 200305170000,
        email: "ellica.sandegren@gmail.com",
        call_id: "0721466218",
        car: "DLJ145"
    };
    const id = ud.get_user_id(record);
    expect(id).toBe(200305170000);
})

test("Find user record from table, user found, valid", () => {
    const record = {
        name1: "Ellica",
        name2: "Sandegren",
        id: 200305170000,
        email: "ellica.sandegren@gmail.com",
        call_id: "0721466218",
        car: "DLJ145"
    };
    const id = record.id;
    const table = ud.create_user_table(5);
    const add = ud.add_user_to_hashtable(record, id, table);
    
    const user = 200305170000;
    const find_user = ud.find_user_record(user, table);
    expect(find_user).toBe(record);

})

test("Find user record from table, user not found, valid", () => {
    const record = {
        name1: "Ellica",
        name2: "Sandegren",
        id: 200305170000,
        email: "ellica.sandegren@gmail.com",
        call_id: "0721466218",
        car: "DLJ145"
    };
    const id = record.id;
    const table = ud.create_user_table(5);
    const add = ud.add_user_to_hashtable(record, id, table);
    
    const user = 199012140000;
    const find_user = ud.find_user_record(user, table);
    expect(find_user).toBe(undefined);

})

// Testing reading and loading user file.

test("Save user hashtable to external file and retrieve it again.", () => {
    const u1 = "John,Doe,198510120001,john.doe@example.com,1234567890,ABC123";
    const u2 = "Alice,Johnson,199002290002,alice.johnson@example.com,9876543210,XYZ987";
    const u3 = "Michael,Smith,197803150003,michael.smith@example.com,5556667777,PQR456";
    const u4 = "Emily,Brown,200106070004,emily.brown@example.com,1112223333,DEF789";
    const u5 = "David,Williams,199912250005,david.williams@example.com,9998887777,GHI321";

    function save_and_load(user_string: string){
        const user = ud.create_user(user_string);
        const id = ud.get_user_id(user);
        const table = ud.create_user_table(10);
        ud.add_user_to_hashtable(user, id, table);
        ud.save_user_hash_to_file("./test_saved_user_data.json", table);
        const loadedTable = ud.load_user_hashtable_from_file("./test_saved_user_data.json");
        
        const expected = JSON.parse(JSON.stringify(table).replace(/undefined/g, "null"));
        expected.probe = table.probe; // Include the probe function in the expected result
        expect(loadedTable.toString).toStrictEqual(expected.toString);
    }

    save_and_load(u1);
});

test("Load nonexisting hashtable from file, invalid", () => {
    const load = ud.load_user_hashtable_from_file("./user_data.js");
    const result = ud.create_user_table(100);
    expect(load.toString).toBe(result.toString);
})

//Fine and parkinghistory functions

test("Create a history record", () => {
    const area = "studenternas";
    const spot = "20";
    const start = "2024-02-01 10:00";
    const end = "2024-02-02 10:00";

    const record = ud.create_history_record(area, spot, start, end);
    const result = {
        area: area,
        spot: spot,
        start: start,
        end: end 
    };
    expect(record).toStrictEqual(result);
})

test("Create a fine record", () => {
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };

    const fine = ud.create_fine_record(history);
    const result = {
        info: history,
        cost: `You have a 500kr fine from parking at ${history.area}.`
    };
    expect(fine).toStrictEqual(result);

})

test("Create history fine record", () => {
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history);
    const result = {
        history: list(history),
        fine: undefined
    };
    expect(record).toStrictEqual(result);
})

test("Add history to history-fine record", () => {
    const history1 = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history1);

    const history2 = {
        area: "Grimhild",
        spot: "2",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const added = ud.add_history_to_hf_record(history2, record);
    const result = {
        history: list(history1, history2),
        fine: undefined
    };
    expect(added).toStrictEqual(result);
})

test("Create history table", () => {
    const table = ud.create_history_table(10);
    expect(table).toBeDefined();
    expect(table).not.toBeNull(); 
    expect(table.size).toBe(0); //No key-value pairs added
})

test("Find history fine record in a hashtable", () => {
    //Create and add record to table
    const user = 200305170000;
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const fine = {
        info: history,
        cost: `You have a 500kr fine from parking at ${history.area}.`
    };
    const record = {
        history: list(history),
        fine: list(fine)
    };
    const table = ud.create_history_table(10);
    ud.add_to_history_hashtable(record, user, table);

    // Results
    const find = ud.find_history_fine(user, table);
    expect(find).toStrictEqual(record);

})

test("Add history-fine record to history table", () => {
    const table = ud.create_history_table(10);
    const user = 200305170000;
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history);
    ud.add_to_history_hashtable(record, user, table);
    const result = ud.find_history_fine(user, table);
    expect(result).toEqual(record)
})

test("Add fine to history-fine record, valid", () => {
    // Create and add user history to table
    const table = ud.create_history_table(10);
    const user = 200305170000;
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history);
    ud.add_to_history_hashtable(record, user, table);
    
    // Add fine
    const fine = {
        info: history,
        cost: `You have a 500kr fine from parking at ${history.area}.`
    };
    ud.add_fine_to_hf_record(fine, user, table);

    //Find and match result
    const new_record = ud.find_history_fine(user, table);
    const result = {
        history: list(history),
        fine: list(fine)
    };
    expect(new_record).toStrictEqual(result);
});

test("Add fine to history-fine record, undefined", () => {
    // Create and add user history to table
    const table = ud.create_history_table(10);
    const user = 199012140000;
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history);
    ud.add_to_history_hashtable(record, user, table);
    
    // Add fine
    const fine = {
        info: history,
        cost: `You have a 500kr fine from parking at ${history.area}.`
    };
    ud.add_fine_to_hf_record(fine, user, table);

    //Find and match result
    const new_record = ud.find_history_fine(user, table);
    const result = {
        history: list(history),
        fine: list(fine)
    };
    expect(new_record).toStrictEqual(record);
});

test("Append fine to already existing history-fine record list, valid", () => {
    // Create and add user history to table
    const table = ud.create_history_table(10);
    const user = 200305170000;
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const history2 = {
        area: "grimhild",
        spot: "1",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history);
    ud.add_to_history_hashtable(record, user, table);
    ud.add_history_to_hf_record(history2, record);
    
    // Add fine
    const fine = {
        info: history,
        cost: `You have a 500kr fine from parking at ${history.area}.`
    };
    ud.add_fine_to_hf_record(fine, user, table);
    const fine2 = {
        info: history2,
        cost: `You have a 500kr fine from parking at ${history.area}.`
    };
    ud.add_fine_to_hf_record(fine2, user, table);

    //Find and match result
    const new_record = ud.find_history_fine(user, table);
    const result = {
        history: list(history),
        fine: list(fine, fine2)
    };
    expect(new_record).toStrictEqual(result);
});

test("Find a history-fine record in a hashtable", () => {
    // Create and add user history to table
    const table = ud.create_history_table(10);
    const user = 200305170000;
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history);
    ud.add_to_history_hashtable(record, user, table);

    const hf_record = ud.find_history_fine(user, table);
    const result = {
        history: list(history),
        fine: undefined
    };
    expect(JSON.stringify(hf_record)).toEqual(JSON.stringify(result));
})

test("Get a history record from a history-fine record", () => {
    // Create and add user history to table
    const table = ud.create_history_table(10);
    const user = 200305170000;
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history);

    const get_history = ud.get_user_history(record);
    expect(get_history).toStrictEqual(list(history));
})

test("Get a fine record from a history-fine-record", () => {
    // Create and add user history to table
    const table = ud.create_history_table(10);
    const user = 200305170000;
    const history = {
        area: "studenternas",
        spot: "20",
        start: "2024-02-01 10:00",
        end: "2024-02-02 10:00" 
    };
    const record = ud.create_history_fine_record(history);
    ud.add_to_history_hashtable(record, user, table);
    
    // Add fine
    const fine = {
        info: history,
        cost: `You have a 500kr fine from parking at ${history.area}.`
    };
    ud.add_fine_to_hf_record(fine, user, table);

    //Get fine
    const retrieved_fine = ud.get_user_fine(record);
    expect(retrieved_fine).toStrictEqual(list(fine));
})


// //Testing reading and loading history file

//  //Places to park:
//  const p1 = "Angstrom";
//  const p2 = "Centralen";
//  const p3 = "BMC";
//  const p4 = "Akademiska sjukhuset";

//  //Example history records
//  const r1: ud.history_record = {
//     area: p1,
//     spot: "31",
//     start: "2023-05-24 20:30",
//     end: "2024-05-24 20:30"
//  };
 
//  function htest1(){
//      const history = ud.create_history_record(p2, "31", "2023-05-24 20:30", "2024-05-24 20:30");
//      const record = ud.create_history_fine_record(history);
//      const id = 199012140000;
//      const table = ud.create_history_table(100);
//      ud.add_to_history_hashtable(record, id, table);
//      console.log(table);
//      //save_history_to_file("./saved_history_data.json", table);
//  }

 test("Save history hashtable to external file and retrieve it again.", () => {
    // Places to park
    const p1 = "Angstrom";
    const p2 = "Centralen";
    const p3 = "BMC";
    const p4 = "Akademiska sjukhuset";

    // Example history records
    const r1: ud.history_record = {
        area: p1,
        spot: "31",
        start: "2023-05-24 20:30",
        end: "2024-05-24 20:30"
    };

    function save_and_load_history(record: ud.history_record) {
        const id = 199012140000;
        const table = ud.create_history_table(100);
        const history = ud.create_history_fine_record(record);
        ud.add_to_history_hashtable(history, id, table);
        ud.save_history_to_file("./test_saved_history_data.json", table);
        const loadedTable = ud.load_history_from_file("./test_saved_history_data.json");

        // Adjust expected result
        const expected = JSON.parse(JSON.stringify(table).replace(/undefined/g, "null"));
        expected.probe = table.probe; // Include the probe function in the expected result

        expect(loadedTable.toString).toStrictEqual(expected.toString);
    }

    // Run the test
    save_and_load_history(r1);
});

test("Load nonexisting hashtable from file, invalid", () => {
    const load = ud.load_history_from_file("./user_data.js");
    const result = ud.create_history_table(100);
    expect(load.toString).toBe(result.toString);
})