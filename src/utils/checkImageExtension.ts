import { allowedImageExtensions } from "../config";

export const checkImageExtension = (imageExtension: string): string => {
    if (!allowedImageExtensions.includes(imageExtension)) {
        return allowedImageExtensions.map((e) => e.replace(/.*\//, "")).join(", ");
    }
    else return "";
};