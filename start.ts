// Starts the app

import * as ud from './user_data';
import * as pb from './project_booking';
import * as gq from './project_graph_queue';
import * as g from './project_graph';
import * as ps from "prompt-sync";

import { park_options, ask_date, ask_park, parking} from './booking_prompts';

const prompt: ps.Prompt = ps({ sigint: true });
const user_hashtable = ud.create_user_table(10);

const app_name = "Parking Buddy";
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

let loggedin_user;
let current_user = 0;

function start() {
    ud.load_hashtable_from_file(ud.saved_user_file);
    message_first_visit();
    login_or_signup();
}

function message_first_visit(): void {
    logo.forEach(line => console.log(line.replace(/\./g, ' ')));
    console.log(app_name);
}

function login_or_signup() {
    console.log("1: Log in")
    console.log("2: Create account")
    const choises = prompt("");
    if (choises === "1") {
        login(user_hashtable);
    } else if (choises === "2") {
       create_account();
    } else {
        console.log("Invalid input. Try again.")
        login_or_signup();
    }
}


function create_account() {
    const created_user = ud.create_and_add_user_to_table(user_hashtable);
    const welcome = `Welcome ${created_user.name1} ${created_user.name2}.`;
    loggedin_user = created_user.id;
    console.log(welcome);
    homepage_options();
}

function login(hashtable: ud.user_table) {
    const user = prompt("Enter personal ID");
        if (user !== null) {
            const user_int = +user;
            loggedin_user = user_int;
            current_user = user_int;
            const lookup = ud.find_user_record(user_int, hashtable);
            
            if (lookup?.id === user_int) {
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

function homepage_options() {
    console.log("What do you want to do?");
    console.log('1. Find parking');
    console.log('2. End ongoing parking');
    console.log('3. Check parking history');
    console.log('4. Park at your booked spot');
    console.log('5. Log out');
    console.log("");

    const choise = prompt("Enter 1, 2, 3, 4 or 5.");
    if (choise === "1") {
        find_parking();
    } 
    else if (choise === "2"){
        end_parking();
    }
    else if (choise === "3"){
        //Kolla historik funktioner
    } 

    else if ( choise === '4') {
        Park_in_spot();
    }
    
    else if (choise === '5') {
        process.exit();
    }
    
    else {
        console.log("Invalid input, please try again");
        homepage_options();
    }
}

function find_parking() {
    const answer_place = prompt('What is your location: 1 - Ångström, 2 - Centralen: ')
            
    if ( answer_place === '1') {
        console.log(gq.Find_Parking_lots(gq.graph_uppsala, 0));
        book_parking();
        
    }
    else if (answer_place === '2') {
        console.log(gq.Find_Parking_lots(gq.graph_uppsala, 1)); 
        book_parking();

    } else {
        console.log('Not valid input, try again');
        find_parking();
    }

}

function book_parking() {
    const answer = prompt('Do you want to book parking? (yes/no):')

    if(answer === 'yes'){
        const reservation = ask_date(current_user);
        ask_park(reservation.dateStart, reservation.dateEnd, current_user);
        console.log("Your booking is registered");
        
    }

    else if (answer === 'no') {
        homepage_options(); 
    }

    else {
        console.log('invald input');
        book_parking();
    }
}

function Park_in_spot (){
    parking(current_user);
    console.log("You have parked at your spot")

}



function end_parking() {

    // Ska avsluta pågående parkering
}

start();
