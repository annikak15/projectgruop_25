import {
    type ProbingHashtable, probe_linear, ph_empty, type HashFunction, ph_insert,
    ph_lookup, type ProbingFunction, probe_from
} from './lib/hashtables'
import {
    type List, list, pair, type Pair, append
} from './lib/list';
import * as fs from 'fs';
const ps = require("prompt-sync");
const prompt = ps({ sigint: true });


//Create user and user handling

/**
 * A {user_id_number} is a number.
 * It represents the personal ID number of a user.
 * @invariant the number is 12 digits and non-negative.
 * 
 * Examples:
 * Valid:
 * Correct format and type.
 * 200101010000
 * 
 * Borderline:
 * Not 12 digits, but of right type.
 * 0101010000
 * 
 * Invalid:
 * Wrong type.
 * "200101010000"
 * 
 */
export type user_id_number = number;

/**
 * A {user_record} is record.
 * It represents a collection of personal information about the user:
 * @param {string} name1 the first name of a user
 * @param {string} name2 the last name of a user
 * @param {user_id_number} id the personal ID of a user
 * @param {string} email the email of a user
 * @param {string} call_id the phone number of a user
 * @param {string} car the car registration plate
 * @invariant id must be unique for every user
 * 
 * Examples:
 * Valid:
 * All parameters are correct format and of correct type
 * { name1: "Ellica",
    name2: "Sandegren",
    id: 200305170000, 
    email: "ellica.sandegren.6257@student.grillska.se", 
    call_id: "0721466218",
    car: "DLJ145" };
 * 
 * Borderline:
 * id is the same as another person.
 * User Anna Karlsson has id 199012140000
 * { name1: "Ellica",
    name2: "Sandegren",
    id: 199012140000, 
    email: "ellica.sandegren.6257@student.grillska.se", 
    call_id: "0721466218",
    car: "DLJ145" };
 * 
 * Invalid:
 * Param is of wrong type
 * { name1: "Ellica",
    name2: "Sandegren",
    id: "200305170000", 
    email: "ellica.sandegren.6257@student.grillska.se", 
    call_id: "0721466218",
    car: "DLJ145" };
 * 
 */
type user_record  = { name1: string,
    name2: string,
    id: user_id_number, 
    email: string, 
    call_id: string,
    car: string };

/**
 * Prompts the user to write personal information: first name, last name,
 * personal ID number, email address, phone number, and car registration plate.
 * After each prompt, it checks that the input is of correct format, otherwise promts
 * the user again. It then concatenates all the information into a single string
 * with each data separated by a comma.
 * @returns {string} The concatenated user information string.
 */
export function get_user_info(): string { 
    let user_first_name: string;
    let user_last_name: string;
    let person_id: user_id_number = 0;
    let email_adress: string;
    let phone_number: number = 0;
    let reg_plate: string;

    // Prompt for first name and ensure it's not empty
    do {
        user_first_name = prompt("Enter first name: ");
        if (!user_first_name) {
            console.log("First name cannot be empty. Please enter your first name.");
        }
    } while (!user_first_name);

    // Prompt for last name and ensure it's not empty
    do {
        user_last_name = prompt("Enter last name: ");
        if (!user_last_name) {
            console.log("Last name cannot be empty. Please enter your last name.");
        }
    } while (!user_last_name);

    // Prompt for personal ID number and ensure it's a valid number
    do { 
        const person_id_input = prompt("Enter personal id-number: ");
        // Ensure the input consists only of digits
        if (!/^\d+$/.test(person_id_input)) {
            console.log("Invalid input for personal ID. Please enter a valid number.");
        }
        person_id = parseInt(person_id_input);
    } while (isNaN(person_id!));

    // Prompt for email adress and ensure it is of correct format
    do {
        email_adress = prompt("Enter email adress: ");
        if (!isValidEmail(email_adress)) {
            console.log("Invalid email address. Please enter a valid email.");
        }
    } while (!isValidEmail(email_adress));

    // Prompt for phone number and ensure it's a valid number
    do {
        const phone_number_input = prompt("Enter phone number: ");
        // Ensure the input consists only of digits
        if (!/^\d+$/.test(phone_number_input)) {
            console.log("Invalid input for phone number. Please enter a valid number.");
        }
        phone_number = parseInt(phone_number_input);
    } while (isNaN(phone_number));

    // Prompt for car registration plate and ensure it's in the format "aaa000"
    do {
        reg_plate = prompt("Enter car registration plate (format: aaa000): ");
        if (!isValidRegistrationPlate(reg_plate)) {
            console.log("Invalid registration plate format. Please enter a valid plate.");
        }
    } while (!isValidRegistrationPlate(reg_plate));

    const user_string = user_first_name + ","
                     + user_last_name + "," 
                     + person_id + "," 
                     + email_adress + "," 
                     + phone_number + "," 
                     + reg_plate;

    return user_string;
}

