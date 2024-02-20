import {
    type ProbingHashtable, probe_linear, ph_empty, type HashFunction, ph_insert
} from './hashtables'

import * as fs from 'fs';


//Create user


type user_record  = { name1: string,
    name2: string,
    id: number, 
    email: string, 
    call_id: string,
    car: string };

/**
 * Prompts the user to input information to store: first name, last name,
 * personal ID number, email address, phone number, and car registration plate. It then 
 * concatenates these pieces of information into a single string where each part is separated 
 * by a comma, and returns this concatenated string.
 * @returns {string} The concatenated user information string.
 */
export function get_user_info(): string { 
    const user_first_name = prompt("Enter first name: ");
    const user_last_name = prompt("Enter last name: ");
    const person_id = prompt("Enter personal id-number: ");
    const email_adress = prompt("Enter email adress: ");
    const phone_number = prompt("Enter phone number: ");
    const reg_plate = prompt("Enter car registration plate: ");

    const user_string = user_first_name + ","
                     + user_last_name + "," 
                     + person_id + "," 
                     + email_adress + "," 
                     + phone_number + "," 
                     + reg_plate;

    return user_string;
//Skapa test så att det även funkar med 0 först i telefonnummer
}
module.exports.get_user_info = get_user_info;

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

type user_table = ProbingHashtable<number, user_record>;
type user_id_number = number;
const user_hashtable_size: number = 10;
const hash_func : HashFunction<number> = (key : number) => key; 

/**
 * Creates an empty linear probing hashtable with a predefined size.
 * @returns {user_table} The empty hashtable to store user records.
 */
function create_user_hashtable(): user_table {
    const user_hashtable: user_table = ph_empty(user_hashtable_size, probe_linear(hash_func));
    return user_hashtable;
}
module.exports.create_user_hashtable = create_user_hashtable;

/**
 * Finds the id in a user_record.
 * @param {user_record} user The user to to get id of.
 * @returns {user_id} The id of the user
 */
function get_user_id(user: user_record): user_id_number {
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
function add_user_to_hashtable(user: user_record, 
                                user_id: user_id_number, 
                                hashtable: user_table): user_table {
    const insert_user = ph_insert(hashtable, user_id, user);
    return hashtable;
}
module.exports.add_user_to_hashtable = add_user_to_hashtable;


// Create and add user to already existing hashtable

/**
 * Creates a user and then adds it to an already existing hashtable
 * @param {user_table} hashtable A alreade created hashtable to store user_records
 * @return void.
 */
function create_and_add_user_to_table(hashtable: user_table): void {
    const user_string = get_user_info();
    const user = create_user(user_string);
    const user_id_number = get_user_id(user);
    add_user_to_hashtable(user, user_id_number, hashtable);
}


//Save and load user data from saved_user_data.ts file


const saved_user_file: string = '.\saved_user_data.json';

/**
 * Serializes a hashingtable into string and saves it to an additional file.
 * @param {string} file The file to save the user hashingtable to.
 * @param {user_table} hashtable The hashtable containing user data.
 * @returns {void} 
 */
function save_user_hash_to_file(file: string, hashtable: user_table ): void {
    const serialized_hashtable = JSON.stringify(hashtable);
    fs.writeFileSync(file, serialized_hashtable);
}
module.exports.save_user_hash_to_file = save_user_hash_to_file;


/**
 * Deserializes a stringified probing hashtable in an external file.
 * Test if data was retrieved correctly, otherwise returns empty hashtable
 * together with error message.
 * @param {string} file The file containing the serialized hashtable.
 * @returns {ProbingHashtable} A probing hashtable that contains the user records.
 */
function load_user_hashtable_from_file(file: string): user_table {
    try {
        const serialized_hashtable = fs.readFileSync(file, 'utf-8');
        return JSON.parse(serialized_hashtable);
    } catch (error) {
        console.error('Error loading hashtable', error); 
        return ph_empty(user_hashtable_size, probe_linear(hash_func));
    }
}
module.exports.load_user_hashtable_from_file = load_user_hashtable_from_file;


