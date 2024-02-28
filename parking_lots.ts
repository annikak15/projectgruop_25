import { ParkingTable } from "./project_booking";

import { empty } from "./lib/prio_queue";

import * as fs from 'fs';

/**
 * Makes an ParkingTable with empty parking spots and no reservations 
 * @param length the number of parking spots in the parking lot 
 * @returns Returns an empty ParkingTable 
 */
function make_parking_table(length: number, name: string): ParkingTable{ 
    const table: ParkingTable = { 
        name: name,
        keys: new Array(length), 
        parked: new Array(length), 
        reserved: new Array(length), 
        size: 0 };
    for(let i = 0; i < table.reserved.length; i++) {
        table.reserved[i] = empty(); 
    }
    return table; 
}

/**
 * set_up is used to reset the system compleatly, emptying all parking lots.
 * There is an additional test lot and an empty parking lot that is used 
 * for testing
 */
export function set_up():void {
    //All parkinglots you can reserv a parking spot in
    let Ångströmslaboratoriet = make_parking_table(9, "ångströmslaboratoriet"); 
    let Husargatan = make_parking_table(148, "husargatan");
    let StudenternasIP = make_parking_table(110, "studenternas"); 
    let Grimhild = make_parking_table(400, "grimhild"); 
    let Centralgaraget = make_parking_table(350, "centralgaraget"); 
    let testLot = make_parking_table(3, "test"); //Test lot 
    let emptyLot = make_parking_table(0, "empty"); //Empty parking lot

    //For storing the empty parking lots in the file 
    let parkingLots: Array<ParkingTable> = [Ångströmslaboratoriet, 
                                            Husargatan,
                                            StudenternasIP,
                                            Grimhild,
                                            Centralgaraget, 
                                            testLot, 
                                            emptyLot]

    save_parking_to_file("saved_parking_lots.json", parkingLots);
}


/**
 * Saves parking lots to a JSON file, serializes the parking array
 * @param file the name of the file
 * @param parks The array of all parking lots in the bookingsystem 
 */
export function save_parking_to_file(file: string, parks: Array<ParkingTable>): void{
    const serialized_parks = JSON.stringify(parks); 
    fs.writeFileSync(file, serialized_parks); 
}

/**
 * Deserializes a serialized array of parkingTables, test if data is retrieved 
 * correctly, else it returns undefined together with an error message. 
 * @param file the name of the file you want to retrieve data from 
 * @returns returns an array of parkingTables or undefined if an error occured 
 */
export function load_parks_from_file(file: string): Array<ParkingTable> | undefined{
    try {
        const serialized_park = fs.readFileSync(file, 'utf-8');
        return JSON.parse(serialized_park);
    } catch (error) {
        console.error('Error loading parking lot', error); 
        return undefined
    }
}

/**
 * Updates the parkingTable array that is saved in the JSON file 
 * @param file the file name 
 * @param park The parkingtable you are updating 
 * @modifies the parks array with all parkinglots 
 */
export function update_park(file: string, park: ParkingTable): void{
    let parks = load_parks_from_file(file); 
    if (parks !== undefined) {
        for(let i = 0; i < parks.length; i++){
            const foundPark = parks[i]; 
            if(foundPark.name === park.name) {
                parks[i] = park; 
                save_parking_to_file(file, parks); 
            } else {}
        }
    } else {}
}

/**
 * Retrieves a parkingTable from the park-array saved in the JSON file 
 * @param file the name of the JSON file 
 * @param parkLot The name of the parkinglot you want to retrieve 
 * @returns returns the parkingTable if it is found in the array, else it 
 *      returns undefined 
 */
export function get_park_from_parkingLots(file: string, parkLot: string): ParkingTable | undefined {
    const parks = load_parks_from_file(file); 
    if (parks !== undefined) {
        for(let i = 0; i < parks.length; i++) {
            const park = parks[i]; 
            if (park.name === parkLot){
                return park;
            } else {}
        }
    } else {
        return undefined; 
    }
}


//set_up(); //Sparar alla (tomma) parkeringar till filen 

//console.log(load_parks_from_file("saved_parking_lots.json")); //Skriver ut alla sparade parkeringar i array 

//console.log(get_park_from_parkingLots("saved_parking_lots.json", "ångströmslaboratoriet")); //Skriver ut parkeringen från ångström 

//console.log(update_park("saved_parking_lots.json", Ångströmslaboratoriet)); //Skriver int ut något, men ändrar i JSON filen 