/**
 * Checks if an email address is valid.
 * @param {string} email The email address to validate.
 * @returns {boolean} True if the email address is valid, false otherwise.
 */
export function isValidEmail(email: string): boolean {
    // Regular expressions to validate email address
    const email_check = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email_check.test(email);
}

/**
 * Checks if a registration plate is valid in format "ABC123".
 * @param {string} reg_plate the registration plate to validate
 * @returns {boolean} true if the reg plate is valid, false otherwise
 */
export function isValidRegistrationPlate(reg_plate: string): boolean {
    // Regular expression to validate registration plate format
    const reg_check = /^[a-zA-Z]{3}\d{3}$/;
    return reg_check.test(reg_plate);
}

/**
 * Creates a user record object from the given user information string.
 * @param {string} user_info_string The string containing user information.
 * @returns {user_record} The user record containing the parsed user information.
 * @precondition the string is a concatenated user string from get_user_info function.
 */
export function create_user(user_info_string: string): user_record { 

    const split_string = user_info_string.split(",");
    const first_name: string = split_string[0];
    const last_name: string = split_string[1];
    const person_id: string = split_string[2];
    const email_adress: string = split_string[3];
    const phone_number: string = split_string[4];
    const reg_plate: string = split_string[5];

    const user: user_record = {
        name1: first_name,
        name2: last_name,
        id: +person_id,
        email: email_adress,
        call_id: phone_number,
        car: reg_plate
    } 
    return user;
}

//Hashtable creation and functioning

/**
 * A {history_table} is a ProbingHashtable<user_id_number, history_fine_record> where:
 * @template user_id_number The type of the key used in the hashtable.
 * @template history_fine_record The type of the value associated with each key in the hashtable.
 */
export type history_table = ProbingHashtable<user_id_number, history_fine_record>;

/**
 * A {user_table} is a ProbingHashtable<user_id_number, user_record> where:
 * @template user_id_number The type of the key used in the hashtable.
 * @template user_record The type of the value associated with each key in the hashtable.
 */
export type user_table = ProbingHashtable<user_id_number, user_record>;


/**
 * The hash function used for hashing keys of type user_id_number.
 * @template user_id_number The type of keys to be hashed.
 * @param key The key to be hashed.
 * @returns The hashed value of the key.
 */
export const hash_func: HashFunction<user_id_number> = (key: user_id_number) => key;
/**
 * The probing function used with linear probing, based on the provided hash function hash_func.
 * @template user_id_number The type of keys in the hashtable.
 * @param key The key for probing.
 */
export const probingFunction: ProbingFunction<user_id_number> = probe_linear(hash_func);

/**
 * Creates an empty linear probing hashtable with a predefined size.
 * @param {number} hashtable_size the size of the hashtable.
 * @precondition hashtable_size is a positive number.
 * @returns {user_record} The empty hashtable to store user records.
 */
export function create_user_table(hashtable_size: number):
                                 ProbingHashtable<user_id_number, user_record> {
    const hashtable: ProbingHashtable<user_id_number, user_record> = ph_empty(hashtable_size,
                                                                    probingFunction);
    return hashtable;
}

/**
 * Finds the id in a user_record.
 * @param {user_record} user The user to to get ID of.
 * @returns {user_id_number} The id of the user.
 */
export function get_user_id(user: user_record): user_id_number {
    const user_id = user.id;
    return user_id;
}

/**
 * Adds a user to the user hashtable.
 * @param {user_record} record A user_record to be added to the hashtable.
 * @param {user_id_number} user_id The id of the person_record
 * @param {user_table} hashtable The hashtable to store user.
 * @returns {user_table} The updated user hashtable.
 */
export function add_user_to_hashtable(record: user_record, 
                                user_id: user_id_number, 
                                hashtable: user_table): user_table {
    const insert_user = ph_insert(hashtable, user_id, record);
    return hashtable;
}

