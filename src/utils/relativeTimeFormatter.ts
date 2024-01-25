const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always", });

interface IDivisions { amount: number; name: Intl.RelativeTimeFormatUnit; }


const divisions: IDivisions[] = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
];


export const formatRelativeTime = (date: Date) => 
{
    let duration = (date.valueOf() - new Date().valueOf()) / 1000;

    for (let i = 0; i < divisions.length; i++) 
    {
        const division = divisions[i];

        if (Math.abs(duration) < division.amount) 
        {
            return rtf.format(Math.round(duration), division.name);
        }

        duration /= division.amount;
    }
};