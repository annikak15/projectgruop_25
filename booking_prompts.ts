

import * as promptSync from "prompt-sync";
import { Person, Reservation, find_unbooked, leave_spot, make_booking, park_at } from "./project_booking";
import { get_park_from_parkingLots } from "./parking_lots";


const prompt = promptSync(); 
//Har id check!

//Fråga när den vill parkera (kolla när ok) ckeck!

//Fråga vart den vill parkera check!

//Plocka fram parkering (tillåt ej "test" eller "empty") check!

//Kolla om den är full 

//Om full gå vidare till att boka 

//Om den är tom gå vidar till att skriva in parkering igen (spara datum)

//Fråga om den vill parkera, om ja parkera 

//Fråga om den vill lämna parkering, om ja lämna 

//Funktioner: ask_park, ask_date, book

const personID = 20040520 //TEMPORÄRT!!!

function ask_date(person: Person): Reservation{
    function is_invalid_date(dateS: Date, dateE: Date):boolean {
        if(dateS.toString() === "Invalid Date" || 
           dateE.toString() === "Invalid Date") {
            return false;
        } else {
            return true; 
        }
    }
    let dateStart: Date = new Date()
    let dateEnd: Date = new Date()
    let validDate = false;
    while(!validDate) {
        console.log("Please write date and time like this: YYYY-MM-DD HH:MM");
        console.log("When do you want your reservation to start?");
        dateStart = new Date(prompt(""));
        console.log("When do you want your reservation to end?");
        dateEnd = new Date(prompt(""));
        validDate = is_invalid_date(dateStart, dateEnd);
    }
    return {person: person,
            dateStart: dateStart,
            dateEnd: dateEnd}
}

function ask_park(dateS, dateE, person): void {
    let spot = NaN; //Temporärt 
    const file = "saved_parking_lots.json";
    let parkString: string = "";
    let validPark = false;

    while(!validPark) {
        console.log("Where do you want to park?");
        parkString = prompt("");
        const park = get_park_from_parkingLots(file, parkString);
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
                //man kan fastna här i en oändlig loop nu tyvärr :/
                console.log("That lot is full, pick another parking lot")   
            //finns plats på parkering
            } else {
                let validAnswer = false; 
                //Kollar så att man väljer en ledig plats på parkeringen
                while(!validAnswer) {
                    console.log("Choose one of these spots:");
                    console.log(unbooked);
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

function parking(personID): void {
    let validAnsw = false;
    while(!validAnsw) {
        const file = "saved_parking_lots.json";
        const park = get_park_from_parkingLots(file, prompt("At what parking lot? "));
        if (park === undefined) {
            console.log("not valid parking lot")
            continue;
        //Kollar så att man inte använder test-parkeringar 
        } else if(park.name === "test" || park.name === "empty") {
            console.log("not valid parking lot")
            continue;
        //Valt en parkering som finns 
        } else {
            const spot = Number(prompt("At what spot? "));
            validAnsw = park_at(park, spot, personID); //Lite förvirrande kanske, men om den är true så har man lyckats parkera
        }
    }
}

function leave(personID): void {
    let validAnsw = false;
    while(!validAnsw) {
        const file = "saved_parking_lots.json";
        const park = get_park_from_parkingLots(file, prompt("At what parking lot? "));
        if (park === undefined) {
            console.log("not valid parking lot")
            continue;
        //Kollar så att man inte använder test-parkeringar 
        } else if(park.name === "test" || park.name === "empty") {
            console.log("not valid parking lot")
            continue;
        //Valt en parkering som finns 
        } else {
            const spot = Number(prompt("At what spot? "));
            validAnsw = leave_spot(park, spot, personID); //Lite förvirrande kanske, men om den är true så har man lyckats lämna
        }
    }
}

//OM MAN VÄLJER ATT BOKA: 
const reservation = ask_date(personID);

ask_park(reservation.dateStart, reservation.dateEnd, personID);

//OM MAN VÄLJER ATT PARKERA: 
//Ta fram reservation (OBS! måste veta parkering och parkerings-plats)
//Lättast för oss om användaren bara skriver in vart den vill parkera, men 
//det blir inte lättast för användaren eftersom den måste komma ihåg allt 
parking(personID);


//OM MAN VÄLJER ATT LÄMNA PARKERING 
//samma som när man väljer att parkera, lättare för oss om användaren skriver in själv 
leave(personID);
