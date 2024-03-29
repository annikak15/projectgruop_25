import * as ud from './user_data';
import * as gq from './project_graph_queue';
var prompt = require('prompt-sync')();

import { ask_date, ask_park, parking, leave} from './booking_prompts';
import { for_each } from './lib/list';

/**
 * The file containing the serialized user record hash table
 */
const user_file = "./saved_user_data.json";
/**
 * The file containing the serialized user history-fine record hash table
 */
const history_file = "./saved_history_data.json"

/**
 * The deserialized hashtable to store user records.
 */
const user_hashtable: ud.user_table = ud.load_user_hashtable_from_file(user_file);
/**
 * The deserialized hashtable to store history-fine records.
 */
const history_table: ud.history_table = ud.load_history_from_file(history_file);

/**
 * The name of the app written in serveral strings collected in an object.
 */
const app_name = [
   " ____   ____  ____   __  _  ____  ____    ____      ____   __ __  ___    ___    __ __  ",
   " |    \ /    ||    \ |  |/ ]|    ||    \  /    |    |    \ |  |  ||   \  |   \  |  |  |",
   " |  o  )  o  ||  D  )|  ' /  |  | |  _  ||   __|    |  o  )|  |  ||    \ |    \ |  |  |",
   " |   _/|     ||    / |    \  |  | |  |  ||  |  |    |     ||  |  ||  D  ||  D  ||  ~  |",
   " |  |  |  _  ||    \ |     | |  | |  |  ||  |_ |    |  O  ||  :  ||     ||     ||___, |",
   " |  |  |  |  ||  .  \|  .  | |  | |  |  ||     |    |     ||     ||     ||     ||     |",
   " |__|  |__|__||__|\_||__|\_||____||__|__||___,_|    |_____| \__,_||_____||_____||____/ ",
   "                                                                                       "
];
/**
 * The logo of a car representing Parking Buddy.
 * Written in serveral strings collected in an object.
 */
const logo = [
    "................................................................................",
    "......................................,I7777777777777=................7.........",
    ".................................7777,.,............,...~77777...I77777.........",
    ".............................+77=..7777:...:7.......~I777777..77.....,..........",
    "......................,..777..?77~........:7........~?...777 ..77....7.........",
    ".......................777..777............: ........~+.....7777,.77.,..........",
    ".................=77777.,7777777...........:7........~+.....:777777.=7..........",
    "...........777777777,I77777777.777777777777,7777777777777.77777777777.77........",
    "........7777777I77777777777777.7777777 7777.7777777777777.777777 ......7........",
    "......+7......777777    777777.777777777777.777777777777 . 77777777..,.7........",
    "......7,...7777777,.....,77777.777777777777.7777777777........77777777.7........",
    ".....77777777777..?77777?.. 77.777  7777777.7777777 :..777777...777777,7,.......",
    ".....7777777777..77..... 7..77.7IIIIII77II7,II77II7..+77....:77..7I7III??.......",
    ".....77...7777..77.77777.77..I.II??I???????.II?II??..7..7777=.77.+????+7........",
    " ......I7777777..7I,7,,,7,?7..+.??+?????????.???+++?.77.7 ,.77.77.,7777I.........",
    "................77.77777.77..........................7,.7777..77................",
    ".................77.....77...........................+7 ..,.7 7.................",
    "..................I77777I..............................777777...................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................",
    "................................................................................"
];

/**
 * The global variable holding the personal id of the logged in user.
 */
let loggedin_user: ud.user_id_number;

/**
 * Initializes the Parking Buddy application by displaying a welcome message and prompting the user to log in or sign up.
 */
function start() {
    message_first_visit();
    login_or_signup();
}

/**
 * Displays the welcome message and logo for first-time visitors of the Parking Buddy application.
 */
function message_first_visit(): void {
    app_name.forEach(line => console.log(line));
    logo.forEach(line => console.log(line.replace(/\./g, ' ')));
    console.log("");
    console.log("");
}

/**
 * Guides the user to either log in with an existing account or create a new account.
 */
function login_or_signup() {
    console.log("Log in or create account to acces Parking Buddy's services.");
    console.log("");
    console.log("1: Log in");
    console.log("2: Create account");
    const choises = prompt("");
    if (choises === "1") {
        console.log("");
        login(user_hashtable);
    } else if (choises === "2") {
       create_account();
    } else {
        console.log("");
        console.log("Invalid input. Try again.")
        login_or_signup();
    }
}

/**
 * Handles the process of creating a new user account by adding user information to the user hashtable.
 */
function create_account() {
    console.log("");
    const created_user = ud.create_and_add_user_to_table(user_hashtable);
    const welcome = `Welcome ${created_user.name1} ${created_user.name2}.`;
    loggedin_user = created_user.id;
    console.log(welcome);
    console.log("");
    homepage_options();
}

/**
 * Manages the user login process by verifying the entered personal ID against the user hashtable.
 * @param {ud.user_table} hashtable - Hashtable containing user records.
 */
function login(hashtable: ud.user_table) {
    console.log("Enter personal ID:")
    const user = prompt("");
        if (user !== null) {
            const user_int = +user;
            loggedin_user = user_int;
            const lookup = ud.find_user_record(user_int, hashtable);
            
            if (lookup?.id === user_int) {
                console.log("");
                const welcome = `Welcome back ${lookup.name1} ${lookup.name2}.`
                console.log(welcome);
                homepage_options();

            } else {
                const no_match = "No match, please try again or create a new account."
                console.log(no_match);
                login_or_signup();
            }
        }
        
}

