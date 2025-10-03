

export const Utils = () => {
    function capitalizeEachWord(text: string): string {
        return text
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    function getJakartaTimeISO(): string {
        const now = new Date();
        const offsetMinutes = 7 * 60;
        const localTime = now.getTime() + offsetMinutes * 60 * 1000;
        return new Date(localTime).toISOString();
    }

    function formatDateToCustom(dateInput: string | Date): string {
        const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

        const tzOffset = 7 * 60; // UTC+7 dalam menit
        const localDate = new Date(date.getTime() + tzOffset * 60000);

        const year = localDate.getUTCFullYear();
        const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(localDate.getUTCDate()).padStart(2, "0");
        const hours = String(localDate.getUTCHours()).padStart(2, "0");
        const minutes = String(localDate.getUTCMinutes()).padStart(2, "0");
        const seconds = String(localDate.getUTCSeconds()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }


    return { capitalizeEachWord, getJakartaTimeISO, formatDateToCustom };
}