/**
 * Creates a user and then adds it to an user hashtable
 * @param {user_table} hashtable the hashtable to store user_records
 * @returns {user_record} the newly created user_record
 */
export function create_and_add_user_to_table(hashtable: user_table): user_record {
    const user_string = get_user_info();
    const user = create_user(user_string);
    const user_id_number = get_user_id(user);
    add_user_to_hashtable(user, user_id_number, hashtable);
    return user;
}

/**
 * Finds a user record in a user table, using the user id number.
 * @param {user_id_number} user The users personal id number 
 * @param {user_table} table The hashtable that stores user records.
 * @returns {user_record | undefined} the user record or undefined if no match is found.
 */
export function find_user_record(user: user_id_number,
                                 table: user_table): user_record | undefined {
    const record = ph_lookup(table, user);
    return record;
}


//Save and load user data from saved_user_data.ts file

/**
 * The file that stores a serialized user data hashtable.
 */
const user_file: string = "./saved_user_data.json";

/**
 * Serializes a hashingtable into string and saves it to an additional file.
 * @param {string} file The file to save the user hashingtable to.
 * @param {user_table} hashtable The hashtable containing user data.
 * @modifies the file by overwriting the original file.
 */
export function save_user_hash_to_file(file: string, hashtable: user_table): void {
    // Remove the probe function before serialization
    const { probe, ...hashtableWithoutProbe } = hashtable;

    // Serialize the hashtable without the probe function
    const serialized_hashtable = JSON.stringify(hashtableWithoutProbe);

    // Write the serialized data to the file
    fs.writeFileSync(file, serialized_hashtable);
}

/**
 * Deserializes a stringified probing hashtable in an external file.
 * Tests if data was retrieved correctly, otherwise returns empty hashtable
 * together with error message.
 * @param {string} file The file containing the serialized hashtable.
 * @returns {user_table} a user table containing the user records.
 */
export function load_user_hashtable_from_file(file: string): user_table {
    try{
        // Read the serialized data from the file
        const serialized_hashtable = fs.readFileSync(file, 'utf-8');

        // Parse the serialized data
        const hashtableWithoutProbe = JSON.parse(serialized_hashtable);

        // Reattach the probe function
        const hashtable: user_table = { ...hashtableWithoutProbe, 
                                        probe: probe_linear(hash_func) };
        
        return hashtable;
    } catch (error) {
        console.error('Error loading hashtable', error); 
        return create_user_table(100);
    }
}


// Fine and parking history management

/**
 * A {history_record} is a record.
 * It represents the history of a users parkings. 
 * @param {string} area the name of the parking lot
 * @param {string} spot the number of the parking spot in the parking lot
 * @param {Date | string} start the start date and time of parking
 * @param {Date | string} end the end date and time of parking.
 * @invariant the area is an existing parking lot in the ParkingTable
 * @invariant the spot is an existing spot in the ParkingTable
 * 
 * Examples:
 * Valid:
 * Existing area and spot is used
 * {
    area: "studenternas",
    spot: "1",
    start: "2023-05-12T08:30:00.000Z",
    end: "2024-04-23T08:20:00.000Z"
    }
 * 
 * Borderline:
 * Nonexisting area.
 * {
    area: "stockholm",
    spot: "1",
    start: "2023-05-12T08:30:00.000Z",
    end: "2024-04-23T08:20:00.000Z"
    }
 * 
 * Invalid:
 * Wrong types and format
 * {
    area: "studenternas",
    spot: 1,
    start: 2023-05-12 8:30,
    end: "2024-04-23T08:20:00.000Z"
    }
 * 
 */
export type history_record = {
    area: string,
    spot: string,
    start: Date | string,
    end: Date | string
}

/**
 * A {fine_record} represents a fine issued for a parking violation.
 * It contains information about the parking violation as well as the associated
 * cost of the fine.
 * @param {history_record} info The history record associated with the fine.
 * @param {string} cost The cost of the fine.
 * 
 * Examples:
 * Valid:
 * {
 *   info: {
 *     area: "studenternas",
 *     spot: "1000",
 *     start: "2023-05-12T08:30:00.000Z",
 *     end: "2024-04-23T08:20:00.000Z"
 *   },
 *   cost: "500 SEK"
 * }
 * 
 * Borderline:
 * {
 *   info: {
 *     area: "stockholm",
 *     spot: "1",
 *     start: "2023-05-12T08:30:00.000Z",
 *     end: "2024-04-23T08:20:00.000Z"
 *   },
 *   cost: "1000 SEK"
 * }
 * 
 * Invalid:
 * {
 *   info: {
 *     area: "studenternas",
 *     spot: "1",
 *     start: "2023-05-12T08:30:00.000Z",
 *     end: "2024-04-23T08:20:00.000Z"
 *   },
 *   cost: "NaN"
 * }
 */

