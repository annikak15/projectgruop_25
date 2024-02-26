import { Spot, ParkingTable, is_empty_spot } from "./project_booking";
/**
 * Returns the largest integer that is equal to or less then a number.
 * @param {number} number A number
 * @returns {number} largest closest integer to the number.
 */
function math_floor(number: number): number {
    const make_int = parseInt(number.toString());
    return make_int > number ? make_int - 1 : make_int;
}

console.log(math_floor(3.7));
console.log(math_floor(-2.1));
console.log(math_floor(0));

/**
 * A timer that decreases every one second from a total amount of seconds.
 * @param {number} parking_time The amount of seconds to park
 */
export function start_timer(parking_time: number, spot: Spot, park: ParkingTable): void {
    let start = parking_time;
    let timer: any = setInterval(() => {
        let hours = math_floor(start / 60 / 60);
        let calculation = start - hours * 60 *60;
        let minutes = math_floor(calculation / 60);
        calculation = calculation - minutes * 60;
        let seconds = calculation;

        const hour_check = hours < 24 ? '0' + hours : hours;
        const minute_check = minutes < 60 ? '0' + minutes : minutes;
        const second_check = seconds < 60 ? '0' + seconds : seconds;

        let time_check = hour_check + ':' + minute_check + ':' + second_check;
        console.log("time:", time_check);
        if(start <= 0) {
            clearInterval(timer);
            time_check = "Parking time is over"
            console.log('finnished', time_check);
        } else if (is_empty_spot(park, spot)) {
            clearInterval(timer); 
            time_check = "You left your spot"; 
            console.log('finnished', time_check);
        }
        start--;
    }, 1000)
}


// 1 hour
// start_timer(3600);