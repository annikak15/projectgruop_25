import { type ProbingFunction, type HashFunction, probe_linear
} from '../lib/hashtables'
import { Prio_Queue, empty, is_empty, dequeue, qhead } from './lib/prio_queue';
import { start_timer } from './timer';


/**
 * A person is a number that represents a person's ID 
 * 
 */
export type Person = number; 

/**
 * A spot represents a parking spot at a parking lot. 
 * @invariant Spot is non-negative number 
 * //Invalid 
 * Empty? 
 */
type Spot = number;

/**
 * A reservation is a record.
 * It repressents a reservation of a parking spot at a specific time 
 * @template person a person represents a person's information 
 * @template dateStart represents the startign date of the reservation
 * @template dateEnd represents the end date of the reservation 
 * //Invalid 
 * dateStart must be at an earlier date than dateEnd 
 */
type Reservation = {person: Person, 
    dateStart: Date,
    dateEnd: Date};

/**
 * Represents the reservations placed on a specific parking spot. 
 * The reservations are placed in a priority queue, where the 
 * booking start date made into a number represents the priority of the booking.
 * Bookings with a lower number, a sooner date, gets higher priority. 
 */
export type Reservations = Prio_Queue<Reservation>;

/**
 * A hash table that resolves collisions by probing
 * @param keys the key array. null means that a key has been deleted.
 *      Represents the spots in the parking lot
 * @param people array of people that is currantly parked in a parking spot 
 * @param reserved array of prio queues that stores reservations for each parking spot 
 * @param probe the probing function
 * @param size the number of elements currently in the table
 * @invariant If keys[i] is neither null nor undefined, 
 *     then people[i] contains a person.
 * @invariant size is equal to the number of elements in keys 
 *     that are neither null nor undefined.
 * @invariant When the table is empty the reserved queue an array with empty 
 *      queues that is the size of the table. 
 */
export type ParkingTable = {
    readonly keys:  Array<Spot | null | undefined >,
    readonly parked:  Array<Person>,
    reserved: Array<Reservations>
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
        parked: new Array(length), 
        reserved: new Array(length),
        probe: probe_linear(hash_func), 
        size: 0 };
    for(let i = 0; i < table.reserved.length; i++) {
        table.reserved[i] = empty(); 
    }
    return table; 
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
export function make_date_number(date: Date): number{
    return date.getFullYear() * 100000000
            + date.getMonth() * 1000000
            + date.getDate() * 10000
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

//ANVÄND VID BÖTER??
function is_empty_spot(parking: ParkingTable, spot: number): boolean {
    return parking.parked[spot] === (undefined || null) ? true: false;  
}


//Modified prio queue
/**
 * Adds an element to a priority queue.
 * @template T type of all queue elements
 * @param prio priority of the new element (smaller means higher priority)
 * @param e element to add
 * @param q queue to add element to
 * @modifies q such that e is added with priority prio
 */
export function enqueue<T>(prio: number, e: T, q: Prio_Queue<T>) {
    const tail_index = q[1];
    q[2][tail_index] = [prio, e];
    if (!is_empty(q)) {
        // we have at least one element
        const head_index = q[0];
        const elems = q[2];
        elems[tail_index] = [prio, e];
        // swap elements until we find the right spot
        for (let i = tail_index; i > head_index; i = i - 1) {
            if (elems[i - 1][0] <= elems[i][0]) {
                break;
            } else { //swap
                swap(elems, i, i - 1);
            }
        }
    } else {}
    q[1] = tail_index + 1;  // update tail index
}

function swap<T>(A: Array<T>, i: number, j: number) {
    const tmp = A[i];
    A[i] = A[j];
    A[j] = tmp;
}


// helper function implementing probing from a given probe index i
function probe_from<K, V, R>({keys, probe}: ParkingTable, //SPARA FOR NOW 
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

/**
 * 
 * @param reservations 
 * @param person 
 * @returns 
 */
function find_person(reservations: Reservations, person: Person): Reservation | undefined {
    const reservs = reservations; 
    for(let i = 0; i < reservs.length; i++) {
        const reserv = qhead(reservs); 
        if(reserv.person === person) {
            return reserv; 
        } else {
            dequeue(reservs);
        }
    }
    return undefined; 
}

/**
 * Checks wether or not todays date is within the starting date and end date 
 * @param dateS the starting date 
 * @param dateE the end date 
 * @returns returns true if todays date is within the starting and end date
 *      returns false if not. 
 */
function is_within_date(dateS: Date, dateE: Date): boolean {
    const today = make_date_number(new Date());
    if(make_date_number(dateS) <= today && make_date_number(dateE) > today) {
        return true;
    } else {
        return false; 
    }
}

/**
 * The user parks their car in a spot
 * Starts the parking timer that will warn the user when their time is out 
 * Inserts the person parking in the parked array int the parking table to 
 * symbolize that the spot is occupied 
 * @param parking The parking table that the user wants to park at 
 * @param spot The parking spot that the user wants to park
 * @param person The user's ID
 * @returns returns true if the person got put into the parked array. If the 
 *      user didn't book that specific spot, if the parking table has no empty 
 *      spots the function returns false, or if the person is trying to park at 
 *      a time that is not within their booked time. 
 */
export function park_at(parking: ParkingTable, spot: number, person: Person): boolean {
    //Starts the timer 
    function park_timer(startDate: Date, endDate: Date){
        const secondsStart = startDate.getTime(); 
        const secondsEnd = endDate.getTime();
        console.log(secondsEnd - secondsStart); 
        start_timer(secondsEnd - secondsStart); 
    }

    //Helper function to insertFrom
    function insertAt(index: number): true {
        parking.keys[index] = spot;
        parking.parked[index] = person;
        parking.size = parking.size + 1;
        return true;
    }

    //Inserts a parson in the people array in the parking table 
    function insertFrom(i: number): boolean {
        const index = parking.probe(parking.keys.length, spot, i);
        if (parking.keys[index] === spot || parking.keys[index] === undefined) {
            return insertAt(index);
        } else if (parking.keys[index] === null) {
            const location = probe_from(parking, spot, i);
            return insertAt(location === undefined ? index : location);
        } else {
            return false; 
        }
    }

    if(parking.keys.length === parking.size) {
        return false; 
    } else {
        const reservations = parking.reserved[spot]; 
        const reservation = find_person(reservations, person);

        if (reservation === undefined) {
            return false; 
        } else if (is_within_date(reservation.dateStart, reservation.dateEnd)){
            return insertFrom(0);
        } else {
            return false; 
        }
    }
}

/**
 * The user leaves the spot they were parked at, removes the user's reservation
 * from the reservations queue (stored in the parking table). It also removes 
 * any bookings prior to
 * @param parking 
 * @param spot 
 * @param person 
 * @returns 
 */
export function leave_spot(parking: ParkingTable, spot: number, person: Person): boolean {
    const index = probe_from(parking, spot, 0);
    if (index === undefined) {
        return false;
     } else { 
        //AVSLUTA TIMERN 
        parking.keys[index] = null;
        parking.size = parking.size - 1;
        const reservs = parking.reserved[spot];
        for(let i = 0; i < reservs.length; i++) {
            const reserv = qhead(reservs); 
            dequeue(reservs);
            if (reserv.person === person) { 
                break; 
            }
        }
        parking.reserved[spot] = reservs; 
        return true;
    }
}