import renderDate from "./renderDate";

export default function isToday(date: Date) {
    return renderDate(date) == renderDate(new Date());
}