export type fine_record = {
    info: history_record,
    cost: string
}

/**
 * A {history_fine_record} represents the history and fine records associated
 * with a user's parking activity. It contains a list of historical parking
 * records and, optionally, a list of fine records.
 * @param {List<history_record>} history A list of historical parking records.
 * @param {List<fine_record> | undefined} fine (Optional) A list of fine records.
 * 
 * Examples:
 * Valid:
 * {
 *   history: [
 *     {
 *       area: "studenternas",
 *       spot: "1",
 *       start: "2023-05-12T08:30:00.000Z",
 *       end: "2024-04-23T08:20:00.000Z"
 *     },
 *     {
 *       area: "studenternas",
 *       spot: "2",
 *       start: "2023-05-14T09:00:00.000Z",
 *       end: "2024-04-24T09:00:00.000Z"
 *     }
 *   ],
 *   fine: [
 *     {
 *       info: {
 *         area: "studenternas",
 *         spot: "1",
 *         start: "2023-05-12T08:30:00.000Z",
 *         end: "2024-04-23T08:20:00.000Z"
 *       },
 *       cost: "500 SEK"
 *     }
 *   ]
 * }
 * 
 * Borderline:
 * {
 *   history: [
 *     {
 *       area: "studenternas",
 *       spot: "1",
 *       start: "2023-05-12T08:30:00.000Z",
 *       end: "2024-04-23T08:20:00.000Z"
 *     },
 *     {
 *       area: "studenternas",
 *       spot: "2",
 *       start: "2023-05-14T09:00:00.000Z",
 *       end: "2024-04-24T09:00:00.000Z"
 *     }
 *   ],
 *   fine: []
 * }
 * 
 * Invalid:
 * {
 *   history: [
 *     {
 *       area: "studenternas",
 *       spot: "1",
 *       start: "2023-05-12T08:30:00.000Z",
 *       end: "2024-04-23T08:20:00.000Z"
 *     },
 *     {
 *       area: "studenternas",
 *       spot: "2",
 *       start: "2023-05-14T09:00:00.000Z",
 *       end: "2024-04-24T09:00:00.000Z"
 *     }
 *   ],
 *   fine: [
 *     {
 *       info: {
 *         area: "studenternas",
 *         spot: "1",
 *         start: "2023-05-12T08:30:00.000Z",
 *         end: "2024-04-23T08:20:00.000Z"
 *       },
 *       cost: "NaN"
 *     }
 *   ]
 * }
 */
export type history_fine_record = {
    history: List<history_record>,
    fine?: List<fine_record>
}

/**
 * Creates a history record with information about parking area, spot,
 * start time, and end time.
 * @param {string} area The parking area.
 * @param {string} spot The parking spot.
 * @param {Date | string} start The start time of parking.
 * @param {Date | string} end The end time of parking.
 * @returns {history_record} The history record.
 */
export function create_history_record(area: string,
                                    spot: string, 
                                    start: Date | string, 
                                    end: Date | string): history_record {
    const record = {
        area: area,
        spot: spot,
        start: start,
        end: end 
    };
    return record;
}

/**
 * Creates a fine record based on a history record.
 * @param {history_record} record The history record associated with to fine.
 * @returns {fine_record} The fine record.
 */
export function create_fine_record(record: history_record): fine_record {
    const result = {
        info: record,
        cost: `You have a 500kr fine from parking at ${record.area}.`
    };
    return result;
}

/**
 * Creates a history fine record combining history and fine information.
 * @param {history_record} history The history record.
 * @returns {history_fine_record} The history fine record.
 */
export function create_history_fine_record(history: history_record): history_fine_record {
    //const fine = create_fine_record(history)
    const record: history_fine_record = {
        history: list(history),
        fine: undefined
        //fine: fine ? list(fine) : undefined
    };
    return record;
}

