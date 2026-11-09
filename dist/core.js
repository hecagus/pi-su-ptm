export const DECIMAL_COUNT = 2_000_000;
export const EXPANDED_DECIMAL_COUNT = 10_000_000;
export const DEFAULT_DATE_ORDER = 'DMY';
export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
export const pad = n => String(n).padStart(2, '0');
export function isValidDate(day, month, year) {
  if (![day,month,year].every(Number.isInteger) || year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31,30,31,30,31,31,30,31,30,31][month-1];
}
export function makeDateSequence(day,month,year,withYear=false) {
  return pad(day)+pad(month)+(withYear ? String(year).padStart(4,'0') : '');
}
export function flexibleDateSequence(day,month,year,{withYear=false,order=DEFAULT_DATE_ORDER,shortYear=false}={}) {
  if(!['MDY','DMY'].includes(order))throw new Error('Orden de fecha inválido.');
  const prefix=order==='MDY'?pad(month)+pad(day):pad(day)+pad(month);
  const fullYear=String(year).padStart(4,'0');
  return prefix+(withYear?(shortYear?fullYear.slice(-2):fullYear):'');
}
export function findMatches(digits, sequence) {
  if (!/^\d{1,24}$/.test(sequence)) throw new Error('Escribe de 1 a 24 dígitos, sin espacios ni signos.');
  const positions=[];
  let from=0,index;
  while((index=digits.indexOf(sequence,from))!==-1){positions.push(index);from=index+1;}
  return positions;
}
export function getExcerpt(digits,index,length,context=18){
  const start=Math.max(0,index-context),end=Math.min(digits.length,index+length+context);
  return {start,end,before:digits.slice(start,index),match:digits.slice(index,index+length),after:digits.slice(index+length,end)};
}
