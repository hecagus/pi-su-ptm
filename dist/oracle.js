import {isValidDate,pad} from './core.js';
export function dateParts(date=new Date()) { return {year:date.getFullYear(),month:date.getMonth()+1,day:date.getDate()}; }
export function packedDate({day,month,year}) { return `${pad(month)}${pad(day)}${String(year).padStart(4,'0')}`; }
export function dateCode({day,month,year}) { return year*10000+month*100+day; }
export function validateBirth(birth,today=dateParts()) {
  if(!isValidDate(birth.day,birth.month,birth.year))throw new Error('Revisa tu fecha de nacimiento: ese día no existe.');
  if(dateCode(birth)>dateCode(today))throw new Error('Tu nacimiento no puede estar en el futuro.');
}
export function fictionalOracle(birth,today,digits,universe=0) {
  validateBirth(birth,today);
  if(!Number.isInteger(universe)||universe<0||universe>1_000_000)throw new Error('Universo inválido.');
  if(digits.length<12||!/^[0-9]+$/.test(digits))throw new Error('Faltan los decimales de π.');
  const born=packedDate(birth),current=packedDate(today);
  const sum=BigInt(born)+BigInt(current);
  const offset=Number((sum+BigInt(universe)*314159n)%BigInt(digits.length-11));
  const fragment=digits.slice(offset,offset+12);
  const days=Number(BigInt(fragment)%25550n)+1;
  // Gregorian civil days in UTC: daylight saving changes cannot shift the date.
  const target=new Date(0);target.setUTCFullYear(today.year,today.month-1,today.day);target.setUTCHours(12,0,0,0);target.setUTCDate(target.getUTCDate()+days);
  return {born,current,sum:sum.toString(),offset,fragment,days,target:target.toISOString().slice(0,10),universe};
}