/**
 * Adds a history record to a history fine record.
 * @param {history_record} history The history record to be added.
 * @param {history_fine_record} hf_record The existing history fine record to add onto.
 * @returns {history_fine_record} The updated history fine record.
 */
export function add_history_to_hf_record(history: history_record,
                                        hf_record: history_fine_record): history_fine_record {
    const updatedHistory = append(hf_record.history, list(history));
    return {
        ...hf_record,
        history: updatedHistory,
    };
}

/**
 * Adds a fine record to a history fine record.
 * @param {fine_record} fine The fine record to be added.
 * @param {user_id_number} user The user to recieve the fine.
 * @param {history_table} table The table to find history-fine records.
 * @returns {void} Modifies the history table.
 */
export function add_fine_to_hf_record(fine: fine_record,
                                    user: user_id_number,
                                    table: history_table): void {
    const record = find_history_fine(user, table);
    if (record === undefined) {
        console.log("No parking history associated to user.");
        console.log("Could not send fine.");
    } else {
        if (record.fine === undefined) {
            record.fine = list(fine);
        } else {
            record.fine = append(record.fine, list(fine));
        }
        console.log("Fine sent to user.");
    }
}

/**
 * Creates a parking history user table.
 * @param {number} hashtable_size The size of the hashtable.
 * @returns {history_table} The created history table.
 */
export function create_history_table(hashtable_size: number): history_table {
    const hashtable: history_table = ph_empty(hashtable_size, probe_linear(hash_func));
    return hashtable;
} 

/**
 * Adds a history fine record to a history table.
 * @param {history_fine_record} record The history fine record to be added.
 * @param {user_id_number} user_id The user associated with the record.
 * @param {history_table} hashtable The history table to add record onto.
 * @returns {history_table} The updated history table.
 */
export function add_to_history_hashtable(record: history_fine_record, 
                                        user_id: user_id_number, 
                                        hashtable: history_table): history_table {
    const insert = ph_insert(hashtable, user_id, record);
    return hashtable;
}

/**
 * Finds a users history-fine record in a history table
 * @param {user_id_number} user The users personal id number
 * @param {history_table} table The hashtable containing history-fine records
 * @returns {history_fine_record | undefined} The record containing history
 * records and fine records
 * or undefined if not found.
 */
export function find_history_fine(user: user_id_number,
                                table: history_table): history_fine_record | undefined {
    const record = ph_lookup(table, user);
    return record;
}

/**
 * Retrieves the history of a history fine record.
 * @param {history_fine_record} record the users history-fine record.
 * @returns {List<history_record> | undefined} a list of history records
 * or undefined if not found.
 */
export function get_user_history(record: history_fine_record): 
                                List<history_record> | undefined {
    const history = record.history;
    return history;
}

/**
 * Retrieves the fines of a history fine record.
 * @param {history_fine_record} record the users history-fine record.
 * @returns {List<fine_record> | undefined} a list of fine_records or
 * undefined if not found.
 */
export function get_user_fine(record: history_fine_record): 
                                    List<fine_record> | undefined {
    const fine = record.fine;
    return fine;
}

/**
 * The file that contains serialized history data.
 */
export const history_file = './saved_history_data.json'

/**
 * Serializes a hashingtable into string and saves it to an additional
 * file without its probing function.
 * @param {string} file The file to save the user hashingtable to.
 * @param {user_table} hashtable The hashtable containing user data.
 * @returns {void} 
 */
export function save_history_to_file(file: string, hashtable: history_table ): void {
    const serialized_hashtable = JSON.stringify(hashtable);
    fs.writeFileSync(file, serialized_hashtable);
}

/**
 * Deserializes a stringified probing hashtable in an external file.
 * Test if data was retrieved correctly, otherwise returns empty hashtable
 * together with error message.
 * Adds the probing function.
 * @param {string} file The file containing the serialized hashtable.
 * @precondition The hashtable must need a probing hashing function.
 * @returns {history_table} The history hashtable that contains the user records.
 */
export function load_history_from_file(file: string): history_table {
    try {
        const serialized_hashtable = fs.readFileSync(file, 'utf-8');
        const hashtableWithoutProbe = JSON.parse(serialized_hashtable);
        const hashtable: history_table = { ...hashtableWithoutProbe,
                                         probe: probe_linear(hash_func)};
        return hashtable;
    } catch (error) {
        console.error('Error loading hashtable', error); 
        return create_history_table(100);
    }
}