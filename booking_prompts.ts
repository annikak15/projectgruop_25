import * as promptSync from "prompt-sync";
import { Person, Reservation, find_unbooked, leave_spot, make_booking, park_at } from "./project_booking";
import { get_park_from_parkingLots, set_up } from "./parking_lots";
import { homepage_options, press_homepage} from './start'


const prompt = promptSync(); 

//OBS OBS OM DU TEST-KÖR OCH VILL ANVÄNDA SAMMA INFO, använd set_up
set_up();

const personID = 20040520 //TEMPORÄRT!!!

/**
 * Asks the user for a start and an end date, keeps asking untill it gets a
 * valid date. When the user has given a correct date the function returns 
 * a reservation (a record with the start date, end date and the user's ID)
 * @param person The user's id
 * @returns Returns a reservation, a record with the start and end date as well
 *      as the user's ID
 */
export function ask_date(person: number): Reservation{
    function is_invalid_date(dateS: Date, dateE: Date):boolean {
        if(dateS.toString() === "Invalid Date" || 
           dateE.toString() === "Invalid Date") {
            return false;
        } else {
            return true; 
        }
    }
    let userInput1: string = ""
    let userInput2: string = ""
    let dateStart: Date = new Date();
    let dateEnd: Date = new Date();
    let validDate = false;
    while(!validDate) {
        console.log("Press q to quit");
        console.log("Please write date and time like this: YYYY-MM-DD HH:MM");
        console.log("When do you want your reservation to start?");
        userInput1 = prompt("");
        if (userInput1 === "q") {
            homepage_options();
        } else {
            dateStart = new Date(userInput1);
            console.log("When do you want your reservation to end?");
            userInput2 = prompt("");
            if (userInput2 === "q") {
                homepage_options();
            } else {
                dateEnd = new Date(userInput2);
                validDate = is_invalid_date(dateStart, dateEnd);
            }
        }
    }
    return {person: person,
            dateStart: dateStart,
            dateEnd: dateEnd}
}

/**
 * Asks the user to put in a parking lot, if the lot is full, or if the user 
 * put in a parking lot that is not in the system, then it asks the user to 
 * put in another one. 
 * @param dateS The starting date of a reservation
 * @param dateE the end date of a reservation
 * @param person the user's ID number
 * @modifies Modifies the 
 */
export function ask_park(dateS: Date, dateE: Date, person: number): void {
    let spot = NaN; //Temporärt 
    const file = "saved_parking_lots.json";
    let userInput: string = "";
    let validPark = false;

    while(!validPark) {
        console.log("press q to quit");
        console.log("Where do you want to park?");
        userInput = prompt("").toLocaleLowerCase();
        if (userInput === "q") {
            homepage_options();
        } else {
            //LETAA REDA PÅ PARKERINGAR I NÄRHETEN? 
            const park = get_park_from_parkingLots(file, userInput);
            //Kollar om man skrivit in parkering som existerar
            if (park === undefined) {
                continue;
            //Kollar så att man inte använder test-parkeringar 
            } else if(park.name === "test" || park.name === "empty") {
                continue;
            //Valt en parkering som finns 
            } else {
                const unbooked = find_unbooked(dateS, dateE, park);
                //Kollar om det finns plats 
                if (unbooked.length === 0) {
                    console.log("That lot is full, pick another parking lot")   
                //finns plats på parkering
                } else {
                    let validAnswer = false; 
                    //Kollar så att man väljer en ledig plats på parkeringen
                    while(!validAnswer) {
                        console.log("Choose one of these spots:");
                        console.log(unbooked.toString());
                        spot = Number(prompt("")); 
                        if(spot in unbooked) {
                            //Här avslutas while-loopen
                            validAnswer = true; 
                            validPark = true; 
                            make_booking(dateS, dateE, spot, park, person);
                        } else {}
                    }
                }
            }
        }
    }
}

/**
 * 
 * @param personID 
 */
export function parking(personID: number): void {
    let validAnsw = false;
    while(!validAnsw) {
        const file = "saved_parking_lots.json";
        console.log("press q to quit");
        const userInput = prompt("At what parking lot? ").toLocaleLowerCase(); 
        if (userInput === "q") {
            homepage_options(); 
        } else {
            const park = get_park_from_parkingLots(file, userInput);
            if (park === undefined) {
                console.log("not valid parking lot")
                parking(personID);
            //Kollar så att man inte använder test-parkeringar 
            } else if(park.name === "test" || park.name === "empty") {
                console.log("not valid parking lot")
                parking(personID);
            //Valt en parkering som finns 
            } else {
                const spot = Number(prompt("At what spot? "));
                validAnsw = (park_at(park, spot, personID)); //Lite förvirrande kanske, men om den är true så har man lyckats parkera
                console.log("You are now parked.")
            }
            press_homepage();
            
        }
    }
}

/**
 * A function that asks the user to put in the current parking lot and parking 
 * spot they are parked at. If they do so successfully they will end their 
 * ongoing parking. 
 * @param personID the user's ID
 * @modifies the parkingTable of the parking lot if the user successfully leaves 
 *      the spot. If the user decide to quit no changes will occur 
 */
export function leave(personID: number): void {
    let validAnsw = false;
    while(!validAnsw) {
        const file = "saved_parking_lots.json";
        console.log("press q to quit");
        const userInput = prompt("At what parking lot? ").toLocaleLowerCase(); 
        if(userInput === "q") {
            homepage_options();
        } else {
            const park = get_park_from_parkingLots(file, userInput);
            if (park === undefined) {
                console.log("not valid parking lot")
                leave(personID);
            //Kollar så att man inte använder test-parkeringar 
            } else if(park.name === "test" || park.name === "empty") {
                console.log("not valid parking lot")
                leave(personID);
            //Valt en parkering som finns 
            } else {
                const spot = Number(prompt("At what spot? "));
                const leftSpot = leave_spot(park, spot, personID); 
                if (leftSpot) {
                    validAnsw = true;
                    console.log("You have ended your parking");
                    press_homepage();
                } else {
                    console.log("Invalid spot");
                    continue;
                }
            }
        }
    }
}



// //OM MAN VÄLJER ATT BOKA: 
// const reservation = ask_date(personID);

// ask_park(reservation.dateStart, reservation.dateEnd, personID);

// //OM MAN VÄLJER ATT PARKERA: 
// //Ta fram reservation (OBS! måste veta parkering och parkerings-plats)
// //Lättast för oss om användaren bara skriver in vart den vill parkera, men 
// //det blir inte lättast för användaren eftersom den måste komma ihåg allt 
// parking(personID);


// //OM MAN VÄLJER ATT LÄMNA PARKERING 
// //samma som när man väljer att parkera, lättare för oss om användaren skriver in själv 
// leave(personID);


