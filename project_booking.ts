import { type ProbingFunction, type HashFunction, probe_linear
} from '../lib/hashtables'
import { Prio_Queue, empty, is_empty, enqueue, dequeue, qhead } from './lib/prio_queue';

export type Person = number; //TEMPORÄRT!!!

type Spot = number;

type Reservation = {person: Person, 
    dateStart: Date,
    dateEnd: Date};

export type Reservations = Prio_Queue<Reservation>;

export type ParkingTable = {
    readonly keys:  Array<Spot | null | undefined >,
    readonly people:  Array<Person>,
    readonly reserved: Array<Reservations>
    readonly probe: ProbingFunction<Spot>,
    size: number // number of elements
};



/**
 * Makes an ParkingTable with empty parking spots and no reservations 
 * @param length the number of parking spots in the parking lot 
 * @returns Returns an empty ParkingTable 
 */
export function make_parking_table(length: number): ParkingTable{
    const hash_func : HashFunction<number> = (key : number) => key;  
    const table: ParkingTable = { 
        keys: new Array(length), 
        people: new Array(length), 
        reserved: new Array(length),
        probe: probe_linear(hash_func), 
        size: 0 };
    for(let i = 0; i < table.reserved.length; i++) {
        table.reserved[i] = empty(); 
    }
    return table; 
}

/**
 * 
 * @param parking 
 * @returns 
 */
export function find_empty_parking(parking: ParkingTable): Array<number> { //UTÖKA
    //Ska kolla upp alla parkeringsplatser som är tomma
    //Ska returnera alla platser som användaren kan välja på i form av array?
    //Ska kanske också kolla när parkeringsplatsen är tom? 
    //Ev ta en till param, när den ska bokas 
    const emptySpots: Array<number> = []; 
    for(let i = 0; i < parking.size; i++){
        if(is_empty_spot(parking, i)){
            emptySpots.push(i); 
        } else {}
    }
    return emptySpots; 
}


//Ska kanske byta ut mot is_reserved 
function is_empty_spot(parking: ParkingTable, spot: number): boolean {
    return parking.people[spot] === (undefined || null) ? true: false;  
}

// helper function implementing probing from a given probe index i
function probe_from<K, V, R>({keys, probe}: ParkingTable, 
    key: Spot, i: number): number | undefined {
    function step(i: number): number | undefined {
        const index = probe(keys.length, key, i);
        return i === keys.length || keys[index] === undefined
            ? undefined
            : keys[index] === key
            ? index
            : step(i + 1);
    }
    return step(i);
}

//OBS; KANSKE LÄGG TILL SÅ ATT FÖRSTA PERSONEN I KÖN KAN PARKERA? 
export function park_at(parking: ParkingTable, spot: number, person: Person): boolean {
    function insertAt(index: number): true {
        parking.keys[index] = spot;
        parking.people[index] = person;
        parking.size = parking.size + 1;
        return true;
    }
    function insertFrom(i: number): boolean {
        const index = parking.probe(parking.keys.length, spot, i);
        if (parking.keys[index] === spot || parking.keys[index] === undefined) {
            return insertAt(index);
        } else if (parking.keys[index] === null) {
            const location = probe_from(parking, spot, i);
            return insertAt(location === undefined ? index : location);
        } else {
            return insertFrom(i + 1);
        }
    }
    return parking.keys.length === parking.size ? false : insertFrom(0);
}


function leave_spot(parking: ParkingTable, spot: number): boolean {
    const index = probe_from(parking, spot, 0);
    if (index === undefined) {
        return false;
     } else { 
        parking.keys[index] = null;
        parking.size = parking.size - 1;
        return true;
    }
}

/**
 * Makes a reservation for a parking spot in a parking lot 
 * @param dateStart The start date of the booking 
 * @param dateEnd The end date of the booking 
 * @param spot The empty spot that the user chose 
 * @param parking The desired parking lot the user wants to park at 
 * @param person The person that wants to park 
 * @precondition The spot has no reservations that collide with the start or end date 
 * @modifies The reservations queue that belongs to the spot in the ParkingTable 
 */
export function make_booking (dateStart: Date, dateEnd: Date, spot: Spot, parking: ParkingTable, person: Person): void{
    let reservations = (parking.reserved)[spot]; 
    //Reservation waiting to be put in to ht 
    const reservation: Reservation = {person: person,
        dateStart: dateStart, 
        dateEnd: dateEnd}; 
    const dateNr = make_date_number(dateStart); 
    enqueue(dateNr, reservation, reservations); 
}

/**
 * Turns a date into a 12 digit number, YYYYMMDDHHMM
 * @param date a date 
 * @returns returns a 12 digit number 
 */
function make_date_number(date: Date): number{
    return date.getFullYear() * 100000000
            + date.getMonth() * 1000000
            + date.getDay() * 10000
            + date.getHours() * 100 
            + date.getMinutes(); 
}

/**
 * Adds an extra 15 minutes to a date 
 * @param date a date
 * @returns returns the date with 15 minutes added to it 
 */
function add_15_minutes(date: Date): Date{
    const min = date.getMinutes(); 
    let newDate = date; 
    newDate.setMinutes(min + 15); 
    return newDate; 
}

/**
 * Checks if a parking spot is reserved during the time a person want to book a spot 
 * @param dateS The wanted starting date of the booking 
 * @param dateE The end date of the booking 
 * @param spot The parking spot that is being checked if empty 
 * @param reservations The queue of reservations
 * @returns Returns true or false based on the parking spot is booked between the starting date and end date 
 */
function is_booked(dateS: Date, dateE: Date, spot: Spot, reservations: Reservations): boolean{
    const dateStart = make_date_number(dateS); 
    const dateEnd = make_date_number(add_15_minutes(dateE)); 

    if (is_empty(reservations)) {
        return false; 
    } else {
        for(let i = 0; i < reservations.length; i++) {
            const reservation = qhead(reservations); 
            dequeue(reservations); 
            const reservStart = make_date_number(reservation.dateStart);
            //Adds 15 minutes to end time to ensure no overlapping 
            const reservEnd = make_date_number(add_15_minutes(reservation.dateEnd));

            if(dateEnd < reservStart){
                return false;
            } else if(dateStart > reservEnd){
                continue; 
            } else {
                return true;
            }
        }
    return false; 
    }
}

/**
 * Finds unbooked spots for the user to choose from 
 * @param dateStart The start time of the users booking 
 * @param dateEnd The end time of the users booking 
 * @param parking The parking lot the user wants to park at 
 * @returns returns an array of spots for the user to choose from 
 */
export function find_unbooked(dateStart: Date, dateEnd: Date, parking: ParkingTable): Array<Spot>{
    let reservQ = parking.reserved; 
    let notBooked: Array<Spot> = []; 
    for(let i = 0; i < reservQ.length; i++) {
        if (!(is_booked(dateStart, dateEnd, i, reservQ[i]))) {
            notBooked.push(i); 
        }else {}
    }
    return notBooked; 
}