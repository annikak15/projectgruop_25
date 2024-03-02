import { Prio_Queue, empty, is_empty, dequeue, qhead, display_queue 
} from './lib/prio_queue';

import { get_park_from_parkingLots, update_park } from './parking_lots';

import { start_timer } from './timer';

import { add_fine_to_hf_table, create_fine_record, create_history_fine_record, 
        create_history_record, find_history_fine, find_user_record, 
        get_user_fine_history, get_user_history//, history_table 
} from './user_data';

import * as ud from './user_data';

//OM KRÅNGEL KAN FELET VARA HÄR 
const history_table = ud.create_history_table(10);


/**
 * A {Person} is a number that represents a person's ID number
 * @invariant Person is a non-negative number 
 * 
 * Examples: 
 * Valid: 
 * 
 * Borderline: 
 * 
 * Invalid: 
 * not unique nr, empty?? 
 */
export type Person = number; 

/**
 * A {Spot} represents a parking spot at a parking lot. 
 * @invariant Spot is non-negative number 
 * 
 * Examples: 
 * Valid: 
 * 
 * Borderline: 
 * 
 * Invalid: 
 * 
 */
export type Spot = number;

/**
 * A {Reservation} is a record.
 * It repressents a reservation of a parking spot at a specific time 
 * @param person a person represents a person's ID number 
 * @param dateStart represents the startign date of the reservation
 * @param dateEnd represents the end date of the reservation 
 * @invariant dateStart must be at an earlier date than dateEnd 
 * 
 * Examples: 
 * Valid: 
 * 
 * Borderline: 
 * dateStart must be at an earlier date than dateEnd 
 * 
 * Invalid: 
 * 
 */
export type Reservation = {person: Person, 
                    dateStart: Date,
                    dateEnd: Date};

/**
 * {Reservations} is a priority queue. 
 * It represents the reservations placed on a specific parking spot. 
 * The reservations are placed in a priority queue, where the 
 * booking start date made into a number represents the priority of the booking.
 * Bookings with a lower number, a sooner date, gets higher priority. 
 * @invariant The lower priority-number, the higher priority
 * 
 * Examples: 
 * Valid: 
 * 
 * Borderline: 
 * 
 * Invalid: 
 * 
 */
export type Reservations = Prio_Queue<Reservation>;

/**
 * A {ParkingTable} is a record that represents a parking lot. It stores 
 * information about the names of the parking lot, if a parking spot is 
 * occupied or not, who is occupying what spot and the reservations for every 
 * spot. A specific index in an array corresponds to a specific parking spot, 
 * so, for instance, parking spot nr 0's reservations are stored at 
 * reserved[0], the person parking at spot 0 is stored at parked[0]
 * and if the spot is occupied is stored at spots[0]
 * @param spots the spot array. Represents the spots in the parking lot. null 
 *      means that someone has left the spot. If e.g spot 0 is occupied then
 *      spots[0] = 0, else spots[0] = null or spots[0] = undefined 
 * @param parked array of people that is currantly parked in a parking spot 
 * @param reserved array of prio queues that stores reservations for each 
 *      parking spot 
 * @invariant If spots[i] is neither null nor undefined, 
 *     then parked[i] contains a person.
 * @invariant When the table is empty the reserved array is full of empty 
 *      priority queues 
 * 
 * Examples: 
 * Valid: 
 * 
 * Borderline: 
 * 
 * Invalid:
 * 
 */
export type ParkingTable = {
    readonly name: string
    readonly spots:  Array<Spot | null | undefined>,
    readonly parked:  Array<Person>,
    readonly reserved: Array<Reservations>
};

/**
 * Makes a reservation for a parking spot in a parking lot. 
 * @param dateStart The start date of the booking 
 * @param dateEnd The end date of the booking 
 * @param spot The empty spot that the user chose 
 * @param parking The desired parking lot the user wants to park at 
 * @param person The person that wants to park 
 * @precondition The spot has no reservations that collide with the start or 
 *      end date 
 * @modifies The reservations queue that belongs to the spot in the 
 *      ParkingTable as well as the file "saved_parking_lots.ts"
 */