/**
 * Displays the homepage options and prompts the user to choose an option.
 */
export function homepage_options() {
    console.log("");
    console.log("What do you want to do?");
    console.log('1. Find parking');
    console.log('2. End ongoing parking');
    console.log('3. Check parking history');
    console.log('4. Park at your booked spot');
    console.log('5. See your personal information')
    console.log('6. Log out');
    console.log("");

    console.log("Enter 1, 2, 3, 4, 5 or 6.");
    const choise = prompt("");

    if (choise === "1") {
        console.log("");
        find_parking();
    } 
    else if (choise === "2"){
        console.log("");
        leave(loggedin_user);
    }
    else if (choise === "3"){
        console.log("");
        display_history_fine(ud.load_history_from_file(history_file));   
    } 
    else if ( choise === '4') {
        ud.save_history_to_file(history_file, history_table)
        console.log("");
        parking(loggedin_user);
    }
    else if (choise === '5') {
        console.log("");
        user_info(loggedin_user);
    }
    else if (choise === '6') {
        exit_app();
    }
    
    else {
        console.log("");
        console.log("Invalid input, please try again");
        homepage_options();
    }
}

/**
 * Displays a prompt for the user to return to the homepage.
 */
export function press_homepage() {
    console.log("")
    console.log("Press enter to go back to home menu.");
    const answer = prompt("");
    homepage_options();
}

// User history functions

/**
 * Displays the parking and fine history associated with the logged-in user.
 * @param {ud.history_table} table The table containing parking history.
 */
function display_history_fine(table: ud.history_table): void {
    // Retrieve parking history and fine history associated with the logged-in user
    const record = ud.find_history_fine(loggedin_user, table);

    if (record) {
        // Retrieve parking history and fine history from the history-fine record
        const userHistory = ud.get_user_history(record);
        const userFineHistory = ud.get_user_fine(record);

        // Display parking history
        console.log("Parking History:");
        if (userHistory) {
            for_each(display_history, userHistory);
        } else {
            console.log("No parking history found.");
        }

        // Display fine history
        console.log("Fine History:");
        if (userFineHistory) {
            for_each(display_fine, userFineHistory);
        } else {
            console.log("No fine history found.");
        }
        press_homepage();

    } else {
        console.log("No history-fine record found for the logged-in user.");
        press_homepage();
    }
}

/**
 * Displays the parking history record.
 * @param {ud.history_record} userHistory The user's parking history record.
 */
function display_history(userHistory: ud.history_record): void {
    console.log(`Area: ${userHistory?.area}, Spot: ${userHistory?.spot}, Start: ${userHistory?.start}, End: ${userHistory?.end}`);
}

/**
 * Displays the fine history record.
 * @param {ud.fine_record} userFineHistory The user's fine history record.
 */
function display_fine(userFineHistory: ud.fine_record): void {
    console.log(`Info: ${userFineHistory.info.area}, Cost: ${userFineHistory.cost}`);
}


// Parking functions

/**
 * Initiates the process to find and book parking based on user location input
 *  and displays closest parking lots.
 */
function find_parking(): void {
    console.log('What is your location: 1 - Ångström, 2 - Centralen, 3 - BMC, 4 - Akademiska sjukhuset: ');
    const answer_place = prompt("");
    console.log("");

    if ( answer_place === '1') {
        console.log(gq.Find_Parking_lots(gq.graph_uppsala, 0));
        book_parking();
    }
    else if (answer_place === '2') {
        console.log(gq.Find_Parking_lots(gq.graph_uppsala, 1)); 
        book_parking();
    } 
    else if (answer_place === '3'){
        console.log(gq.Find_Parking_lots(gq.graph_uppsala, 7));
        book_parking();
    }

    else if (answer_place === '4'){
        console.log(gq.Find_Parking_lots(gq.graph_uppsala, 8));
        book_parking();
    }
    else {
        console.log('Not valid input, try again');
        find_parking();
    }
}

/**
 * Asks the user if they want to book parking and either calls booking
 * function or not, depending on users prompt.
 */
function book_parking(): void {
    console.log('Do you want to book parking? (yes/no):')
    const answer = prompt("")
    console.log("");

    if(answer === 'yes'){
        const reservation = ask_date(loggedin_user);
        ask_park(reservation.dateStart, reservation.dateEnd, loggedin_user);
        console.log("Your booking is registered");
        press_homepage();
    }

    else if (answer === 'no') {
        homepage_options(); 
    }

    else {
        console.log('invald input');
        book_parking();
    }
}

// User information

/**
 * Displays the user's personal information from the user record.
 * @param {number} user The user's ID.
 */
function user_info(user: number): void {
    const info = ud.find_user_record(loggedin_user, user_hashtable);
    if (info) {
        console.log("First name: ", info.name1);
        console.log("Last name: ", info.name2);
        console.log("Personal ID: ", info.id);
        console.log("Your car: ", info.car);
        console.log("Phone number: ", info.call_id);
        console.log("Email: ", info.email);
        console.log("");
        press_homepage();
    } else {
        console.log("User not found.")
        press_homepage();
    }
    
}

// Log out option

/**
 * Exits the application after saving data.
 */
function exit_app(): void {
    console.log("");
    console.log("Closing Parking Buddy.");
    ud.save_user_hash_to_file(user_file, user_hashtable);
    ud.save_history_to_file(ud.history_file, ud.load_history_from_file(history_file));
    process.exit();
}

start();
