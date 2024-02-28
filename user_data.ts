import {
    type ProbingHashtable, probe_linear, ph_empty, type HashFunction, ph_insert,
    ph_lookup, type ProbingFunction, probe_from
} from '../../lib/hashtables'
import {
    leave_spot, type ParkingTable, type Reservation, is_empty_spot
} from'./project_booking'
import {
    type List, list, pair, type Pair, append
} from '../../lib/list';
import * as fs from 'fs';
import * as ps from "prompt-sync";

const prompt: ps.Prompt = ps({ sigint: true });

//FIXA SÅ MAN EJ KAN SKRIVA bOKSTV I USERID

//Create user and user handling


type user_record  = { name1: string,
    name2: string,
    id: number, 
    email: string, 
    call_id: string,
    car: string };

/**
 * Prompts the user to write personal information: first name, last name,
 * personal ID number, email address, phone number, and car registration plate. It then 
 * concatenates the information string with each data separated 
 * by a comma.
 * @returns {string} The concatenated user information string.
 */
export function get_user_info(): string { 
    let user_first_name: string;
    let user_last_name: string;
    let person_id: number = 0;
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

    // Prompt for email adress and ensure it is
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
function isValidEmail(email: string): boolean {
    // Regular expression to validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidRegistrationPlate(reg_plate: string): boolean {
    // Regular expression to validate registration plate format
    const regPlateRegex = /^[a-zA-Z]{3}\d{3}$/;
    return regPlateRegex.test(reg_plate);
}

/**
 * Creates a user record object from the given user information string.
 * @param {string} user_info_string The string containing user information separated by commas.
 * @returns {user_record} The user record object containing the parsed user information.
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
module.exports.create_user = create_user;


//Hashtable creation and functioning

export type history_table = ProbingHashtable<number, history_fine_record>;
export type user_table = ProbingHashtable<number, user_record>;
export type user_id_number = number;

// Define your hash function
export const hash_func: HashFunction<number> = (key: number) => key;

// Use probe_linear with your hash function to create a probing function
const probingFunction: ProbingFunction<number> = probe_linear(hash_func);

/**
 * Creates an empty linear probing hashtable with a predefined size.
 * @param hashtable_size
 * @returns The empty hashtable to store user records.
 */
export function create_user_table(hashtable_size: number): ProbingHashtable<number, any> {
    const hashtable: ProbingHashtable<number, any> = ph_empty(hashtable_size, probingFunction);
    return hashtable;
}

/**
 * Finds the id in a user_record.
 * @param {user_record} user The user to to get id of.
 * @returns {user_id_number} The id of the user
 */
export function get_user_id(user: user_record): user_id_number {
    const user_id = user.id;
    return user_id;
}
module.exports.get_user_id = get_user_id;

/**
 * Adds a user to the user hashtable.
 * @param {user_record} user A user_record to be added to the hashtable.
 * @param {user_id_number} user_id The id of the person_record
 * @param {user_table} hashtable The hashtable to store user.
 * @returns {user_table} The updated user hashtable.
 */
export function add_user_to_hashtable(user: user_record, 
                                user_id: user_id_number, 
                                hashtable: user_table): user_table {
    const insert_user = ph_insert(hashtable, user_id, user);
    return hashtable;
}
module.exports.add_user_to_hashtable = add_user_to_hashtable;

/**
 * Creates a user and then adds it to an already existing hashtable
 * @param {user_table} hashtable A alreade created hashtable to store user_records
 * @return void.
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
export function find_user_record(user: user_id_number, table: user_table): user_record | undefined {
    const record = ph_lookup(table, user);
    return record;
}


//Save and load user data from saved_user_data.ts file


const user_file: string = "./saved_user_data.json";
/**
 * Serializes a hashingtable into string and saves it to an additional file.
 * @param {string} file The file to save the user hashingtable to.
 * @param {user_table} hashtable The hashtable containing user data.
 * @returns {void} 
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
 * Test if data was retrieved correctly, otherwise returns empty hashtable
 * together with error message.
 * @param {string} file The file containing the serialized hashtable.
 * @returns {ProbingHashtable} A probing hashtable that contains the user records.
 */
export function load_user_hashtable_from_file(file: string): user_table {
    // Read the serialized data from the file
    const serialized_hashtable = fs.readFileSync(file, 'utf-8');

    // Parse the serialized data
    const hashtableWithoutProbe = JSON.parse(serialized_hashtable);

    // Reattach the probe function
    const hashtable: user_table = { ...hashtableWithoutProbe, probe: probe_linear(hash_func) };
    
    return hashtable;
}

// Fine and parking history management


export type history_record = {
    area: string,
    spot: string,
    start: Date | string,
    end: Date | string
}

export type fine_record = {
    info: history_record,
    cost: string
}

export type history_fine_record = {
    history: List<history_record>,
    fine?: List<fine_record>
}

/**
 * Creates a history record with information about parking area, spot, start time, and end time.
 * @param area The parking area.
 * @param spot The parking spot.
 * @param start The start time of parking.
 * @param end The end time of parking.
 * @returns The history record.
 */
export function create_history_record(area: string, spot: string, start: Date, end: Date): history_record {
    const record = {
        area: area,
        spot: spot,
        start: start,
        end: end 
    }
    return record;
}

/**
 * Creates a fine record based on a history record.
 * @param record The history record associated with the fine.
 * @returns The fine record.
 */
export function create_fine_record(record: history_record): fine_record {
    const result = {
        info: record,
        cost: "You have a 500kr fine from parking at ${record.area}."
    }
    return result;
}


/**
 * Creates a history fine record combining history and fine information.
 * @param history The history record.
 * @param fine The fine record (optional).
 * @returns The history fine record.
 */
export function create_history_fine_record(area: string, spot: string, start: Date, end: Date): history_fine_record {
    const history = create_history_record(area, spot, start, end);
    const fine = create_fine_record(history)
    
    const record: history_fine_record = {
        history: list(history),
        fine: fine ? list(fine) : undefined
    } 
    return record;
}

/**
 * Adds a history record to a history fine record.
 * @param history The history record to be added.
 * @param hf_record The existing history fine record.
 * @returns The updated history fine record.
 */
export function add_history_to_hf_record(history: history_record, hf_record: history_fine_record): history_fine_record {
    const updatedHistory = append(hf_record.history, list(history));
    return {
        ...hf_record,
        history: updatedHistory,
    };
}

/**
 * Adds a fine record to a history fine record.
 * @param fine The fine record to be added.
 * @param hf_record The existing history fine record.
 * @returns The updated history fine record.
 */
export function add_fine_to_hf_table(fine: fine_record, user: user_id_number, hf_record: history_fine_record) {
    if (hf_record.fine === undefined) {
        return hf_record.fine = list(fine);
    } else {
        return hf_record.fine = append(hf_record.fine, list(fine));
    }
}

/**
 * Creates a parking history user table.
 * @param hashtable_size The size of the hashtable.
 * @returns The created history table.
 */
export function create_history_table(hashtable_size: number): history_table {
    const hashtable: history_table = ph_empty(hashtable_size, probe_linear(hash_func));
    return hashtable;
} 

/**
 * Adds a history fine record to a history table.
 * @param record The history fine record to be added.
 * @param user_id The user ID associated with the record.
 * @param hashtable The history table.
 * @returns The updated history table.
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
 * @returns {history_fine_record} The record containing history records and fine records
 */
export function find_history_fine(user: user_id_number, table: history_table): history_fine_record | undefined {
    const record = ph_lookup(table, user);
    return record;
}

/**
 *  Retrieves the history of a history fine record.
 * @param {history_fine_record} record the users history-fine record.
 * @returns {List<history_record>} a list of history records.
 */
export function get_user_history(record: history_fine_record): List<history_record> | undefined {
    const history = record.history;
    return history;
}

/**
 * Retrieves the fines of a history fine record.
 * @param {history_fine_record} record the users history-fine record.
 * @returns {List<fine_record> | undefined} a list of fine_records or undefined if not found.
 */
export function get_user_fine_history(record: history_fine_record): List<fine_record> | undefined {
    const fine = record.fine;
    return fine;
}

/**
 * Checks if parking time is over for a user at a specific spot.
 * @param parking_table The parking table.
 * @param user_id The user ID.
 * @param spot The parking spot.
 * @returns True if parking time is over, false otherwise.
 */
export function is_parking_over(parking_table: ParkingTable, user_id: user_id_number, spot: number): boolean {
    return is_empty_spot(parking_table, spot) ? false : true
}

export const history_file = 'saved_history.json'
 
/**
 * Serializes a hashingtable into string and saves it to an additional file.
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
 * @param {string} file The file containing the serialized hashtable.
 * @returns {ProbingHashtable} A probing hashtable that contains the user records.
 */
export function load_history_from_file(file: string): history_table {
    try {
        const serialized_hashtable = fs.readFileSync(file, 'utf-8');
        return JSON.parse(serialized_hashtable);
    } catch (error) {
        console.error('Error loading hashtable', error); 
        const size = 10
        return ph_empty(size, probe_linear(hash_func));
    }
}