export function make_booking (dateStart: Date, dateEnd: Date, spot: Spot, 
                              parking: ParkingTable, person: Person): void{
    let reservations = (parking.reserved)[spot]; 
    const reservation: Reservation = {person: person,
        dateStart: dateStart, 
        dateEnd: dateEnd}; 
    const dateNr = make_date_number(dateStart); 
    enqueue(dateNr, reservation, reservations); 
    update_park("saved_parking_lots.json", parking);
    //KANSKE ÄNDRA???
    
    const record = create_history_record(parking.name, 
                                         spot.toString(), 
                                         dateStart, 
                                         dateEnd);
}

/**
 * Turns a date into a 12 digit number, YYYYMMDDHHMM
 * @example
 *      make_date_number(new Date(2024-02-29 18:39)); //returns 202402291839
 * @param date A date in the format YYYY-MM-DD HH:MM
 * @returns returns a 12 digit number 
 */
export function make_date_number(date: Date): number{
    const newDate = new Date(date); 
    return newDate.getFullYear() * 100000000
            + newDate.getMonth() * 1000000
            + newDate.getDate() * 10000
            + newDate.getHours() * 100 
            + newDate.getMinutes(); 
}

/**
 * Adds an extra 15 minutes to a date 
 * @example 
 *      add_15_minutes(new Date(2024-02-29 18:00)); //returns 2024-02-29 18:15
 *      add_15_minutes(new Date(2024-02-29 23:45)); //returns 2024-03-01 00:00
 * @param date the date you are adding 15 minutes to
 * @returns returns the date with 15 minutes added to it 
 */
function add_15_minutes(d: Date): Date{
    const date = new Date(d); 
    const min = date.getMinutes(); 
    let newDate = date; 
    newDate.setMinutes(min + 15); 
    return newDate; 
}

/**
 * Checks if a parking spot is reserved during the time a person want to 
 * book a spot.
 * @param dateS The wanted starting date of the booking 
 * @param dateE The end date of the booking 
 * @param spot The parking spot that is being checked if empty 
 * @param reservations The queue of reservations
 * @returns Returns true or false based on the parking spot is booked between 
 *      the starting date and end date.
 */
