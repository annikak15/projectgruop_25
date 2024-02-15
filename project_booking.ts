import { type ProbingFunction, type HashFunction, type ProbingHashtable,
        probe_linear, ph_empty, ph_delete, ph_insert, ph_keys, ph_lookup
} from '../lib/hashtables'

//1. göra hashtable som lägger in en person baserat på vad för parkeringsplats den vill ha 
//2. Id: personnummer, value: sparar personens bil, 
//3. Behöver kolla/se till 
//      - antal parkeringsplatser (gör bara hastable som tar in så många som det finns)
//      - att en person finns med i både plats-tablet och info-table 
//4. Kolla på hur man gör ett bokningssystem 
//5. Lägg till något sätt att välja parkeringsplats kanske? 
//   kanske utöka person - typen 
//   fixa person-tablet? 
//   Hitta något sätt att visa upp alla parkeringar, typ choose_parking, där man får alternativ?
//   Fortsätter att fråga tills man ger ett accepterat svar eller avbryter? 
//   Kolla på hur det skulle se ut med en hemsida?  
//
//typer: 
//car/person - record
//key - id/önskad parkeringsplats? 
//parkingspot - occupied/empty? 
//
//funktioner: 
//make_parking_table (ev type parkingTable?)
//leave_spot 
//park_at 
//

type person = number; //TEMPORÄRT!!!
type ParkingTable = ProbingHashtable<number, person>; 

/**
 * 
 * @param person 
 * @param size 
 * @returns 
 */
export function make_parking_table(size: number): ParkingTable{
    //Ska returnera ett tomt hashtable med så många platser som parkeringen ska ha 
    const hash_func : HashFunction<number> = (key : number) => key;  
    const table: ParkingTable = ph_empty(size, probe_linear(hash_func)); 
    return table; 
}

/**
 * 
 * @param parking 
 * @returns 
 */
export function find_empty_parking(parking: ParkingTable): Array<number> {
    //Ska kolla upp alla parkeringsplatser som är tomma
    //Ska returnera alla platser som användaren kan välja på i form av array?
    const emptySpots: Array<number> = []; 
    for(let i = 0; i < parking.size; i++){
        if(is_empty_spot(parking, i)){
            emptySpots.push(i); 
        } else {}
    }
    return emptySpots; 
}

function is_empty_spot(parking: ProbingHashtable<number, number>, spot: number): boolean {
    return ph_lookup(parking, spot) === (undefined || null) ? true : false;  
}


export function park_at(parking: ParkingTable, spot: number, person: person): boolean { //Void kanske?
    return ph_insert(parking, spot, person)
}


function leave_spot(parking: ParkingTable, spot: number): boolean {
    return ph_delete(parking, spot); 
}