export function is_booked(dateS: Date, dateE: Date, 
                          reservations: Reservations): boolean{
    const dateStart = make_date_number(dateS); 
    const dateEnd = make_date_number(add_15_minutes(dateE)); 

    if (is_empty(reservations)) {
        return false; 
    } else {
        const reservArr = reservations[2]
        for(let i = 0; i < reservArr.length; i++) {
            const reservation = reservArr[i][1]; 
            const reservStart = make_date_number(reservation.dateStart);
            //Adds 15 minutes to end time to ensure no overlapping 
            const reservEnd = make_date_number(
                                    add_15_minutes(reservation.dateEnd));

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
 * @returns an array of spots for the user to choose from 
 */
export function find_unbooked(dateStart: Date, dateEnd: Date, 
                              parking: ParkingTable): Array<Spot>{
    let reservQ = parking.reserved; 
    let notBooked: Array<Spot> = []; 
    for(let i = 0; i < reservQ.length; i++) {
        if (!(is_booked(dateStart, dateEnd, reservQ[i]))) {
            notBooked.push(i); 
        }else {}
    }
    return notBooked; 
}

/**
 * Checks if a parking spot is empty or not. 
 * @param parking The parking lot you want to look at 
 * @param spot the parking spot you are checking
 * @returns Returns true if the spot is empty and false if not 
 */
export function is_empty_spot(parking: ParkingTable, spot: number): boolean {
    return parking.spots[spot] === undefined 
            ? true
            : parking.spots[spot] === null
            ? true
            : false;  
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
    //Swaps two elements with each other 
    function swap<T>(A: Array<T>, i: number, j: number) {
        const tmp = A[i];
        A[i] = A[j];
        A[j] = tmp;
    }

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

/**
 * Function that looks if a person have made a reservation or not at a 
 * specific spot 
 * @param reservations is the priority queue with the reservations for a 
 *          specific spot 
 * @param person is the ID of the person whose reservation we are looking for 
 * @returns Returns the reservation if it is found in the queue, if it is not 
 *          found the function returns undefined. 
 */
export function find_person(reservations: Reservations, 
                     person: Person): Reservation | undefined {
    const reservs = reservations[2]; 
    for(let i = 0; i < reservs.length; i++) {
        const reserv = reservs[i][1]
        if (reserv.person === person) { 
            return reserv;
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
export function is_within_date(dateS: Date, dateE: Date): boolean {
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
 * @returns Returns false if: 
 *      - The same person tries to park twice in the same spot 
 *      - The person doesn't have a reservation for the spot or if today's
 *        date is not within the reservation's start and end date 
 *      Otherwise the function returns true
 * @modifies the parking table, adds the key (spot), to the array of keys.
 *      The key index in the array = spot. 
 */
export function park_at(park: ParkingTable, spot: number, 
                        person: Person): boolean {
    let parking = park; 
    //Inserts a person in the people array in the parking table 
    function insertAt(index: number): true {
        parking.spots[index] = spot;
        parking.parked[index] = person;
        return true;
    }
    
    if(parking.parked[spot] === person){ 
        return false; 
    } else {}

    const reservations = parking.reserved[spot]; 
    const reservation = find_person(reservations, person);

    //Checks if the person has made a reservation for this spot 
    if (reservation === undefined || 
        !is_within_date(reservation.dateStart, reservation.dateEnd)) {
        return false; 
    } else {}

    //Checks if someone is still standing in the spot, gives them a fine 
    if (!is_empty_spot(parking, spot)) {
        const toBeFined = parking.parked[spot];
        const finedReserv = find_person(reservations, toBeFined);

        if(finedReserv === undefined) {
            return false;
        } else {}

        const fineHistory = find_history_fine(toBeFined, history_table); 
        const record = create_history_record(parking.name, 
                                             spot.toString(), 
                                             finedReserv.dateStart, 
                                             finedReserv.dateEnd);
        if(fineHistory === undefined) {
            const newRecord = create_history_fine_record(parking.name, 
                                                         spot.toString(), 
                                                         finedReserv.dateStart, 
                                                         finedReserv.dateEnd);
            add_fine_to_hf_table(create_fine_record(record), 
                                 toBeFined, 
                                 newRecord);
        } else {
            add_fine_to_hf_table(create_fine_record(record), 
                                 toBeFined, 
                                 fineHistory);
        }

        leave_spot(parking, spot, toBeFined);
        parking = get_park_from_parkingLots("saved_parking_lots.json", park.name)!
        insertAt(spot);
        update_park("saved_parking_lots.json", parking); 
        return true;

    } else {}
    insertAt(spot);
    update_park("saved_parking_lots.json", parking); 
    return true; 
}

/**
 * The user leaves the spot they were parked at, removes the user's reservation
 * from the reservations queue (stored in the parking table). It also removes 
 * any bookings prior to the one that is being removed from the queue.
 * @param parking the parking lot 
 * @param spot the parking spot the user is leaving 
 * @param person the user's ID 
 * @precondition the person must have a reservation in the reservations queue
 *      at parking.reserved[spot]
 * @returns returns true if the person is found at the parking lot at the given 
 *      spot, returns false otherwise. 
 * @modifies the parking table, removes the person from the reservations queue 
 *      for this parking spot. The key with the same index as the queue is also 
 *      removed.
 */
export function leave_spot(parking: ParkingTable, spot: Spot, 
                           person: Person): boolean {
    if (parking.parked[spot] !== person) {
        return false;
     } else { 
        parking.spots[spot] = null; 
        const reservs = parking.reserved[spot];
        const length = reservs.length;

        for(let i = 0; i < length; i++) {
            const reserv = qhead(reservs); 
            dequeue(reservs);
            if (reserv.person === person) { 
                break; 
            } 
        }
        update_park("saved_parking_lots.json", parking); 
        return true;
    }
}
